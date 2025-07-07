import { v } from "convex/values";

import { api } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAdmin } from "./_utils";
import {
  COMPENSATION_TYPES,
  createUnionValidator,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  REMOTE_OPTIONS,
  ROLE_TYPES,
} from "./constants";

export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, { id }) => {
    const job = await ctx.db.get(id);
    if (!job) {
      return null;
    }
    const company = await ctx.db.get(job.companyId);
    return { ...job, company };
  },
});

export const list = query({
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(20);

    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      }),
    );

    return jobsWithCompany;
  },
});

export const listAll = query({
  args: {
    includeDeleted: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { includeDeleted = false, limit = 20 }) => {
    if (limit) {
      limit = Math.min(limit, 20);
    }

    let jobsQuery = ctx.db.query("jobs");

    if (!includeDeleted) {
      jobsQuery = jobsQuery.filter((q) =>
        q.eq(q.field("deletedAt"), undefined),
      );
    }

    const jobs = await jobsQuery.take(limit);

    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      }),
    );

    return jobsWithCompany;
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    companyId: v.id("companies"),
    description: v.string(),
    url: v.string(),
    locations: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),
    roleType: v.optional(createUnionValidator(ROLE_TYPES)),
    roleSubcategory: v.optional(v.string()),
    employmentType: v.optional(createUnionValidator(EMPLOYMENT_TYPES)),
    isInternship: v.optional(v.boolean()),
    internshipRequirements: v.optional(
      v.object({
        graduationDate: v.optional(v.string()),
        eligiblePrograms: v.optional(v.array(v.string())),
        additionalRequirements: v.optional(v.string()),
      }),
    ),
    additionalRequirements: v.optional(v.string()),
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
    remoteOptions: v.optional(createUnionValidator(REMOTE_OPTIONS)),
    remoteTimezonePreferences: v.optional(v.array(v.string())),
    equity: v.optional(
      v.object({
        offered: v.boolean(),
        percentage: v.optional(v.number()),
        details: v.optional(v.string()),
      }),
    ),
    isFetched: v.optional(v.boolean()),
    firstSeenAt: v.optional(v.number()),
    lastScraped: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", args);
  },
});

export const findByUrl = query({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    return await ctx.db
      .query("jobs")
      .filter((q) => q.eq(q.field("url"), url))
      .unique();
  },
});

export const update = mutation({
  args: {
    id: v.id("jobs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    locations: v.optional(v.array(v.string())),
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),
    roleType: v.optional(createUnionValidator(ROLE_TYPES)),
    roleSubcategory: v.optional(v.string()),
    employmentType: v.optional(createUnionValidator(EMPLOYMENT_TYPES)),
    isInternship: v.optional(v.boolean()),
    internshipRequirements: v.optional(
      v.object({
        graduationDate: v.optional(v.string()),
        eligiblePrograms: v.optional(v.array(v.string())),
        additionalRequirements: v.optional(v.string()),
      }),
    ),
    additionalRequirements: v.optional(v.string()),
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
    remoteOptions: v.optional(createUnionValidator(REMOTE_OPTIONS)),
    remoteTimezonePreferences: v.optional(v.array(v.string())),
    equity: v.optional(
      v.object({
        offered: v.boolean(),
        percentage: v.optional(v.number()),
        details: v.optional(v.string()),
      }),
    ),
    lastScraped: v.optional(v.number()),
    isFetched: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
  },
});

