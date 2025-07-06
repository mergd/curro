import { v } from "convex/values";
import { z } from "zod";

import { chainLLMs } from "../lib/ai";
import { action, mutation, query } from "./_generated/server";
import {
  COMPANY_CATEGORIES,
  COMPANY_STAGES,
  COMPANY_SUBCATEGORIES,
  createUnionValidator,
  EMPLOYEE_COUNT_RANGES,
  SOURCE_TYPES,
} from "./constants";
import { inferSourceType } from "./utils";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("companies"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      foundedYear: v.optional(v.number()),
      website: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      jobBoardUrl: v.string(),
      sourceType: createUnionValidator(SOURCE_TYPES),
      lastScraped: v.optional(v.number()),
      numberOfEmployees: v.optional(v.string()),
      stage: v.optional(createUnionValidator(COMPANY_STAGES)),
      category: v.optional(v.array(createUnionValidator(COMPANY_CATEGORIES))),
      subcategory: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
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
      locations: v.optional(v.array(v.string())),
      scrapingErrors: v.optional(
        v.array(
          v.object({
            timestamp: v.number(),
            errorType: v.string(),
            errorMessage: v.string(),
            url: v.optional(v.string()),
          }),
        ),
      ),
      backoffInfo: v.optional(
        v.object({
          level: v.number(),
          nextAllowedScrape: v.number(),
          consecutiveFailures: v.number(),
          lastSuccessfulScrape: v.optional(v.number()),
          totalFailures: v.number(),
        }),
      ),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});

export const listWithJobCounts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("companies"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      foundedYear: v.optional(v.number()),
      website: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      jobBoardUrl: v.string(),
      sourceType: createUnionValidator(SOURCE_TYPES),
      lastScraped: v.optional(v.number()),
      numberOfEmployees: v.optional(v.string()),
      stage: v.optional(createUnionValidator(COMPANY_STAGES)),
      category: v.optional(v.array(createUnionValidator(COMPANY_CATEGORIES))),
      subcategory: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
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
      locations: v.optional(v.array(v.string())),
      scrapingErrors: v.optional(
        v.array(
          v.object({
            timestamp: v.number(),
            errorType: v.string(),
            errorMessage: v.string(),
            url: v.optional(v.string()),
          }),
        ),
      ),
      backoffInfo: v.optional(
        v.object({
          level: v.number(),
          nextAllowedScrape: v.number(),
          consecutiveFailures: v.number(),
          lastSuccessfulScrape: v.optional(v.number()),
          totalFailures: v.number(),
        }),
      ),
      jobCount: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();

    const companiesWithJobCounts = await Promise.all(
      companies.map(async (company) => {
        const jobs = await ctx.db
          .query("jobs")
          .withIndex("by_company", (q) => q.eq("companyId", company._id))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .collect();

        return {
          ...company,
          jobCount: jobs.length,
        };
      }),
    );

    return companiesWithJobCounts;
  },
});

