import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  userProfiles: defineTable({
    userId: v.id("users"),
    yearsOfExperience: v.optional(v.number()),
    interests: v.optional(v.array(v.string())),
    fourFacts: v.optional(v.array(v.string())),
    resumeId: v.optional(v.id("resumes")),
  }).index("by_user", ["userId"]),

  resumes: defineTable({
    userId: v.id("users"),
    storageId: v.string(), // To store the file ID from Convex file storage
    parsedContent: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  companies: defineTable({
    name: v.string(),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    jobBoardUrl: v.string(),
    sourceType: v.union(
      v.literal("ashby"),
      v.literal("greenhouse"),
      v.literal("other"),
    ),
    lastScraped: v.optional(v.number()),
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
    tags: v.optional(v.array(v.string())), // e.g., ["fintech", "saas", "b2b", "ai/ml"]
    recentFinancing: v.optional(
      v.object({
        amount: v.string(),
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
  }).index("by_name", ["name"]),

  jobs: defineTable({
    title: v.string(),
    companyId: v.id("companies"),
    description: v.string(),
    url: v.string(),
    locations: v.optional(v.array(v.string())), // Multiple locations for the job
    parsedRequirements: v.optional(v.string()),
    source: v.optional(v.string()), // e.g., Ashby, Greenhouse

    // Education requirements
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

    // Experience requirements
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),

    // Role type
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

    // Internship information
    isInternship: v.optional(v.boolean()),
    internshipRequirements: v.optional(
      v.object({
        graduationDate: v.optional(v.string()), // Expected graduation date
        eligiblePrograms: v.optional(v.array(v.string())), // e.g., ["undergraduate", "graduate", "phd"]
        additionalRequirements: v.optional(v.string()),
      }),
    ),

    // Additional text requirements that can't be captured in structured fields
    additionalRequirements: v.optional(v.string()),

    // Salary information
    salaryRange: v.optional(
      v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
        currency: v.optional(v.string()),
        period: v.optional(v.union(v.literal("hourly"), v.literal("annual"))),
      }),
    ),

    // Remote work options
    remoteOptions: v.optional(
      v.union(v.literal("on-site"), v.literal("remote"), v.literal("hybrid")),
    ),

    // Equity information
    equity: v.optional(v.object({
      offered: v.boolean(), // Whether equity is offered
      percentage: v.optional(v.number()), // Equity percentage if offered
      details: v.optional(v.string()), // Additional equity details
    })),
  }).index("by_company", ["companyId"]),

  applications: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobs"),
    companyId: v.id("companies"),

    // Application status
    status: v.union(
      v.literal("interested"), // Marked as interested but not applied yet
      v.literal("applied"),
      v.literal("phone-screen"),
      v.literal("technical-interview"),
      v.literal("onsite-interview"),
      v.literal("final-round"),
      v.literal("offer"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn"),
    ),

    // Timeline
    appliedAt: v.optional(v.number()), // Timestamp when applied
    lastUpdated: v.number(), // Timestamp of last status update

    // Application details
    applicationMethod: v.optional(
      v.union(
        v.literal("company-website"),
        v.literal("linkedin"),
        v.literal("referral"),
        v.literal("recruiter"),
        v.literal("job-board"),
        v.literal("other"),
      ),
    ),

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
          type: v.union(
            v.literal("phone-screen"),
            v.literal("technical"),
            v.literal("behavioral"),
            v.literal("system-design"),
            v.literal("cultural-fit"),
            v.literal("onsite"),
            v.literal("final"),
            v.literal("other"),
          ),
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
});
