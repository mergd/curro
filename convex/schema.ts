import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  APPLICATION_METHODS,
  APPLICATION_STATUSES,
  COMPANY_CATEGORIES,
  COMPANY_STAGES,
  COMPENSATION_TYPES,
  createUnionValidator,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  INTERVIEW_TYPES,
  REMOTE_OPTIONS,
  ROLE_TYPES,
  SOURCE_TYPES,
} from "./constants";

export default defineSchema({
  ...authTables,

  userProfiles: defineTable({
    userId: v.id("users"),
    isAdmin: v.optional(v.boolean()),
    yearsOfExperience: v.optional(v.number()),
    interests: v.optional(v.array(v.string())),
    fourFacts: v.optional(v.array(v.string())),
    resumeId: v.optional(v.id("resumes")),
    bookmarkedJobIds: v.optional(v.array(v.id("jobs"))), // Simple array of bookmarked job IDs

    // Job preferences and background
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
    currentLocation: v.optional(v.string()), // Format: "City, XXX" (3-char country code)
    openToRelocation: v.optional(v.boolean()),
    needsSponsorship: v.optional(v.boolean()),
    preferredTimezones: v.optional(v.array(v.string())), // For remote work

    // What they're looking for
    lookingForInNextCompany: v.optional(v.string()), // Free text field
    desiredStartMonth: v.optional(v.string()), // Format: "YYYY-MM" or "Immediately" or "3-6 months"

    // Onboarding completion
    hasCompletedOnboarding: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  resumes: defineTable({
    userId: v.id("users"),
    storageId: v.string(), // To store the file ID from Convex file storage
    parsedContent: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  companies: defineTable({
    name: v.string(),
    description: v.optional(v.string()), // Short 2 sentence description
    foundedYear: v.optional(v.number()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    jobBoardUrl: v.string(),
    sourceType: createUnionValidator(SOURCE_TYPES),
    lastScraped: v.optional(v.number()),
    numberOfEmployees: v.optional(v.string()),
    stage: v.optional(createUnionValidator(COMPANY_STAGES)),
    category: v.optional(v.array(createUnionValidator(COMPANY_CATEGORIES))),
    subcategory: v.optional(v.array(v.string())), // Flexible subcategories
    tags: v.optional(v.array(v.string())), // Flexible tags for any company attributes
    recentFinancing: v.optional(
      v.object({
        amount: v.number(),
        date: v.string(),
      }),
    ),
    investors: v.optional(v.array(v.string())),
    recentHires: v.optional(
      v.array(
        v.object({
          name: v.string(),
          title: v.string(),
        }),
      ),
    ),
    locations: v.optional(v.array(v.string())), // Company office locations

    // Error tracking for rolling 24-hour window
    scrapingErrors: v.optional(
      v.array(
        v.object({
          timestamp: v.number(), // When the error occurred
          errorType: v.string(), // Type of error (e.g., "fetch_failed", "parse_error", "rate_limited")
          errorMessage: v.string(), // Error details
          url: v.optional(v.string()), // URL that caused the error
        }),
      ),
    ),

    // Backoff tracking for intelligent error handling
    backoffInfo: v.optional(
      v.object({
        level: v.number(), // Current backoff level (0 = no backoff, higher = longer delays)
        nextAllowedScrape: v.number(), // Timestamp when next scrape is allowed
        consecutiveFailures: v.number(), // Number of consecutive failures
        lastSuccessfulScrape: v.optional(v.number()), // Timestamp of last successful scrape
        totalFailures: v.number(), // Total failures in current backoff period
      }),
    ),
  }).index("by_name", ["name"]),

  jobs: defineTable({
    title: v.string(),
    companyId: v.id("companies"),
    description: v.string(),
    url: v.string(),
    locations: v.optional(v.array(v.string())), // Multiple locations for the job
    parsedRequirements: v.optional(v.string()),
    source: v.optional(v.string()), // e.g., Ashby, Greenhouse

    // Tracking when we first discovered this job posting
    firstSeenAt: v.optional(v.number()), // Timestamp when this job was first discovered during scraping (optional for backwards compatibility)

    // Track whether job details have been fully fetched and parsed
    isFetched: v.optional(v.boolean()), // false/undefined = placeholder job, true = fully fetched

    // Education requirements
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),

    // Experience requirements
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),

    // Role type
    roleType: v.optional(createUnionValidator(ROLE_TYPES)),

    // Role subcategory (e.g., fullstack, backend, frontend for SWE)
    roleSubcategory: v.optional(v.string()),

    // Employment type (defaults to permanent)
    employmentType: v.optional(createUnionValidator(EMPLOYMENT_TYPES)),

    // Internship information (only relevant when employmentType is "internship")
    internshipRequirements: v.optional(
      v.object({
        graduationDate: v.optional(v.string()), // Expected graduation date
        eligiblePrograms: v.optional(v.array(v.string())), // e.g., ["undergraduate", "graduate", "phd"]
        additionalRequirements: v.optional(v.string()),
      }),
    ),

    // Additional text requirements that can't be captured in structured fields
    additionalRequirements: v.optional(v.string()),

    // Compensation information (mutually exclusive salary structures)
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

    // Remote work options
    remoteOptions: v.optional(createUnionValidator(REMOTE_OPTIONS)),

    // Remote timezone preferences (e.g., ["CEST", "PST", "EST"])
    remoteTimezonePreferences: v.optional(v.array(v.string())),

    // Equity information
    equity: v.optional(
      v.object({
        offered: v.boolean(), // Whether equity is offered
        percentage: v.optional(v.number()), // Equity percentage if offered
        details: v.optional(v.string()), // Additional equity details
      }),
    ),

    // Tracking
    lastScraped: v.optional(v.number()), // Timestamp when this job was last seen during scraping
    deletedAt: v.optional(v.number()), // Timestamp when this job was soft deleted (no longer available on job board)
  })
    .index("by_company", ["companyId"])
    .index("by_fetched", ["isFetched"])
    .index("by_first_seen", ["firstSeenAt"]),

  applications: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobs"),
    companyId: v.id("companies"),

    // Application status
    status: createUnionValidator(APPLICATION_STATUSES),

    // Timeline
    appliedAt: v.optional(v.number()), // Timestamp when applied
    lastUpdated: v.number(), // Timestamp of last status update

    // Application details
    applicationMethod: v.optional(createUnionValidator(APPLICATION_METHODS)),

    // Contact information
    recruiterContact: v.optional(
      v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        linkedinUrl: v.optional(v.string()),
      }),
    ),

    // Notes and follow-ups
    notes: v.optional(v.string()),
    followUpDate: v.optional(v.number()), // Timestamp for when to follow up

    // Interview rounds tracking
    interviewRounds: v.optional(
      v.array(
        v.object({
          type: createUnionValidator(INTERVIEW_TYPES),
          scheduledAt: v.optional(v.number()),
          completedAt: v.optional(v.number()),
          feedback: v.optional(v.string()),
          interviewer: v.optional(v.string()),
        }),
      ),
    ),

    // Salary negotiation
    offerDetails: v.optional(
      v.object({
        baseSalary: v.optional(v.number()),
        equity: v.optional(v.string()),
        bonus: v.optional(v.number()),
        benefits: v.optional(v.string()),
        startDate: v.optional(v.string()),
        deadline: v.optional(v.number()), // Offer deadline timestamp
      }),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_job", ["jobId"])
    .index("by_company", ["companyId"])
    .index("by_user_status", ["userId", "status"]),

  // Track scraping metrics for analytics and monitoring
  scrapingMetrics: defineTable({
    companyId: v.id("companies"),
    scrapedAt: v.number(),
    success: v.boolean(),
    totalJobsFound: v.optional(v.number()),
    newJobsCreated: v.optional(v.number()),
    existingJobsSkipped: v.optional(v.number()),
    jobsSoftDeleted: v.optional(v.number()),
    scrapeDurationMs: v.optional(v.number()),
    atsType: v.optional(v.string()),
    errorType: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    netJobChange: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_company_and_date", ["companyId", "scrapedAt"])
    .index("by_date", ["scrapedAt"]),
});
