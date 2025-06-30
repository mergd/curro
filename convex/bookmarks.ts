import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserId } from "./_utils";

export const add = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get user profile
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) {
      // Create user profile if it doesn't exist
      await ctx.db.insert("userProfiles", {
        userId,
        bookmarkedJobIds: [args.jobId],
      });
    } else {
      const currentBookmarks = userProfile.bookmarkedJobIds || [];

      // Check if job is already bookmarked
      if (currentBookmarks.includes(args.jobId)) {
        throw new Error("Job already bookmarked");
      }

      // Add job to bookmarks
      await ctx.db.patch(userProfile._id, {
        bookmarkedJobIds: [...currentBookmarks, args.jobId],
      });
    }
  },
});

export const remove = mutation({
  args: {
    jobId: v.id("jobs"),
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

    if (!userProfile || !userProfile.bookmarkedJobIds) {
      throw new Error("No bookmarks found");
    }

    const updatedBookmarks = userProfile.bookmarkedJobIds.filter(
      (id) => id !== args.jobId,
    );

    await ctx.db.patch(userProfile._id, {
      bookmarkedJobIds: updatedBookmarks,
    });
  },
});

export const listByUser = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile || !userProfile.bookmarkedJobIds) {
      return [];
    }

    // Get job and company details for each bookmarked job
    const bookmarkedJobs = await Promise.all(
      userProfile.bookmarkedJobIds.map(async (jobId) => {
        const job = await ctx.db.get(jobId);
        if (!job) return null;

        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      }),
    );

    // Filter out any null entries (jobs that may have been deleted)
    return bookmarkedJobs.filter((job) => job !== null);
  },
});

export const isBookmarked = query({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return false;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return userProfile?.bookmarkedJobIds?.includes(args.jobId) || false;
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return { total: 0 };
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return {
      total: userProfile?.bookmarkedJobIds?.length || 0,
    };
  },
});
