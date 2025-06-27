import { mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { parseJobListings, parseJobDetails } from "./parsers/aiParser";

export const scrape = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const company = await ctx.db.get(companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    // Schedule the actual scraping work as an internal action
    await ctx.scheduler.runAfter(0, api.scraper.fetchAndParseJobs, {
      companyId,
      jobBoardUrl: company.jobBoardUrl,
    });

    await ctx.db.patch(company._id, { lastScraped: Date.now() });

    return { success: true };
  },
});

export const fetchAndParseJobs = internalAction({
  args: {
    companyId: v.id("companies"),
    jobBoardUrl: v.string(),
  },
  handler: async (ctx, { companyId, jobBoardUrl }) => {
    try {
      console.log(`Fetching jobs from: ${jobBoardUrl}`);
      
      // 1. Fetch the job board page
      const response = await fetch(jobBoardUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JobScraper/1.0)',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // 2. Parse job listings using AI
      const { jobs } = await parseJobListings(html);
      
      console.log(`Found ${jobs.length} jobs for company ${companyId}`);
      
      // 3. Store jobs in database
      for (const job of jobs) {
        // Convert relative URLs to absolute URLs
        const absoluteUrl = job.url.startsWith('http') 
          ? job.url 
          : new URL(job.url, jobBoardUrl).href;
        
        // Check if job already exists
        const existingJob = await ctx.runQuery(api.jobs.findByUrl, { url: absoluteUrl });
        
        if (!existingJob) {
          // Create new job with basic info
          const jobData = {
            title: job.title,
            companyId,
            description: job.description || "",
            url: absoluteUrl,
            locations: job.locations || null,
            source: "scraper",
            // Include structured fields if available
            educationLevel: job.educationLevel || null,
            yearsOfExperience: job.yearsOfExperience || null,
            roleType: job.roleType || null,
            isInternship: job.isInternship || null,
            internshipRequirements: job.internshipRequirements || null,
            additionalRequirements: job.additionalRequirements || null,
            salaryRange: job.salaryRange || null,
            remoteOptions: job.remoteOptions || null,
            equity: job.equity || null,
          };
          
          const jobId = await ctx.runMutation(api.jobs.add, jobData);
          
          // Schedule detailed parsing if we only have basic info
          if (!job.description || job.description.length < 100) {
            await ctx.scheduler.runAfter(1000, api.scraper.fetchJobDetails, {
              jobId,
              jobUrl: absoluteUrl,
            });
          }
        }
      }
      
      return { success: true, jobCount: jobs.length };
    } catch (error) {
      console.error(`Scraping failed for ${jobBoardUrl}:`, error);
      return { success: false, error: error.message };
    }
  },
});

export const fetchJobDetails = internalAction({
  args: {
    jobId: v.id("jobs"),
    jobUrl: v.string(),
  },
  handler: async (ctx, { jobId, jobUrl }) => {
    try {
      console.log(`Fetching job details from: ${jobUrl}`);
      
      // 1. Fetch the individual job page
      const response = await fetch(jobUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JobScraper/1.0)',
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch job details: HTTP ${response.status}`);
        return { success: false };
      }
      
      const html = await response.text();
      
      // 2. Parse detailed job information using AI
      const jobDetails = await parseJobDetails(html);
      
      // 3. Update the job with detailed information
      const updateData: any = {};
      
      if (jobDetails.description) updateData.description = jobDetails.description;
      if (jobDetails.locations) updateData.locations = jobDetails.locations;
      if (jobDetails.educationLevel) updateData.educationLevel = jobDetails.educationLevel;
      if (jobDetails.yearsOfExperience) updateData.yearsOfExperience = jobDetails.yearsOfExperience;
      if (jobDetails.roleType) updateData.roleType = jobDetails.roleType;
      if (jobDetails.isInternship !== undefined) updateData.isInternship = jobDetails.isInternship;
      if (jobDetails.internshipRequirements) updateData.internshipRequirements = jobDetails.internshipRequirements;
      if (jobDetails.additionalRequirements) updateData.additionalRequirements = jobDetails.additionalRequirements;
      if (jobDetails.salaryRange) updateData.salaryRange = jobDetails.salaryRange;
      if (jobDetails.remoteOptions) updateData.remoteOptions = jobDetails.remoteOptions;
      if (jobDetails.equity) updateData.equity = jobDetails.equity;
      
      if (Object.keys(updateData).length > 0) {
        await ctx.runMutation(api.jobs.update, { id: jobId, ...updateData });
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to fetch job details for ${jobUrl}:`, error);
      return { success: false, error: error.message };
    }
  },
});

