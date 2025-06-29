"use node";

import type { BackoffInfo, ErrorInfo } from "./utils/backoff";

import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";
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

// Helper function to add an error to the company's error log and update backoff
async function addCompanyError(
  ctx: any,
  companyId: string,
  errorType: string,
  errorMessage: string,
  url?: string,
) {
  const now = Date.now();
  const cutoffTime = now - TWENTY_FOUR_HOURS_MS;

  // Get current company data
  const company = await ctx.runQuery(api.companies.get, { id: companyId });
  if (!company) return;

  // Filter out errors older than 24 hours and add the new error
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

  // Calculate new backoff info based on the failure
  const newBackoffInfo = calculateBackoffAfterFailure(
    company.backoffInfo,
    errorType,
    recentErrors,
  );

  // Update the company with the new error list and backoff info
  await ctx.runMutation(api.companies.update, {
    id: companyId,
    scrapingErrors: recentErrors,
    backoffInfo: newBackoffInfo,
  });

  console.log(
    `Added error for company ${companyId}: ${errorType} - ${errorMessage}. ` +
      `Recent errors: ${recentErrors.length}, Backoff: ${getBackoffStatusDescription(newBackoffInfo)}`,
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

  // Legacy check: also check old error-based logic as fallback
  if (company.scrapingErrors) {
    const now = Date.now();
    const cutoffTime = now - TWENTY_FOUR_HOURS_MS;
    const recentErrors = company.scrapingErrors.filter(
      (error: any) => error.timestamp > cutoffTime,
    );

    if (recentErrors.length >= MAX_ERRORS_PER_24H) {
      console.log(
        `Skipping company ${companyId} due to ${recentErrors.length} errors in the last 24 hours (legacy check)`,
      );
      return {
        shouldSkip: true,
        reason: `${recentErrors.length} errors in 24h`,
      };
    }
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

      // 2. Fetch the job board page using simple HTTP request
      const response = await fetch(jobBoardUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) JobScraper/1.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        await addCompanyError(
          ctx,
          companyId,
          "fetch_failed",
          errorMsg,
          jobBoardUrl,
        );
        throw new Error(errorMsg);
      }

      const html = await response.text();
      console.log("HTML fetched, length:", html.length);
      console.log("HTML:", html.slice(0, 20000));

      // 3. Extract job links based on known sourceType
      let links: string[] = [];
      let atsType = sourceType;

      if (sourceType === "ashby") {
        const adapter = new AshbyAdapter();
        links = adapter.extractJobLinks(html, jobBoardUrl);
      } else if (sourceType === "greenhouse") {
        const adapter = new GreenhouseAdapter();
        links = adapter.extractJobLinks(html, jobBoardUrl);
      } else {
        const adapter = new GenericAdapter();
        links = await adapter.extractJobLinksAsync(html, jobBoardUrl);
        atsType = "other";
      }

      const totalFound = links.length;

      console.log(
        `Using ${sourceType} adapter, found ${totalFound} jobs for company ${companyId}`,
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
      await addCompanyError(
        ctx,
        companyId,
        "scraping_failed",
        errorMessage,
        jobBoardUrl,
      );

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
  },
  handler: async (ctx, { jobId, jobUrl }) => {
    // Get the job to find the company ID for error tracking
    const job = await ctx.runQuery(api.jobs.get, { id: jobId });
    const companyId = job?.companyId;

    try {
      console.log(`Fetching job details from: ${jobUrl}`);

      // 1. Rate limiting: Wait before making the request to avoid being banned
      console.log(
        `Waiting ${JOB_DETAILS_DELAY_MS}ms before fetching job details...`,
      );
      await new Promise((resolve) => setTimeout(resolve, JOB_DETAILS_DELAY_MS));

      // 2. Fetch the individual job page
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
          await addCompanyError(
            ctx,
            companyId,
            "job_fetch_failed",
            errorMsg,
            jobUrl,
          );
        }

        return { success: false };
      }

      const html = await response.text();

      // 3. Parse detailed job information using AI
      const jobDetails = await parseJobDetails(html);

      console.log("jobDetails", jobDetails);
      console.log("jobUrl", jobUrl);

      if (Object.keys(jobDetails).length > 0) {
        // Remove fields that shouldn't be updated (url is already set when job is created)
        const { url, ...updateableFields } = jobDetails;

        if (Object.keys(updateableFields).length > 0) {
          await ctx.runMutation(api.jobs.update, {
            id: jobId,
            ...updateableFields,
          });
          console.log(`Enhanced job details for: ${jobUrl}`);
        }
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Failed to fetch job details for ${jobUrl}:`, error);

      // Track the error for this company if we have the companyId
      if (companyId) {
        await addCompanyError(
          ctx,
          companyId,
          "job_details_failed",
          errorMessage,
          jobUrl,
        );
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