// Internal mutation for scraper use - doesn't require admin auth
export const updateInternal = internalMutation({
  args: {
    id: v.id("jobs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    locations: v.optional(v.array(v.string())),
    educationLevel: v.optional(createUnionValidator(EDUCATION_LEVELS)),
    yearsOfExperience: v.optional(
      v.object({
        min: v.number(),
        max: v.optional(v.number()),
      }),
    ),
    roleType: v.optional(createUnionValidator(ROLE_TYPES)),
    roleSubcategory: v.optional(v.string()),
    employmentType: v.optional(createUnionValidator(EMPLOYMENT_TYPES)),
    isInternship: v.optional(v.boolean()),
    internshipRequirements: v.optional(
      v.object({
        graduationDate: v.optional(v.string()),
        eligiblePrograms: v.optional(v.array(v.string())),
        additionalRequirements: v.optional(v.string()),
      }),
    ),
    additionalRequirements: v.optional(v.string()),
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
    remoteOptions: v.optional(createUnionValidator(REMOTE_OPTIONS)),
    remoteTimezonePreferences: v.optional(v.array(v.string())),
    equity: v.optional(
      v.object({
        offered: v.boolean(),
        percentage: v.optional(v.number()),
        details: v.optional(v.string()),
      }),
    ),
    lastScraped: v.optional(v.number()),
    isFetched: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
  },
});

export const findRecentlyScrapedByUrl = query({
  args: {
    url: v.string(),
    cutoffTime: v.number(),
  },
  handler: async (ctx, { url, cutoffTime }) => {
    return await ctx.db
      .query("jobs")
      .filter((q) =>
        q.and(
          q.eq(q.field("url"), url),
          q.gte(q.field("lastScraped"), cutoffTime),
        ),
      )
      .unique();
  },
});

export const updateLastScraped = mutation({
  args: {
    id: v.id("jobs"),
    timestamp: v.number(),
  },
  handler: async (ctx, { id, timestamp }) => {
    await ctx.db.patch(id, { lastScraped: timestamp });
  },
});

export const softDelete = mutation({
  args: {
    id: v.id("jobs"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { deletedAt: Date.now() });
  },
});

export const findActiveJobsByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

export const findActiveJobUrlsByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return jobs.map((job) => job.url);
  },
});

export const findFailedJobsByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.or(
            q.eq(q.field("isFetched"), false),
            q.eq(q.field("isFetched"), undefined),
          ),
        ),
      )
      .collect();
  },
});

export const listByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const jobsWithCompany = await Promise.all(
      jobs.map(async (job) => {
        const company = await ctx.db.get(job.companyId);
        return { ...job, company };
      }),
    );

    return jobsWithCompany;
  },
});

