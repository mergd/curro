import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserId } from "./_utils";

export const get = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const update = mutation({
  args: {
    yearsOfExperience: v.optional(v.number()),
    interests: v.optional(v.array(v.string())),
    fourFacts: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userProfile) {
      await ctx.db.patch(userProfile._id, args);
    } else {
      await ctx.db.insert("userProfiles", { userId, ...args });
    }
  },
});
