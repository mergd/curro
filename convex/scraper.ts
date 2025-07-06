import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import { action, internalAction, internalMutation } from "./_generated/server";
import { AshbyAdapter } from "./adapters/ashby";
import { GenericAdapter } from "./adapters/generic";
import { GreenhouseAdapter } from "./adapters/greenhouse";
import { createUnionValidator, SOURCE_TYPES, WEEK_IN_MS } from "./constants";
import { parseJobDetails } from "./parsers/aiParser";
import {
  calculateBackoffAfterFailure,
  calculateBackoffAfterSuccess,
  getBackoffStatusDescription,
  shouldSkipDueToBackoff,
} from "./utils/backoff";

// Simple rate limiting with delays
const JOB_BOARD_DELAY_MS = 1000; // 1 second between job board requests
const JOB_DETAILS_DELAY_MS = 1000; // 1 second between job detail requests

// Error tracking constants
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_ERRORS_PER_24H = 10; // Maximum errors before marking company as problematic

// Helper function to record scraping metrics
async function recordScrapingMetrics(
  ctx: any,
  companyId: string,
  metrics: {
    success: boolean;
    totalJobsFound?: number;
    newJobsCreated?: number;
    existingJobsSkipped?: number;
    jobsSoftDeleted?: number;
    scrapeDurationMs?: number;
    atsType?: string;
    errorType?: string;
    errorMessage?: string;
  },
) {
  const now = Date.now();
  const netJobChange =
    (metrics.newJobsCreated || 0) - (metrics.jobsSoftDeleted || 0);

  await ctx.runMutation(api.scrapingMetrics.create, {
    companyId,
    scrapedAt: now,
    success: metrics.success,
    totalJobsFound: metrics.totalJobsFound,
    newJobsCreated: metrics.newJobsCreated,
    existingJobsSkipped: metrics.existingJobsSkipped,
    jobsSoftDeleted: metrics.jobsSoftDeleted,
    scrapeDurationMs: metrics.scrapeDurationMs,
    atsType: metrics.atsType,
    errorType: metrics.errorType,
    errorMessage: metrics.errorMessage,
    netJobChange,
  });

  console.log(
    `Recorded scraping metrics for company ${companyId}: ` +
      `${metrics.newJobsCreated || 0} new, ${metrics.existingJobsSkipped || 0} skipped, ` +
      `${metrics.jobsSoftDeleted || 0} deleted, net change: ${netJobChange}`,
  );
}

// Helper function to check if a company should be skipped due to backoff
async function shouldSkipCompanyDueToBackoff(
  ctx: any,
  companyId: string,
): Promise<{ shouldSkip: boolean; reason?: string }> {
  const company = await ctx.runQuery(api.companies.get, { id: companyId });
  if (!company) return { shouldSkip: false };

  // Check intelligent backoff
  const shouldSkipBackoff = shouldSkipDueToBackoff(company.backoffInfo);
  if (shouldSkipBackoff) {
    const reason = getBackoffStatusDescription(company.backoffInfo);
    console.log(`Skipping company ${companyId} due to backoff: ${reason}`);
    return { shouldSkip: true, reason };
  }

  return { shouldSkip: false };
}

// Helper function to mark a successful scrape and reduce backoff
async function markSuccessfulScrape(ctx: any, companyId: string) {
  const company = await ctx.runQuery(api.companies.get, { id: companyId });
  if (!company) return;

  // Calculate new backoff info after success
  const newBackoffInfo = calculateBackoffAfterSuccess(company.backoffInfo);

  // Update the company with reduced backoff
  await ctx.runMutation(api.companies.update, {
    id: companyId,
    backoffInfo: newBackoffInfo,
    lastScraped: Date.now(),
  });

  console.log(
    `Successful scrape for company ${companyId}. Backoff: ${getBackoffStatusDescription(newBackoffInfo)}`,
  );
}