export const searchJobs = query({
  args: {
    // Pagination
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),

    // Search
    searchQuery: v.optional(v.string()),

    // Filters
    roleType: v.optional(v.array(v.string())),
    employmentType: v.optional(v.array(v.string())),
    remoteOption: v.optional(v.array(v.string())),
    country: v.optional(v.array(v.string())),
    city: v.optional(v.array(v.string())),
    timezone: v.optional(v.array(v.string())),
    companyStage: v.optional(v.array(v.string())),
    companyCategory: v.optional(v.array(v.string())),
    experienceMin: v.optional(v.number()),
    experienceMax: v.optional(v.number()),

    // Sorting
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const {
      offset = 0,
      limit = 15,
      searchQuery,
      roleType,
      employmentType,
      remoteOption,
      country,
      city,
      timezone,
      companyStage,
      companyCategory,
      experienceMin,
      experienceMax,
      sortBy = "_creationTime",
      sortOrder = "desc",
    } = args;

    let jobs;

    if (searchQuery && searchQuery.trim()) {
      // Use full text search when there's a search query
      let searchQueryBuilder = ctx.db
        .query("jobs")
        .withSearchIndex("search_jobs", (q) => q.search("title", searchQuery))
        .filter((q) => q.eq(q.field("deletedAt"), undefined));

      // Apply basic filters that are supported by the search index
      if (roleType && roleType.length > 0) {
        searchQueryBuilder = searchQueryBuilder.filter((q) =>
          q.or(...roleType.map((type) => q.eq(q.field("roleType"), type))),
        );
      }

      if (employmentType && employmentType.length > 0) {
        searchQueryBuilder = searchQueryBuilder.filter((q) =>
          q.or(
            ...employmentType.map((type) =>
              q.eq(q.field("employmentType"), type),
            ),
          ),
        );
      }

      if (remoteOption && remoteOption.length > 0) {
        searchQueryBuilder = searchQueryBuilder.filter((q) =>
          q.or(
            ...remoteOption.map((option) =>
              q.eq(q.field("remoteOptions"), option),
            ),
          ),
        );
      }

      jobs = await searchQueryBuilder.collect();
    } else {
      // Use regular query when no search query
      jobs = await ctx.db
        .query("jobs")
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect();
    }

    // Get companies for additional filtering
    const companyIds = [...new Set(jobs.map((job) => job.companyId))];
    const companies = await Promise.all(companyIds.map((id) => ctx.db.get(id)));
    const companiesMap = new Map(
      companies.filter(Boolean).map((c) => [c!._id, c]),
    );

    // Apply additional filters that need company data or complex logic
    const filteredJobs = jobs.filter((job) => {
      const company = companiesMap.get(job.companyId);

      // Company stage filter
      if (companyStage && companyStage.length > 0) {
        if (!companyStage.includes(company?.stage || "")) return false;
      }

      // Company category filter
      if (companyCategory && companyCategory.length > 0) {
        if (
          !company?.category?.some((category) =>
            companyCategory.includes(category),
          )
        )
          return false;
      }

      // Country filter
      if (country && country.length > 0) {
        const matchesCountry = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          return country.some((countryCode) => {
            const countryCodeLower = countryCode.toLowerCase();
            return (
              locationLower.endsWith(countryCodeLower) ||
              locationLower.includes(`, ${countryCodeLower}`) ||
              locationLower.includes(countryCodeLower)
            );
          });
        });
        if (!matchesCountry && job.remoteOptions !== "Remote") return false;
      }

      // City filter
      if (city && city.length > 0) {
        const matchesCity = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          return city.some((cityName) => {
            if (cityName === "all") return true;
            const cityLower = cityName.toLowerCase();
            return (
              locationLower.startsWith(cityLower) ||
              locationLower.includes(`${cityLower},`) ||
              locationLower === cityLower ||
              locationLower.includes(cityLower)
            );
          });
        });
        if (!matchesCity && job.remoteOptions !== "Remote") return false;
      }

      // Experience range filter
      if (experienceMin !== undefined || experienceMax !== undefined) {
        if (job.yearsOfExperience?.min !== undefined) {
          const jobExperience = job.yearsOfExperience.min;
          if (experienceMin !== undefined && jobExperience < experienceMin) {
            return false;
          }
          if (experienceMax !== undefined && jobExperience > experienceMax) {
            return false;
          }
        } else if (experienceMin !== undefined && experienceMin > 0) {
          return false;
        }
      }

      return true;
    });

    // Sort the filtered jobs
    const sortedJobs = filteredJobs.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "_creationTime":
          aValue = a._creationTime;
          bValue = b._creationTime;
          break;
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "yearsOfExperience":
          aValue = a.yearsOfExperience?.min ?? 0;
          bValue = b.yearsOfExperience?.min ?? 0;
          break;
        default:
          aValue = a._creationTime;
          bValue = b._creationTime;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const paginatedJobs = sortedJobs.slice(offset, offset + limit);

    // Get company details for paginated jobs
    const jobsWithCompany = await Promise.all(
      paginatedJobs.map(async (job) => {
        const company = companiesMap.get(job.companyId);
        return { ...job, company: company || null };
      }),
    );

    return {
      jobs: jobsWithCompany,
      total: filteredJobs.length,
      hasMore: offset + limit < filteredJobs.length,
    };
  },
});

