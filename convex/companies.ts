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

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("companies"),
      _creationTime: v.number(),
      name: v.string(),
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
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});

export const get = query({
  args: { id: v.id("companies") },
  returns: v.union(
    v.object({
      _id: v.id("companies"),
      _creationTime: v.number(),
      name: v.string(),
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

        return {
          id: company._id,
          name: company.name,
          recentErrorCount: recentErrors.length,
          lastError:
            recentErrors.length > 0
              ? recentErrors[recentErrors.length - 1]
              : null,
          isProblematic: recentErrors.length >= 10, // MAX_ERRORS_PER_24H
        };
      })
      .sort((a, b) => b.recentErrorCount - a.recentErrorCount);
  },
});

export const fetchCompanyDetailsFromPerplexity = action({
  args: {
    companyName: v.string(),
    companyUrl: v.optional(v.string()),
  },
  returns: v.object({
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

1. Official website URL (must be valid URL format)
2. Logo URL (if publicly available, must be valid URL format)
3. Approximate number of employees (choose from: ${EMPLOYEE_COUNT_RANGES.join(", ")})
4. Company stage (choose from: ${COMPANY_STAGES.join(", ")})
5. Industry categories as an array (choose from: ${COMPANY_CATEGORIES.join(", ")})
6. Specific subcategories as an array. For technology companies, choose from: ${COMPANY_SUBCATEGORIES.technology.join(", ")}. For finance companies, choose from: ${COMPANY_SUBCATEGORIES.finance.join(", ")}. For other industries, use relevant descriptive subcategories.
7. Company tags as an array (any relevant descriptive tags like business model, characteristics, etc.)
8. Office locations (as an array of city, 3 char country code)
   Use these consistent names for places:
   - San Francisco Bay Area, USA
   - New York City, USA
   - Singapore, SG
9. Recent financing round (if any) with amount converted to USD dollars (do the currency conversion math) and date
10. Known investors (if any) - 
use these consistent names for known investors:
   - Andreessen Horowitz → "a16z"
   - Sequoia Capital → "Sequoia"
   - General Catalyst → "General Catalyst"
   - Bessemer Venture Partners → "Bessemer"
   - Kleiner Perkins → "Kleiner Perkins"
   - Greylock Partners → "Greylock"
   - Accel → "Accel"
   - Benchmark → "Benchmark"
   - First Round Capital → "First Round"
   - Founders Fund → "Founders Fund"
   - GV (Google Ventures) → "GV"
   - Intel Capital → "Intel Capital"
   - Khosla Ventures → "Khosla Ventures"
   - Lightspeed Venture Partners → "Lightspeed"
   - NEA (New Enterprise Associates) → "NEA"
   - Redpoint Ventures → "Redpoint"
   - Union Square Ventures → "USV"
   - Y Combinator → "Y Combinator"
   For other investors, use their most commonly known short form

Only include information you're confident about. If information is not available or uncertain, omit that field.`;

      const result = await chainLLMs(schema, researchPrompt, structurePrompt);

      console.log("Company details fetched:", result);
      return result;
    } catch (error) {
      console.error("Error fetching company details:", error);
      // Return empty object if API fails
      return {};
    }
  },
});