export const scrape = action({
  args: {
    companyId: v.id("companies"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    skippedDueToErrors: v.optional(v.boolean()),
    atsType: v.optional(v.string()),
    totalFound: v.optional(v.number()),
    newJobsCount: v.optional(v.number()),
    skippedJobsCount: v.optional(v.number()),
    softDeletedCount: v.optional(v.number()),
  }),
  handler: async (ctx, { companyId }) => {
    const company = await ctx.runQuery(api.companies.get, { id: companyId });
    if (!company) {
      throw new Error("Company not found");
    }

    // Check if company should be skipped due to backoff
    const skipResult = await shouldSkipCompanyDueToBackoff(ctx, companyId);
    if (skipResult.shouldSkip) {
      return {
        success: false,
        error: `Company skipped: ${skipResult.reason}`,
        skippedDueToErrors: true,
      };
    }

    // Schedule the actual scraping work as an internal action
    const startTime = Date.now();
    const result: {
      success: boolean;
      error?: string;
      atsType?: string;
      totalFound?: number;
      newJobsCount?: number;
      skippedJobsCount?: number;
      softDeletedCount?: number;
    } = await ctx.runAction(internal.scraper.fetchAndParseJobs, {
      companyId,
      jobBoardUrl: company.jobBoardUrl,
      sourceType: company.sourceType,
    });

    // Mark successful scrape and reduce backoff if the scraping was successful
    if (result.success) {
      await markSuccessfulScrape(ctx, companyId);
    }

    // Record scraping metrics regardless of success
    const scrapeEnd = Date.now();
    await recordScrapingMetrics(ctx, companyId, {
      success: result.success,
      totalJobsFound: result.totalFound,
      newJobsCreated: result.newJobsCount,
      existingJobsSkipped: result.skippedJobsCount,
      jobsSoftDeleted: result.softDeletedCount,
      atsType: result.atsType,
      scrapeDurationMs: scrapeEnd - startTime,
      errorType: result.success ? undefined : "scraping_failed",
      errorMessage: result.error,
    });

    return result;
  },
});

