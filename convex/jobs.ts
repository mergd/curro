import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { COMPENSATION_TYPES } from "./constants";

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

export const listAll = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, { includeDeleted = false }) => {
    let jobsQuery = ctx.db.query("jobs");

    if (!includeDeleted) {
      jobsQuery = jobsQuery.filter((q) =>
        q.eq(q.field("deletedAt"), undefined),
      );
    }

    const jobs = await jobsQuery.collect();

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
    educationLevel: v.optional(
      v.union(
        v.literal("high-school"),
        v.literal("associates"),
        v.literal("bachelors"),
        v.literal("masters"),
        v.literal("phd"),
        v.literal("bootcamp"),
        v.literal("self-taught"),
        v.literal("no-requirement"),
      ),
    ),
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),
    roleType: v.optional(
      v.union(
        v.literal("software-engineering"),
        v.literal("data-science"),
        v.literal("product-management"),
        v.literal("design"),
        v.literal("marketing"),
        v.literal("sales"),
        v.literal("operations"),
        v.literal("finance"),
        v.literal("hr"),
        v.literal("legal"),
        v.literal("customer-success"),
        v.literal("business-development"),
        v.literal("general-apply"),
      ),
    ),
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
    remoteOptions: v.optional(
      v.union(v.literal("on-site"), v.literal("remote"), v.literal("hybrid")),
    ),
    equity: v.optional(
      v.object({
        offered: v.boolean(),
        percentage: v.optional(v.number()),
        details: v.optional(v.string()),
      }),
    ),
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
    educationLevel: v.optional(
      v.union(
        v.literal("high-school"),
        v.literal("associates"),
        v.literal("bachelors"),
        v.literal("masters"),
        v.literal("phd"),
        v.literal("bootcamp"),
        v.literal("self-taught"),
        v.literal("no-requirement"),
      ),
    ),
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),
    roleType: v.optional(
      v.union(
        v.literal("software-engineering"),
        v.literal("data-science"),
        v.literal("product-management"),
        v.literal("design"),
        v.literal("marketing"),
        v.literal("sales"),
        v.literal("operations"),
        v.literal("finance"),
        v.literal("hr"),
        v.literal("legal"),
        v.literal("customer-success"),
        v.literal("business-development"),
        v.literal("general-apply"),
      ),
    ),
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
    remoteOptions: v.optional(
      v.union(v.literal("on-site"), v.literal("remote"), v.literal("hybrid")),
    ),
    equity: v.optional(
      v.object({
        offered: v.boolean(),
        percentage: v.optional(v.number()),
        details: v.optional(v.string()),
      }),
    ),
    lastScraped: v.optional(v.number()),
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
