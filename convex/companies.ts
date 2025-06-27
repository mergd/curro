import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// Helper to infer the applicant tracking system provider from a URL.
function inferSourceType(url: string): "ashby" | "greenhouse" | "other" {
  const lower = url.toLowerCase();
  if (lower.includes("greenhouse.io")) {
    return "greenhouse";
  }
  if (lower.includes("ashbyhq.com") || lower.includes("ashbyhq")) {
    return "ashby";
  }
  return "other";
}

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});

export const get = query({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    jobBoardUrl: v.string(),
    sourceType: v.optional(
      v.union(v.literal("ashby"), v.literal("greenhouse"), v.literal("other")),
    ),
    numberOfEmployees: v.optional(v.string()),
    stage: v.optional(
      v.union(
        v.literal("pre-seed"),
        v.literal("seed"),
        v.literal("series-a"),
        v.literal("series-b"),
        v.literal("series-c"),
        v.literal("series-d"),
        v.literal("series-e"),
        v.literal("growth"),
        v.literal("pre-ipo"),
        v.literal("public"),
        v.literal("acquired"),
      ),
    ),
    tags: v.optional(v.array(v.string())),
    locations: v.optional(v.array(v.string())),
    recentFinancing: v.optional(
      v.object({
        amount: v.string(),
        date: v.string(),
      }),
    ),
    investors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const finalSourceType =
      args.sourceType ?? inferSourceType(args.jobBoardUrl);
    return await ctx.db.insert("companies", {
      ...args,
      sourceType: finalSourceType,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    jobBoardUrl: v.optional(v.string()),
    sourceType: v.optional(
      v.union(v.literal("ashby"), v.literal("greenhouse"), v.literal("other")),
    ),
    numberOfEmployees: v.optional(v.string()),
    stage: v.optional(
      v.union(
        v.literal("pre-seed"),
        v.literal("seed"),
        v.literal("series-a"),
        v.literal("series-b"),
        v.literal("series-c"),
        v.literal("series-d"),
        v.literal("series-e"),
        v.literal("growth"),
        v.literal("pre-ipo"),
        v.literal("public"),
        v.literal("acquired"),
      ),
    ),
    tags: v.optional(v.array(v.string())),
    locations: v.optional(v.array(v.string())),
    recentFinancing: v.optional(
      v.object({
        amount: v.string(),
        date: v.string(),
      }),
    ),
    investors: v.optional(v.array(v.string())),
    lastScraped: v.optional(v.number()),
    scrapingErrors: v.optional(
      v.array(
        v.object({
          timestamp: v.number(),
          errorType: v.string(),
          errorMessage: v.string(),
          url: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { id, sourceType, jobBoardUrl, ...rest } = args;

    // Determine sourceType only if it wasn't provided but jobBoardUrl was.
    const computedSourceType =
      sourceType ?? (jobBoardUrl ? inferSourceType(jobBoardUrl) : undefined);

    const updateData = {
      ...rest,
      ...(jobBoardUrl !== undefined ? { jobBoardUrl } : {}),
      ...(computedSourceType !== undefined
        ? { sourceType: computedSourceType }
        : {}),
    } as Record<string, unknown>;

    await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const getErrorStats = query({
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    return companies
      .map((company) => {
        const recentErrors = (company.scrapingErrors || []).filter(
          (error) => error.timestamp > twentyFourHoursAgo,
        );

        return {
          id: company._id,
          name: company.name,
          recentErrorCount: recentErrors.length,
          lastError:
            recentErrors.length > 0
              ? recentErrors[recentErrors.length - 1]
              : null,
          isProblematic: recentErrors.length >= 10, // MAX_ERRORS_PER_24H
        };
      })
      .sort((a, b) => b.recentErrorCount - a.recentErrorCount);
  },
});