export const get = query({
  args: { id: v.id("companies") },
  returns: v.union(
    v.object({
      _id: v.id("companies"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      foundedYear: v.optional(v.number()),
      website: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      jobBoardUrl: v.string(),
      sourceType: createUnionValidator(SOURCE_TYPES),
      lastScraped: v.optional(v.number()),
      numberOfEmployees: v.optional(v.string()),
      stage: v.optional(createUnionValidator(COMPANY_STAGES)),
      category: v.optional(v.array(createUnionValidator(COMPANY_CATEGORIES))),
      subcategory: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
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
      locations: v.optional(v.array(v.string())),
      scrapingErrors: v.optional(
        v.array(
          v.object({
            timestamp: v.number(),
            errorType: v.string(),
            errorMessage: v.string(),
            url: v.optional(v.string()),
          }),
        ),
      ),
      backoffInfo: v.optional(
        v.object({
          level: v.number(),
          nextAllowedScrape: v.number(),
          consecutiveFailures: v.number(),
          lastSuccessfulScrape: v.optional(v.number()),
          totalFailures: v.number(),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    jobBoardUrl: v.string(),
    sourceType: v.optional(createUnionValidator(SOURCE_TYPES)),
    numberOfEmployees: v.optional(v.string()),
    stage: v.optional(createUnionValidator(COMPANY_STAGES)),
    category: v.optional(v.array(createUnionValidator(COMPANY_CATEGORIES))),
    subcategory: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    locations: v.optional(v.array(v.string())),
    recentFinancing: v.optional(
      v.object({
        amount: v.number(),
        date: v.string(),
      }),
    ),
    investors: v.optional(v.array(v.string())),
  },
  returns: v.id("companies"),
  handler: async (ctx, args) => {
    const finalSourceType =
      args.sourceType ?? inferSourceType(args.jobBoardUrl);
    return await ctx.db.insert("companies", {
      ...args,
      sourceType: finalSourceType,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    jobBoardUrl: v.optional(v.string()),
    sourceType: v.optional(createUnionValidator(SOURCE_TYPES)),
    numberOfEmployees: v.optional(v.string()),
    stage: v.optional(createUnionValidator(COMPANY_STAGES)),
    category: v.optional(v.array(createUnionValidator(COMPANY_CATEGORIES))),
    subcategory: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    locations: v.optional(v.array(v.string())),
    recentFinancing: v.optional(
      v.object({
        amount: v.number(),
        date: v.string(),
      }),
    ),
    investors: v.optional(v.array(v.string())),
    lastScraped: v.optional(v.number()),
    scrapingErrors: v.optional(
      v.array(
        v.object({
          timestamp: v.number(),
          errorType: v.string(),
          errorMessage: v.string(),
          url: v.optional(v.string()),
        }),
      ),
    ),
    backoffInfo: v.optional(
      v.object({
        level: v.number(),
        nextAllowedScrape: v.number(),
        consecutiveFailures: v.number(),
        lastSuccessfulScrape: v.optional(v.number()),
        totalFailures: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, sourceType, jobBoardUrl, ...rest } = args;

    // Determine sourceType only if it wasn't provided but jobBoardUrl was.
    const computedSourceType =
      sourceType ?? (jobBoardUrl ? inferSourceType(jobBoardUrl) : undefined);

    const updateData = {
      ...rest,
      ...(jobBoardUrl !== undefined ? { jobBoardUrl } : {}),
      ...(computedSourceType !== undefined
        ? { sourceType: computedSourceType }
        : {}),
    } as Record<string, unknown>;

    await ctx.db.patch(id, updateData);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return null;
  },
});

export const getErrorStats = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("companies"),
      name: v.string(),
      recentErrorCount: v.number(),
      lastError: v.union(
        v.object({
          timestamp: v.number(),
          errorType: v.string(),
          errorMessage: v.string(),
          url: v.optional(v.string()),
        }),
        v.null(),
      ),
      isProblematic: v.boolean(),
      backoffLevel: v.number(),
      backoffStatus: v.string(),
      nextAllowedScrape: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    return companies
      .map((company) => {
        const recentErrors = (company.scrapingErrors || []).filter(
          (error) => error.timestamp > twentyFourHoursAgo,
        );

        const backoffInfo = company.backoffInfo;
        const backoffLevel = backoffInfo?.level || 0;

        // Import the backoff utility to get status description
        let backoffStatus = "No backoff - scraping normally";
        if (backoffInfo) {
          if (backoffInfo.totalFailures >= 50) {
            backoffStatus = "Permanent backoff due to excessive failures";
          } else if (
            backoffInfo.level > 0 &&
            now < backoffInfo.nextAllowedScrape
          ) {
            const remainingMs = backoffInfo.nextAllowedScrape - now;
            const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
            const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

            if (remainingHours >= 2) {
              backoffStatus = `Backoff level ${backoffInfo.level} - ${remainingHours} hours remaining`;
            } else {
              backoffStatus = `Backoff level ${backoffInfo.level} - ${remainingMinutes} minutes remaining`;
            }
          } else if (backoffInfo.level > 0) {
            backoffStatus = `Backoff level ${backoffInfo.level} - ready for next attempt`;
          }
        }

        return {
          id: company._id,
          name: company.name,
          recentErrorCount: recentErrors.length,
          lastError:
            recentErrors.length > 0
              ? recentErrors[recentErrors.length - 1]
              : null,
          isProblematic: recentErrors.length >= 10 || backoffLevel >= 3, // Enhanced problematic detection
          backoffLevel,
          backoffStatus,
          nextAllowedScrape: backoffInfo?.nextAllowedScrape,
        };
      })
      .sort((a, b) => {
        // Sort by backoff level first, then by error count
        if (a.backoffLevel !== b.backoffLevel) {
          return b.backoffLevel - a.backoffLevel;
        }
        return b.recentErrorCount - a.recentErrorCount;
      });
  },
});

export const clearErrors = mutation({
  args: { id: v.id("companies") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      scrapingErrors: [],
    });
    return null;
  },
});

export const resetBackoff = mutation({
  args: { id: v.id("companies") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      backoffInfo: {
        level: 0,
        nextAllowedScrape: Date.now(),
        consecutiveFailures: 0,
        totalFailures: 0,
      },
    });
    console.log(`Reset backoff for company ${id}`);
    return null;
  },
});

export const fetchCompanyDetailsFromPerplexity = action({
  args: {
    companyName: v.string(),
    companyUrl: v.optional(v.string()),
  },
  returns: v.object({
    description: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    numberOfEmployees: v.optional(v.string()),
    stage: v.optional(createUnionValidator(COMPANY_STAGES)),
    category: v.optional(v.array(createUnionValidator(COMPANY_CATEGORIES))),
    subcategory: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    locations: v.optional(v.array(v.string())),
    recentFinancing: v.optional(
      v.object({
        amount: v.optional(v.number()),
        date: v.optional(v.string()),
      }),
    ),
    investors: v.optional(v.array(v.string())),
  }),
  handler: async (ctx, { companyName, companyUrl }) => {
    const schema = z.object({
      description: z.string().optional(),
      foundedYear: z.number().optional(),
      website: z.string().url().optional(),
      logoUrl: z.string().url().optional(),
      numberOfEmployees: z.enum(EMPLOYEE_COUNT_RANGES).optional(),
      stage: z.enum(COMPANY_STAGES).optional(),
      category: z.array(z.enum(COMPANY_CATEGORIES)).optional(),
      subcategory: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      recentFinancing: z
        .object({
          amount: z.number().optional(),
          date: z.string().optional(),
        })
        .optional(),
      investors: z.array(z.string()).optional(),
    });

    try {
      const urlContext = companyUrl
        ? ` The company's website is: ${companyUrl}`
        : "";
      const researchPrompt = `Research detailed information about the company "${companyName}".${urlContext} Find:
- Official website and logo
- Current employee count and company stage
- Primary industry category and specific subcategory
- Company characteristics and attributes
- Office locations  
- Recent funding rounds and investors
- Any other relevant business information

Focus on accuracy and recent information.`;

      const structurePrompt = `Structure the company information into the following format:

1. Company description (2 sentences maximum describing what the company does)
2. Founded year (as a number, e.g., 2010)
3. Official website URL (must be complete URL with https:// protocol, e.g., "https://company.com")
4. Logo URL (if publicly available, must be complete URL with https:// protocol)
5. Approximate number of employees (choose from: ${EMPLOYEE_COUNT_RANGES.join(", ")})
6. Company stage (choose from: ${COMPANY_STAGES.join(", ")})
7. Industry categories as an array (choose ONLY from: ${COMPANY_CATEGORIES.join(", ")}) - use exact capitalization as shown, do not create new categories
8. Specific subcategories as an array. For technology companies, choose from: ${COMPANY_SUBCATEGORIES.Technology.join(", ")}. For finance companies, choose from: ${COMPANY_SUBCATEGORIES.Finance.join(", ")}. For other industries, use relevant descriptive subcategories.
9. Company tags as an array (any relevant descriptive tags not captured by the other fields - keep this to only 2-3 tags)
10. Office locations (as an array of "City, Country Code" format)
   Use these exact formats for locations:
   - "San Francisco, USA" for San Francisco Bay Area
   - "New York, USA" for New York City
   - "London, GBR" for London
   - "Remote" for Remote work (no country code)
   - "Los Angeles, USA" for Los Angeles
   - "Chicago, USA" for Chicago
   - "Boston, USA" for Boston
   - "Seattle, USA" for Seattle
   - "Austin, USA" for Austin
   - "Toronto, CAN" for Toronto
   - "Singapore, SGP" for Singapore
   For other cities, use "City Name, 3-letter Country Code" format
11. Recent financing round (if any) with amount and date. If the amount is not in USD, convert it to USD.
12. Known investors (if any) - 
use these exact full names for known investors:
   - "Andreessen Horowitz" (also known as a16z)
   - "Sequoia Capital"
   - "General Catalyst"
   - "Bessemer Venture Partners"
   - "Kleiner Perkins"
   - "Greylock Partners"
   - "Accel"
   - "Benchmark"
   - "First Round Capital"
   - "Founders Fund"
   - "GV" (Google Ventures)
   - "Intel Capital"
   - "Khosla Ventures"
   - "Lightspeed Venture Partners"
   - "NEA" (New Enterprise Associates)
   - "Redpoint Ventures"
   - "Union Square Ventures"
   - "Y Combinator"
   For other investors, use their full official company name



Only include information you're confident about. If information is not available or uncertain, omit that field.

IMPORTANT: 
- For categories, you MUST choose from the exact list provided. Do not create new categories or use variations. If none fit perfectly, choose the closest match or use "Other".
- For URLs (website and logoUrl), you MUST include the full protocol (https://) and domain. Examples: "https://perplexity.ai" NOT "perplexity.ai"`;

      const result = await chainLLMs(schema, researchPrompt, structurePrompt);

      console.log("Company details fetched:", result);
      return result;
    } catch (error) {
      console.error("Error fetching company details:", error);

      // Re-throw with more context for frontend error handling
      if (error instanceof Error) {
        if (
          error.message.includes("No object generated") ||
          error.message.includes("Type validation failed")
        ) {
          throw new Error(
            "AI couldn't parse company information properly. The response may not match the expected format.",
          );
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          throw new Error("Network error while fetching company details.");
        } else {
          throw new Error(`Failed to fetch company details: ${error.message}`);
        }
      }

      // Fallback: return empty object for unknown errors
      return {};
    }
  },
});
