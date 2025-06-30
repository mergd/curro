import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserId } from "./_utils";
import {
  APPLICATION_METHODS,
  APPLICATION_STATUSES,
  createUnionValidator,
  INTERVIEW_TYPES,
} from "./constants";

export const add = mutation({
  args: {
    jobId: v.id("jobs"),
    status: createUnionValidator(APPLICATION_STATUSES),
    applicationMethod: v.optional(createUnionValidator(APPLICATION_METHODS)),
    appliedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the job to find the company
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Check if application already exists
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .unique();

    if (existing) {
      throw new Error("Application already exists for this job");
    }

    return await ctx.db.insert("applications", {
      userId,
      jobId: args.jobId,
      companyId: job.companyId,
      status: args.status,
      appliedAt: args.appliedAt || Date.now(),
      lastUpdated: Date.now(),
      applicationMethod: args.applicationMethod,
      notes: args.notes,
    });
  },
});

export const update = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.optional(createUnionValidator(APPLICATION_STATUSES)),
    notes: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    recruiterContact: v.optional(
      v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        linkedinUrl: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Application not found or access denied");
    }

    const { applicationId, ...updateData } = args;
    await ctx.db.patch(applicationId, {
      ...updateData,
      lastUpdated: Date.now(),
    });
  },
});

export const addInterviewRound = mutation({
  args: {
    applicationId: v.id("applications"),
    type: createUnionValidator(INTERVIEW_TYPES),
    scheduledAt: v.optional(v.number()),
    interviewer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Application not found or access denied");
    }

    const newRound = {
      type: args.type,
      scheduledAt: args.scheduledAt,
      interviewer: args.interviewer,
    };

    const currentRounds = application.interviewRounds || [];
    await ctx.db.patch(args.applicationId, {
      interviewRounds: [...currentRounds, newRound],
      lastUpdated: Date.now(),
    });
  },
});

export const listByUser = query({
  args: {
    status: v.optional(createUnionValidator(APPLICATION_STATUSES)),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }

    let applicationsQuery = ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.status) {
      applicationsQuery = applicationsQuery.filter((q) =>
        q.eq(q.field("status"), args.status),
      );
    }

    const applications = await applicationsQuery.collect();

    // Get job and company details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (application) => {
        const job = await ctx.db.get(application.jobId);
        const company = job ? await ctx.db.get(job.companyId) : null;
        return {
          ...application,
          job,
          company,
        };
      }),
    );

    return applicationsWithDetails.sort(
      (a, b) => b.lastUpdated - a.lastUpdated,
    );
  },
});

export const get = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return null;
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      return null;
    }

    const job = await ctx.db.get(application.jobId);
    const company = job ? await ctx.db.get(job.companyId) : null;

    return {
      ...application,
      job,
      company,
    };
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return {
        total: 0,
        byStatus: {},
        pending: 0,
        active: 0,
      };
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const byStatus = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate active applications (not rejected, withdrawn, or hired)
    const activeStatuses = ["applied", "screening", "interviewing", "offered"];
    const active = applications.filter((app) =>
      activeStatuses.includes(app.status),
    ).length;

    const pending = applications.filter(
      (app) => app.status === "applied",
    ).length;

    return {
      total: applications.length,
      byStatus,
      pending,
      active,
    };
  },
});

export const remove = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Application not found or access denied");
    }

    await ctx.db.delete(args.applicationId);
  },
});
