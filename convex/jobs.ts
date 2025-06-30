import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  COMPENSATION_TYPES,
  createUnionValidator,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  REMOTE_OPTIONS,
  ROLE_TYPES,
} from "./constants";

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, { id }) => {
    const job = await ctx.db.get(id);
    if (!job) {
      return null;
    }
    const company = await ctx.db.get(job.companyId);
    return { ...job, company };
  },
});

export const list = query({
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(20);

    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      }),
    );

    return jobsWithCompany;
  },
});

export const listAll = query({
  args: {
    includeDeleted: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { includeDeleted = false, limit = 20 }) => {
    if (limit) {
      limit = Math.min(limit, 20);
    }

    let jobsQuery = ctx.db.query("jobs");

    if (!includeDeleted) {
      jobsQuery = jobsQuery.filter((q) =>
        q.eq(q.field("deletedAt"), undefined),
      );
    }

    const jobs = await jobsQuery.take(limit);

    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      }),
    );

    return jobsWithCompany;
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    companyId: v.id("companies"),
    description: v.string(),
    url: v.string(),
    locations: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),
    roleType: v.optional(createUnionValidator(ROLE_TYPES)),
    roleSubcategory: v.optional(v.string()),
    employmentType: v.optional(createUnionValidator(EMPLOYMENT_TYPES)),
    isInternship: v.optional(v.boolean()),
    internshipRequirements: v.optional(
      v.object({
        graduationDate: v.optional(v.string()),
        eligiblePrograms: v.optional(v.array(v.string())),
        additionalRequirements: v.optional(v.string()),
      }),
    ),
    additionalRequirements: v.optional(v.string()),
    compensation: v.optional(
      v.union(
        ...COMPENSATION_TYPES.map((type) =>
          v.object({
            type: v.literal(type),
            min: v.optional(v.number()),
            max: v.optional(v.number()),
            currency: v.optional(v.string()),
          }),
        ),
      ),
    ),
    remoteOptions: v.optional(createUnionValidator(REMOTE_OPTIONS)),
    remoteTimezonePreferences: v.optional(v.array(v.string())),
    equity: v.optional(
      v.object({
        offered: v.boolean(),
        percentage: v.optional(v.number()),
        details: v.optional(v.string()),
      }),
    ),
    isFetched: v.optional(v.boolean()),
    firstSeenAt: v.optional(v.number()),
    lastScraped: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", args);
  },
});

export const findByUrl = query({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    return await ctx.db
      .query("jobs")
      .filter((q) => q.eq(q.field("url"), url))
      .unique();
  },
});

export const update = mutation({
  args: {
    id: v.id("jobs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    locations: v.optional(v.array(v.string())),
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),
    roleType: v.optional(createUnionValidator(ROLE_TYPES)),
    roleSubcategory: v.optional(v.string()),
    employmentType: v.optional(createUnionValidator(EMPLOYMENT_TYPES)),
    isInternship: v.optional(v.boolean()),
    internshipRequirements: v.optional(
      v.object({
        graduationDate: v.optional(v.string()),
        eligiblePrograms: v.optional(v.array(v.string())),
        additionalRequirements: v.optional(v.string()),
      }),
    ),
    additionalRequirements: v.optional(v.string()),
    compensation: v.optional(
      v.union(
        ...COMPENSATION_TYPES.map((type) =>
          v.object({
            type: v.literal(type),
            min: v.optional(v.number()),
            max: v.optional(v.number()),
            currency: v.optional(v.string()),
          }),
        ),
      ),
    ),
    remoteOptions: v.optional(createUnionValidator(REMOTE_OPTIONS)),
    remoteTimezonePreferences: v.optional(v.array(v.string())),
    equity: v.optional(
      v.object({
        offered: v.boolean(),
        percentage: v.optional(v.number()),
        details: v.optional(v.string()),
      }),
    ),
    lastScraped: v.optional(v.number()),
    isFetched: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
  },
});

export const findRecentlyScrapedByUrl = query({
  args: {
    url: v.string(),
    cutoffTime: v.number(),
  },
  handler: async (ctx, { url, cutoffTime }) => {
    return await ctx.db
      .query("jobs")
      .filter((q) =>
        q.and(
          q.eq(q.field("url"), url),
          q.gte(q.field("lastScraped"), cutoffTime),
        ),
      )
      .unique();
  },
});

export const updateLastScraped = mutation({
  args: {
    id: v.id("jobs"),
    timestamp: v.number(),
  },
  handler: async (ctx, { id, timestamp }) => {
    await ctx.db.patch(id, { lastScraped: timestamp });
  },
});

export const softDelete = mutation({
  args: {
    id: v.id("jobs"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { deletedAt: Date.now() });
  },
});

export const findActiveJobsByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

export const findActiveJobUrlsByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return jobs.map((job) => job.url);
  },
});

export const findFailedJobsByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.or(
            q.eq(q.field("isFetched"), false),
            q.eq(q.field("isFetched"), undefined),
          ),
        ),
      )
      .collect();
  },
});

export const listByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      }),
    );

    return jobsWithCompany;
  },
});
