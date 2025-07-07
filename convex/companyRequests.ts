import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./_utils";

export const submit = mutation({
  args: {
    companyName: v.string(),
    companyWebsite: v.optional(v.string()),
    jobBoardUrl: v.string(),
  },
  returns: v.id("companyRequests"),
  handler: async (ctx, args) => {
    // Check if a similar request already exists
    const existingRequest = await ctx.db
      .query("companyRequests")
      .filter((q) => q.eq(q.field("companyName"), args.companyName))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("A request for this company is already pending review");
    }

    // Check if company already exists
    const existingCompany = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("name"), args.companyName))
      .first();

    if (existingCompany) {
      throw new Error("This company already exists in our database");
    }

    return await ctx.db.insert("companyRequests", {
      ...args,
      status: "pending",
    });
  },
});

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("duplicate"),
      ),
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    requests: v.array(
      v.object({
        _id: v.id("companyRequests"),
        _creationTime: v.number(),
        companyName: v.string(),
        companyWebsite: v.optional(v.string()),
        jobBoardUrl: v.string(),
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected"),
          v.literal("duplicate"),
        ),
        adminNotes: v.optional(v.string()),
        processedAt: v.optional(v.number()),
        processedBy: v.optional(v.id("users")),
      }),
    ),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { status, limit = 50, offset = 0 } = args;

    let query = ctx.db.query("companyRequests");

    if (status) {
      query = query.filter((q) => q.eq(q.field("status"), status));
    }

    const allRequests = await query.order("desc").collect();

    const total = allRequests.length;
    const requests = allRequests.slice(offset, offset + limit);

    return { requests, total };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("companyRequests"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("duplicate"),
    ),
    adminNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    await ctx.db.patch(args.id, {
      status: args.status,
      adminNotes: args.adminNotes,
      processedAt: Date.now(),
      processedBy: user._id,
    });

    return null;
  },
});

export const get = query({
  args: { id: v.id("companyRequests") },
  returns: v.union(
    v.object({
      _id: v.id("companyRequests"),
      _creationTime: v.number(),
      companyName: v.string(),
      companyWebsite: v.optional(v.string()),
      jobBoardUrl: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("duplicate"),
      ),
      adminNotes: v.optional(v.string()),
      processedAt: v.optional(v.number()),
      processedBy: v.optional(v.id("users")),
    }),
    v.null(),
  ),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(id);
  },
});
