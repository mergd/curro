import { Crons } from "@convex-dev/crons";
import { v } from "convex/values";

import { api, components, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = new Crons(components.crons);

export const setupCronJobs = internalMutation({
  handler: async (ctx) => {
    // Register a cron job to scrape all companies every 24 hours
    await crons.register(
      ctx,
      {
        kind: "cron",
        cronspec: "0 0 * * *", // Every 24 hours at midnight
      },
      internal.scraper.scrapeAllCompanies,
      {},
      "scrapeAllCompanies",
    );

    // Register a cron job to clean up old errors every 6 hours
    await crons.register(
      ctx,
      {
        kind: "cron",
        cronspec: "0 */6 * * *", // Every 6 hours
      },
      internal.cronJobs.cleanupOldErrors,
      {},
      "cleanupOldErrors",
    );

    console.log("Cron jobs registered successfully");
  },
});

export const listCronJobs = internalMutation({
  handler: async (ctx) => {
    return await crons.list(ctx);
  },
});

export const deleteCronJob = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    await crons.delete(ctx, { name });
  },
});

export const cleanupOldErrors = internalMutation({
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
