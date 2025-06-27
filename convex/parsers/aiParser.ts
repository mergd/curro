import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

import { AI_MODEL } from "../constants";

// Zod schemas for structured parsing
const ParsedJobSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string().optional(),
  locations: z.array(z.string()).optional(),
  educationLevel: z
    .enum([
      "high-school",
      "associates",
      "bachelors",
      "masters",
      "phd",
      "bootcamp",
      "self-taught",
      "no-requirement",
    ])
    .optional(),
  yearsOfExperience: z
    .object({
      min: z.number(),
      max: z.number().optional(),
    })
    .optional(),
  roleType: z
    .enum([
      "software-engineering",
      "data-science",
      "product-management",
      "design",
      "marketing",
      "sales",
      "operations",
      "finance",
      "hr",
      "legal",
      "customer-success",
      "business-development",
      "general-apply",
    ])
    .optional(),
  isInternship: z.boolean().optional(),
  internshipRequirements: z
    .object({
      graduationDate: z.string().optional(),
      eligiblePrograms: z.array(z.string()).optional(),
      additionalRequirements: z.string().optional(),
    })
    .optional(),
  additionalRequirements: z.string().optional(),
  salaryRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
      period: z.enum(["hourly", "annual"]).optional(),
    })
    .optional(),
  remoteOptions: z.enum(["on-site", "remote", "hybrid"]).optional(),
  equity: z
    .object({
      offered: z.boolean(),
      percentage: z.number().optional(),
      details: z.string().optional(),
    })
    .optional(),
});

const JobListingParseResultSchema = z.object({
  jobs: z.array(ParsedJobSchema),
});

const JobDetailParseResultSchema = ParsedJobSchema.partial();

export type ParsedJob = z.infer<typeof ParsedJobSchema>;
export type JobListingParseResult = z.infer<typeof JobListingParseResultSchema>;
export type JobDetailParseResult = z.infer<typeof JobDetailParseResultSchema>;

// OpenRouter client configuration for Gemini
const openRouterClient = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function parseJobListings(
  html: string,
): Promise<JobListingParseResult> {
  try {
    const cleanedHtml = cleanHtmlForParsing(html, 6000);

    const { object } = await generateObject({
      model: openRouterClient(AI_MODEL),
      schema: JobListingParseResultSchema,
      prompt: `
Extract job listings from this HTML content. Focus on finding:
1. Job titles and their URLs/links
2. Brief descriptions if visible on the listing page
3. Location information if mentioned
4. Any other details that are clearly visible

Only include jobs that have both a title and a URL. Convert relative URLs to be relative to the current page.

HTML content to parse:
${cleanedHtml}
      `,
    });

    return object;
  } catch (error) {
    console.error("AI parsing error:", error);
    // Fallback to basic regex parsing
    return fallbackParseJobListings(html);
  }
}

export async function parseJobDetails(
  html: string,
): Promise<JobDetailParseResult> {
  try {
    const cleanedHtml = cleanHtmlForParsing(html, 12000);

    const { object } = await generateObject({
      model: openRouterClient(AI_MODEL),
      schema: JobDetailParseResultSchema,
      prompt: `
Extract detailed job information from this job posting HTML. Look for:

1. **Education Requirements**: Look for mentions of degree requirements (high school, bachelor's, master's, PhD, bootcamp, self-taught, or no requirements)
2. **Experience**: Extract years of experience required (e.g., "2-5 years", "3+ years")
3. **Role Type**: Categorize the role (software engineering, data science, product management, design, marketing, sales, operations, finance, HR, legal, customer success, business development, or general apply)
4. **Internship**: Determine if this is an internship position and extract any graduation requirements
5. **Location**: Extract all mentioned locations where this job can be performed
6. **Salary**: Look for salary ranges, hourly rates, or annual compensation
7. **Remote Work**: Determine if the position is on-site, remote, or hybrid
8. **Equity**: Look for mentions of stock options, equity, ownership percentage, or equity compensation
9. **Additional Requirements**: Any other important requirements that don't fit the structured fields

Be conservative - only include information that is clearly stated. If unsure, omit the field.

HTML content to parse:
${cleanedHtml}
      `,
    });

    return object;
  } catch (error) {
    console.error("AI parsing error:", error);
    return {}; // Return empty object on error
  }
}

function cleanHtmlForParsing(html: string, maxLength: number = 6000): string {
  // Remove script and style tags
  let cleaned = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  cleaned = cleaned.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    "",
  );

  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Remove excessive whitespace but preserve some structure
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/>\s+</g, "><");

  // Truncate if too long
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + "...";
  }

  return cleaned.trim();
}

function fallbackParseJobListings(html: string): JobListingParseResult {
  const jobs: ParsedJob[] = [];

  // Generic job link patterns that might work across different ATS systems
  const patterns = [
    // Ashby-style
    /<a[^>]+href="([^"]*\/jobs\/[^"]*)"[^>]*>.*?<div[^>]*>([^<]+)<\/div>/gi,
    // Greenhouse-style
    /<a[^>]+href="([^"]*\/jobs\/[^"]*)"[^>]*>([^<]+)<\/a>/gi,
    // Generic job links
    /<a[^>]+href="([^"]*job[^"]*)"[^>]*>([^<]+)<\/a>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].trim();

      if (title && url && title.length > 3 && title.length < 200) {
        jobs.push({
          title,
          url,
          description: "",
        });
      }
    }

    if (jobs.length > 0) break; // Use first successful pattern
  }

  return { jobs };
}