export const fetchAndParseJobs = internalAction({
  args: {
    companyId: v.id("companies"),
    jobBoardUrl: v.string(),
    sourceType: createUnionValidator(SOURCE_TYPES),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    atsType: v.optional(v.string()),
    totalFound: v.optional(v.number()),
    newJobsCount: v.optional(v.number()),
    skippedJobsCount: v.optional(v.number()),
    softDeletedCount: v.optional(v.number()),
  }),
  handler: async (ctx, { companyId, jobBoardUrl, sourceType }) => {
    try {
      console.log(`Fetching jobs from: ${jobBoardUrl}`);

      // 1. Rate limiting: Wait before making the request to avoid being banned
      console.log(
        `Waiting ${JOB_BOARD_DELAY_MS}ms before fetching job board...`,
      );
      await new Promise((resolve) => setTimeout(resolve, JOB_BOARD_DELAY_MS));

      // 2. Fetch the job board page - use enhanced fetching for Ashby
      let html: string;
      let fetchMethod = "simple";

      // Use simple fetch for other sources
      const response = await fetch(jobBoardUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) JobScraper/1.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        await ctx.runMutation(internal.scraper.addCompanyError, {
          id: companyId,
          errorType: "fetch_failed",
          errorMessage: errorMsg,
          url: jobBoardUrl,
        });
        throw new Error(errorMsg);
      }

      html = await response.text();

      console.log("HTML fetched, length:", html.length);
      console.log("HTML:", html.slice(0, 20000));

      // 3. Extract job links based on known sourceType
      let links: string[] = [];
      let atsType = sourceType;

      if (sourceType === "ashby") {
        // Use JSDOM-based scraping for Ashby since it requires JavaScript execution
        const jsdomResult = await ctx.runAction(
          internal.adapters.jsdom.scrapeWithJSDOM,
          { url: jobBoardUrl },
        );

        if (jsdomResult.success && jsdomResult.html) {
          const adapter = new AshbyAdapter();
          links = adapter.extractJobLinks(jsdomResult.html, jobBoardUrl);
          console.log(
            `Ashby JSDOM scraping successful: ${links.length} jobs found`,
          );
        } else {
          throw new Error(
            `Ashby JSDOM scraping failed: ${jsdomResult.error || "Unknown error"}`,
          );
        }
      } else if (sourceType === "greenhouse") {
        const adapter = new GreenhouseAdapter();
        links = await adapter.extractJobLinks(html, jobBoardUrl);
      } else {
        console.log(
          `No adapter found for ${jobBoardUrl}, using generic parser`,
        );
        const adapter = new GenericAdapter();
        links = await adapter.extractJobLinks(html, jobBoardUrl);
        atsType = "other";
      }

      const totalFound = links.length;

      console.log(
        `Using ${sourceType} adapter (${fetchMethod}), found ${totalFound} jobs for company ${companyId}`,
      );

      // 4. Process jobs with deduplication
      const now = Date.now();
      const weekAgo = now - WEEK_IN_MS;
      let newJobsCount = 0;
      let skippedJobsCount = 0;

      // Get all currently active job URLs for this company to track which ones are still available
      const activeJobUrls = await ctx.runQuery(
        api.jobs.findActiveJobUrlsByCompany,
        { companyId },
      );

      // Track which URLs we found during this scrape
      const foundUrls = new Set<string>();

      for (const link of links) {
        const absoluteUrl = link.startsWith("http")
          ? link
          : new URL(link, jobBoardUrl).href;

        foundUrls.add(absoluteUrl);

        // Check if job was recently scraped (within a week)
        const recentJob = await ctx.runQuery(
          api.jobs.findRecentlyScrapedByUrl,
          {
            url: absoluteUrl,
            cutoffTime: weekAgo,
          },
        );

        if (recentJob) {
          await ctx.runMutation(api.jobs.updateLastScraped, {
            id: recentJob._id,
            timestamp: now,
          });
          skippedJobsCount++;
          continue;
        }

        const existingJob = await ctx.runQuery(api.jobs.findByUrl, {
          url: absoluteUrl,
        });

        if (existingJob) {
          await ctx.runMutation(api.jobs.update, {
            id: existingJob._id,
            lastScraped: now,
          });
        } else {
          const placeholderTitle =
            absoluteUrl.split("/").pop()?.replace(/[-_]/g, " ") || "Job";

          const jobId = await ctx.runMutation(api.jobs.add, {
            title: placeholderTitle,
            companyId,
            description: "",
            url: absoluteUrl,
            source: `${atsType}-scraper`,
            firstSeenAt: now,
            isFetched: false,
            lastScraped: now,
          });
          newJobsCount++;

          // Schedule job details fetching with rate limiting delay
          await ctx.scheduler.runAfter(
            JOB_DETAILS_DELAY_MS,
            internal.scraper.fetchJobDetails,
            {
              jobId,
              jobUrl: absoluteUrl,
              atsType,
            },
          );
        }
      }

      // Soft delete jobs that are no longer available on the job board
      let softDeletedCount = 0;
      for (const activeUrl of activeJobUrls) {
        if (!foundUrls.has(activeUrl)) {
          // This job is no longer available, soft delete it
          const jobToDelete = await ctx.runQuery(api.jobs.findByUrl, {
            url: activeUrl,
          });

          if (jobToDelete && !jobToDelete.deletedAt) {
            await ctx.runMutation(api.jobs.softDelete, {
              id: jobToDelete._id,
            });
            softDeletedCount++;
            console.log(`Soft deleted job: ${activeUrl}`);
          }
        }
      }

      console.log(`${newJobsCount} new jobs found`);
      console.log(`${skippedJobsCount} skipped jobs`);
      console.log(
        `${softDeletedCount} jobs soft deleted (no longer available)`,
      );

      return {
        success: true,
        atsType,
        totalFound,
        newJobsCount,
        skippedJobsCount,
        softDeletedCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Scraping failed for ${jobBoardUrl}:`, error);

      // Track the error for this company
      await ctx.runMutation(internal.scraper.addCompanyError, {
        id: companyId,
        errorType: "scraping_failed",
        errorMessage: errorMessage,
        url: jobBoardUrl,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

export const fetchJobDetails = internalAction({
  args: {
    jobId: v.id("jobs"),
    jobUrl: v.string(),
    atsType: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, jobUrl, atsType }) => {
    // Get the job to find the company ID for error tracking
    const job = await ctx.runQuery(api.jobs.get, { id: jobId });
    const companyId = job?.companyId;

    try {
      console.log(`Fetching job details from: ${jobUrl}`);

      // 1. Fetch the individual job page
      let html: string;

      // Check if this is an Ashby job page that might need JSDOM
      if (atsType === SOURCE_TYPES[0]) {
        console.log("Ashby job page detected, using JSDOM for job details");
        const jsdomResult = await ctx.runAction(
          internal.adapters.jsdom.scrapeWithJSDOM,
          { url: jobUrl, waitTime: 1000 },
        );

        if (jsdomResult.success && jsdomResult.html) {
          html = jsdomResult.html;
        } else {
          const errorMsg = `Failed to fetch Ashby job details with JSDOM: ${jsdomResult.error}`;
          console.error(errorMsg);

          // Track the error for this company if we have the companyId
          if (companyId) {
            await ctx.runMutation(internal.scraper.addCompanyError, {
              id: companyId,
              errorType: "job_fetch_failed",
              errorMessage: errorMsg,
              url: jobUrl,
            });
          }

          return { success: false };
        }
      } else {
        // Use regular fetch for non-Ashby pages
        const response = await fetch(jobUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; JobScraper/1.0)",
          },
        });

        if (!response.ok) {
          const errorMsg = `Failed to fetch job details: HTTP ${response.status}`;
          console.error(errorMsg);

          // Track the error for this company if we have the companyId
          if (companyId) {
            await ctx.runMutation(internal.scraper.addCompanyError, {
              id: companyId,
              errorType: "job_fetch_failed",
              errorMessage: errorMsg,
              url: jobUrl,
            });
          }

          return { success: false };
        }

        html = await response.text();
      }

      // 2. Parse detailed job information using AI
      const jobDetails = await parseJobDetails(html);

      console.log("jobDetails", jobDetails);
      console.log("jobUrl", jobUrl);

      if (Object.keys(jobDetails).length > 0) {
        // Remove fields that shouldn't be updated (url is already set when job is created)
        const { url, ...updateableFields } = jobDetails;

        if (Object.keys(updateableFields).length > 0) {
          await ctx.runMutation(api.jobs.update, {
            id: jobId,
            isFetched: true,
            ...updateableFields,
          });
          console.log(`Enhanced job details for: ${jobUrl}`);
        }
      } else {
        // Even if no details were parsed, mark as fetched to avoid reprocessing
        await ctx.runMutation(api.jobs.update, {
          id: jobId,
          isFetched: true,
        });
        console.log(`No details parsed but marked as fetched: ${jobUrl}`);
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed to fetch job details for ${jobUrl}:`, error);

      // Track the error for this company if we have the companyId
      if (companyId) {
        await ctx.runMutation(internal.scraper.addCompanyError, {
          id: companyId,
          errorType: "job_details_failed",
          errorMessage: errorMessage,
          url: jobUrl,
        });
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

export const scrapeAllCompanies = internalAction({
  handler: async (
    ctx,
  ): Promise<{ success: boolean; companiesScheduled: number }> => {
    const companies = await ctx.runQuery(api.companies.list);

    console.log(`Starting scheduled scrape for ${companies.length} companies`);

    for (const company of companies) {
      try {
        await ctx.runAction(api.scraper.scrape, { companyId: company._id });
        console.log(`Scheduled scrape for ${company.name}`);

        // Rate limiting: Wait between company scrapes to avoid overwhelming servers
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay between companies
      } catch (error) {
        console.error(`Failed to schedule scrape for ${company.name}:`, error);
      }
    }

    return {
      success: true,
      companiesScheduled: companies.length,
    };
  },
});

export const retryFailedJob = action({
  args: {
    jobId: v.id("jobs"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(api.jobs.get, { id: jobId });
    if (!job) {
      return {
        success: false,
        error: "Job not found",
      };
    }

    try {
      // Schedule job details fetching
      await ctx.scheduler.runAfter(
        0, // Run immediately
        internal.scraper.fetchJobDetails,
        {
          jobId,
          jobUrl: job.url,
          atsType: job.source,
        },
      );

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

export const retryFailedJobsForCompany = action({
  args: {
    companyId: v.id("companies"),
  },
  returns: v.object({
    success: v.boolean(),
    retriedCount: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { companyId }) => {
    try {
      // Get all jobs for the company that haven't been fetched successfully
      const jobs = await ctx.runQuery(api.jobs.findActiveJobsByCompany, {
        companyId,
      });

      const failedJobs = jobs.filter((job) => !job.isFetched);

      let retriedCount = 0;
      for (const job of failedJobs) {
        try {
          // Schedule job details fetching with a small delay between each
          await ctx.scheduler.runAfter(
            retriedCount * 500, // Stagger by 500ms each
            internal.scraper.fetchJobDetails,
            {
              jobId: job._id,
              jobUrl: job.url,
              atsType: job.source,
            },
          );
          retriedCount++;
        } catch (error) {
          console.error(`Failed to retry job ${job._id}:`, error);
        }
      }

      return {
        success: true,
        retriedCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        retriedCount: 0,
        error: errorMessage,
      };
    }
  },
});

export const clearCompanyErrors = action({
  args: {
    companyId: v.id("companies"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { companyId }) => {
    try {
      const company = await ctx.runQuery(api.companies.get, { id: companyId });
      if (!company) {
        return {
          success: false,
          error: "Company not found",
        };
      }

      // Clear errors and reset backoff
      await ctx.runMutation(api.companies.update, {
        id: companyId,
        scrapingErrors: [],
        backoffInfo: {
          level: 0,
          nextAllowedScrape: Date.now(),
          consecutiveFailures: 0,
          totalFailures: 0,
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

export const refetchJob = action({
  args: {
    jobId: v.id("jobs"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { jobId },
  ): Promise<{ success: boolean; error?: string }> => {
    const isAdmin = await ctx.runQuery(api.auth.isAdmin);
    if (!isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const job = await ctx.runQuery(api.jobs.get, { id: jobId });
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    if (!job.url) {
      return { success: false, error: "Job has no URL to refetch." };
    }

    const result = await ctx.runAction(
      internal.scraper.fetchAndParseJobDetail,
      {
        jobId,
        url: job.url,
        companyId: job.companyId,
      },
    );

    return result;
  },
});

export const fetchAndParseJobDetail = internalAction({
  args: {
    jobId: v.id("jobs"),
    url: v.string(),
    companyId: v.id("companies"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { jobId, url, companyId },
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch job detail page: ${response.statusText}`,
        );
      }
      const html = await response.text();

      const parsedDetails = await parseJobDetails(html);

      if (Object.keys(parsedDetails).length === 0) {
        await ctx.runMutation(internal.scraper.addCompanyError, {
          id: companyId,
          errorType: "job_detail_parsing_failed",
          errorMessage: "AI parser returned no details.",
          url,
        });
        return { success: false, error: "Failed to parse job details." };
      }

      await ctx.runMutation(api.jobs.update, {
        id: jobId,
        ...parsedDetails,
        lastScraped: Date.now(),
      });

      return { success: true };
    } catch (error: any) {
      console.error(`Error refetching job ${jobId}:`, error);
      await ctx.runMutation(internal.scraper.addCompanyError, {
        id: companyId,
        errorType: "job_detail_refetch_failed",
        errorMessage: error.message,
        url,
      });
      return { success: false, error: error.message };
    }
  },
});

export const addCompanyError = internalMutation({
  args: {
    id: v.id("companies"),
    errorType: v.string(),
    errorMessage: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, { id, errorType, errorMessage, url }) => {
    const company = await ctx.db.get(id);
    if (!company) return;

    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const cutoffTime = now - TWENTY_FOUR_HOURS_MS;

    const currentErrors = company.scrapingErrors || [];
    const recentErrors = currentErrors.filter(
      (error: any) => error.timestamp > cutoffTime,
    );

    const newError = {
      timestamp: now,
      errorType,
      errorMessage,
      url,
    };

    recentErrors.push(newError);

    const newBackoffInfo = calculateBackoffAfterFailure(
      company.backoffInfo,
      errorType,
      recentErrors,
    );

    await ctx.db.patch(id, {
      scrapingErrors: recentErrors,
      backoffInfo: newBackoffInfo,
    });

    console.log(
      `Added error for company ${id}: ${errorType} - ${errorMessage}. ` +
        `Recent errors: ${recentErrors.length}, Backoff: ${getBackoffStatusDescription(newBackoffInfo)}`,
    );
  },
});