export const listPaginated = query({
  args: {
    // Pagination
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),

    // Search
    searchQuery: v.optional(v.string()),

    // Filters
    roleType: v.optional(v.array(v.string())),
    employmentType: v.optional(v.array(v.string())),
    remoteOption: v.optional(v.array(v.string())),
    country: v.optional(v.array(v.string())),
    city: v.optional(v.array(v.string())),
    timezone: v.optional(v.array(v.string())),
    companyStage: v.optional(v.array(v.string())),
    companyCategory: v.optional(v.array(v.string())),
    experienceMin: v.optional(v.number()),
    experienceMax: v.optional(v.number()),

    // Sorting
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const {
      offset = 0,
      limit = 15,
      searchQuery,
      roleType,
      employmentType,
      remoteOption,
      country,
      city,
      timezone,
      companyStage,
      companyCategory,
      experienceMin,
      experienceMax,
      sortBy = "_creationTime",
      sortOrder = "desc",
    } = args;

    // Start with base query
    let jobsQuery = ctx.db
      .query("jobs")
      .filter((q) => q.eq(q.field("deletedAt"), undefined));

    // Apply filters - since Convex doesn't support complex server-side filtering,
    // we'll still need to filter on the client side but optimize the data fetching
    const allJobs = await jobsQuery.collect();

    // Get companies for filtering
    const companyIds = [...new Set(allJobs.map((job) => job.companyId))];
    const companies = await Promise.all(companyIds.map((id) => ctx.db.get(id)));
    const companiesMap = new Map(
      companies.filter(Boolean).map((c) => [c!._id, c]),
    );

    // Apply filters
    const filteredJobs = allJobs.filter((job) => {
      const company = companiesMap.get(job.companyId);

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(query) ||
          company?.name?.toLowerCase().includes(query) ||
          job.locations?.some((location) =>
            location.toLowerCase().includes(query),
          ) ||
          job.roleType?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Role type filter
      if (roleType && roleType.length > 0) {
        if (!roleType.includes(job.roleType || "")) return false;
      }

      // Employment type filter
      if (employmentType && employmentType.length > 0) {
        if (!employmentType.includes(job.employmentType || "")) return false;
      }

      // Company stage filter
      if (companyStage && companyStage.length > 0) {
        if (!companyStage.includes(company?.stage || "")) return false;
      }

      // Company category filter
      if (companyCategory && companyCategory.length > 0) {
        if (
          !company?.category?.some((category) =>
            companyCategory.includes(category),
          )
        )
          return false;
      }

      // Remote option filter
      if (remoteOption && remoteOption.length > 0) {
        if (!remoteOption.includes(job.remoteOptions || "")) return false;
      }

      // Country filter
      if (country && country.length > 0) {
        const matchesCountry = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          return country.some((countryCode) => {
            const countryCodeLower = countryCode.toLowerCase();
            return (
              locationLower.endsWith(countryCodeLower) ||
              locationLower.includes(`, ${countryCodeLower}`) ||
              locationLower.includes(countryCodeLower)
            );
          });
        });
        if (!matchesCountry && job.remoteOptions !== "Remote") return false;
      }

      // City filter
      if (city && city.length > 0) {
        const matchesCity = job.locations?.some((location) => {
          const locationLower = location.toLowerCase();
          return city.some((cityName) => {
            if (cityName === "all") return true;
            const cityLower = cityName.toLowerCase();
            return (
              locationLower.startsWith(cityLower) ||
              locationLower.includes(`${cityLower},`) ||
              locationLower === cityLower ||
              locationLower.includes(cityLower)
            );
          });
        });
        if (!matchesCity && job.remoteOptions !== "Remote") return false;
      }

      // Experience range filter
      if (experienceMin !== undefined || experienceMax !== undefined) {
        if (job.yearsOfExperience?.min !== undefined) {
          const jobExperience = job.yearsOfExperience.min;
          if (experienceMin !== undefined && jobExperience < experienceMin) {
            return false;
          }
          if (experienceMax !== undefined && jobExperience > experienceMax) {
            return false;
          }
        } else if (experienceMin !== undefined && experienceMin > 0) {
          // If filter has a minimum but job has no experience info, exclude it
          return false;
        }
      }

      return true;
    });

    // Sort the filtered jobs
    const sortedJobs = filteredJobs.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "_creationTime":
          aValue = a._creationTime;
          bValue = b._creationTime;
          break;
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "yearsOfExperience":
          aValue = a.yearsOfExperience?.min ?? 0;
          bValue = b.yearsOfExperience?.min ?? 0;
          break;
        default:
          aValue = a._creationTime;
          bValue = b._creationTime;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const paginatedJobs = sortedJobs.slice(offset, offset + limit);

    // Get company details for paginated jobs
    const jobsWithCompany = await Promise.all(
      paginatedJobs.map(async (job) => {
        const company = companiesMap.get(job.companyId);
        return { ...job, company: company || null };
      }),
    );

    return {
      jobs: jobsWithCompany,
      total: filteredJobs.length,
      hasMore: offset + limit < filteredJobs.length,
    };
  },
});

export const clearAllJobsForCompany = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    await requireAdmin(ctx);

    // Get all active jobs for the company
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Soft delete all jobs
    const deletedCount = jobs.length;
    await Promise.all(
      jobs.map((job) => ctx.db.patch(job._id, { deletedAt: Date.now() })),
    );

    return { deletedCount };
  },
});
