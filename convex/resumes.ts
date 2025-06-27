import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./_utils";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveStorageId = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) {
        throw new Error("User profile not found");
    }

    const resumeId = await ctx.db.insert("resumes", { userId, storageId });

    await ctx.db.patch(userProfile._id, { resumeId });
  },
});
