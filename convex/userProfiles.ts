import { v } from "convex/values";

import { action, mutation, query } from "./_generated/server";
import { getUserId } from "./_utils";
import {
  createUnionValidator,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  REMOTE_OPTIONS,
  ROLE_TYPES,
} from "./constants";
import { parseResume } from "./parsers/aiParser";

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
    // Existing fields
    yearsOfExperience: v.optional(v.number()),
    interests: v.optional(v.array(v.string())),
    fourFacts: v.optional(v.array(v.string())),

    // New job preference fields
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),
    interestedRoleTypes: v.optional(v.array(createUnionValidator(ROLE_TYPES))),
    preferredEmploymentTypes: v.optional(
      v.array(createUnionValidator(EMPLOYMENT_TYPES)),
    ),
    preferredRemoteOptions: v.optional(
      v.array(createUnionValidator(REMOTE_OPTIONS)),
    ),

    // Current situation
    currentCompany: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    isCurrentlyEmployed: v.optional(v.boolean()),

    // Location and preferences
    currentLocation: v.optional(v.string()),
    openToRelocation: v.optional(v.boolean()),
    needsSponsorship: v.optional(v.boolean()),
    preferredTimezones: v.optional(v.array(v.string())),

    // What they're looking for
    lookingForInNextCompany: v.optional(v.string()),
    desiredStartMonth: v.optional(v.string()),

    // Onboarding completion
    hasCompletedOnboarding: v.optional(v.boolean()),
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

export const parseResumeFromStorage = action({
  args: { storageId: v.string() },
  returns: v.object({
    // Personal info
    fullName: v.optional(v.string()),
    currentLocation: v.optional(v.string()),

    // Education
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),

    // Experience and skills
    yearsOfExperience: v.optional(v.number()),
    currentCompany: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    isCurrentlyEmployed: v.optional(v.boolean()),

    // Role preferences
    interestedRoleTypes: v.optional(v.array(createUnionValidator(ROLE_TYPES))),

    // Skills and interests
    technicalSkills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),

    // Notable achievements
    keyAchievements: v.optional(v.array(v.string())),
  }),
  handler: async (ctx, args) => {
    try {
      // Get the file from storage
      const blob = await ctx.storage.get(args.storageId);
      if (!blob) {
        throw new Error("File not found in storage");
      }

      // Convert blob to text
      const resumeText = await blob.text();

      // Parse the resume using AI
      const parsedData = await parseResume(resumeText);

      return parsedData;
    } catch (error) {
      console.error("Resume parsing failed:", error);
      throw new Error("Failed to parse resume");
    }
  },
});
