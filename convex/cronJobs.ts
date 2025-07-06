import { cronJobs } from "convex/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

crons.cron(
  "scrape all companies",
  "0 0 * * *", // Every 24 hours at midnight
  internal.scraper.scrapeAllCompanies,
  {},
);

crons.cron(
  "cleanup old errors",
  "0 */12 * * *", // Every 12 hours
  internal.cronJobs.cleanupOldErrors,
  {},
);

export default crons;

export const cleanupOldErrors = internalMutation({
  args: {},
  returns: v.object({
    totalErrorsCleaned: v.number(),
    companiesUpdated: v.number(),
    totalCompaniesChecked: v.number(),
  }),
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    let totalCleaned = 0;
    let companiesUpdated = 0;

    for (const company of companies) {
      if (!company.scrapingErrors || company.scrapingErrors.length === 0) {
        continue;
      }

      // Filter out errors older than 24 hours
      const recentErrors = company.scrapingErrors.filter(
        (error) => error.timestamp > twentyFourHoursAgo,
      );

      // Only update if there were old errors to remove
      if (recentErrors.length < company.scrapingErrors.length) {
        const removedCount =
          company.scrapingErrors.length - recentErrors.length;
        totalCleaned += removedCount;
        companiesUpdated++;

        await ctx.db.patch(company._id, {
          scrapingErrors: recentErrors,
        });

        console.log(
          `Cleaned ${removedCount} old errors for company ${company.name}. ${recentErrors.length} recent errors remain.`,
        );
      }
    }

    console.log(
      `Error cleanup completed: Cleaned ${totalCleaned} errors from ${companiesUpdated} companies.`,
    );

    return {
      totalErrorsCleaned: totalCleaned,
      companiesUpdated,
      totalCompaniesChecked: companies.length,
    };
  },
});
