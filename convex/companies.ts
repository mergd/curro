import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    website: v.string(),
    jobBoardUrl: v.string(),
    sourceType: v.union(v.literal("ashby"), v.literal("greenhouse"), v.literal("other")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("companies", args);
  },
});
