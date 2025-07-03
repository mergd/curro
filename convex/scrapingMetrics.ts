import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    scrapedAt: v.number(),
    success: v.boolean(),
    totalJobsFound: v.optional(v.number()),
    newJobsCreated: v.optional(v.number()),
    existingJobsSkipped: v.optional(v.number()),
    jobsSoftDeleted: v.optional(v.number()),
    scrapeDurationMs: v.optional(v.number()),
    atsType: v.optional(v.string()),
    errorType: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    netJobChange: v.optional(v.number()),
  },
  returns: v.id("scrapingMetrics"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("scrapingMetrics", args);
  },
});

export const getCompanyMetrics = query({
  args: {
    companyId: v.id("companies"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("scrapingMetrics"),
      _creationTime: v.number(),
      companyId: v.id("companies"),
      scrapedAt: v.number(),
      success: v.boolean(),
      totalJobsFound: v.optional(v.number()),
      newJobsCreated: v.optional(v.number()),
      existingJobsSkipped: v.optional(v.number()),
      jobsSoftDeleted: v.optional(v.number()),
      scrapeDurationMs: v.optional(v.number()),
      atsType: v.optional(v.string()),
      errorType: v.optional(v.string()),
      errorMessage: v.optional(v.string()),
      netJobChange: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, { companyId, limit = 50 }) => {
    return await ctx.db
      .query("scrapingMetrics")
      .withIndex("by_company_and_date", (q) => q.eq("companyId", companyId))
      .order("desc")
      .take(limit);
  },
});

export const getRecentMetrics = query({
  args: {
    hoursBack: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("scrapingMetrics"),
      _creationTime: v.number(),
      companyId: v.id("companies"),
      scrapedAt: v.number(),
      success: v.boolean(),
      totalJobsFound: v.optional(v.number()),
      newJobsCreated: v.optional(v.number()),
      existingJobsSkipped: v.optional(v.number()),
      jobsSoftDeleted: v.optional(v.number()),
      scrapeDurationMs: v.optional(v.number()),
      atsType: v.optional(v.string()),
      errorType: v.optional(v.string()),
      errorMessage: v.optional(v.string()),
      netJobChange: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, { hoursBack = 24, limit = 100 }) => {
    const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000;
    return await ctx.db
      .query("scrapingMetrics")
      .withIndex("by_date", (q) => q.gte("scrapedAt", cutoffTime))
      .order("desc")
      .take(limit);
  },
});

export const getAggregatedStats = query({
  args: {
    companyId: v.optional(v.id("companies")),
    hoursBack: v.optional(v.number()),
  },
  returns: v.object({
    totalScrapes: v.number(),
    successfulScrapes: v.number(),
    failedScrapes: v.number(),
    successRate: v.number(),
    totalNewJobs: v.number(),
    totalDeletedJobs: v.number(),
    netJobGrowth: v.number(),
    avgScrapeDuration: v.optional(v.number()),
  }),
  handler: async (ctx, { companyId, hoursBack = 24 }) => {
    const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000;

    let metrics;
    if (companyId) {
      metrics = await ctx.db
        .query("scrapingMetrics")
        .withIndex("by_company_and_date", (q) =>
          q.eq("companyId", companyId).gte("scrapedAt", cutoffTime),
        )
        .collect();
    } else {
      metrics = await ctx.db
        .query("scrapingMetrics")
        .withIndex("by_date", (q) => q.gte("scrapedAt", cutoffTime))
        .collect();
    }

    const totalScrapes = metrics.length;
    const successfulScrapes = metrics.filter((m) => m.success).length;
    const failedScrapes = totalScrapes - successfulScrapes;
    const successRate = totalScrapes > 0 ? successfulScrapes / totalScrapes : 0;

    const totalNewJobs = metrics.reduce(
      (sum, m) => sum + (m.newJobsCreated || 0),
      0,
    );
    const totalDeletedJobs = metrics.reduce(
      (sum, m) => sum + (m.jobsSoftDeleted || 0),
      0,
    );
    const netJobGrowth = totalNewJobs - totalDeletedJobs;

    const durationsWithValues = metrics
      .map((m) => m.scrapeDurationMs)
      .filter((d): d is number => d !== undefined);
    const avgScrapeDuration =
      durationsWithValues.length > 0
        ? durationsWithValues.reduce((sum, d) => sum + d, 0) /
          durationsWithValues.length
        : undefined;

    return {
      totalScrapes,
      successfulScrapes,
      failedScrapes,
      successRate,
      totalNewJobs,
      totalDeletedJobs,
      netJobGrowth,
      avgScrapeDuration,
    };
  },
});
