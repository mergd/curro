import { z } from "zod";

import { cleanHtmlForAI, generateStructuredOnly } from "../../lib/ai";

// Zod schemas for structured parsing
const ParsedJobSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string().optional(),
  locations: z.array(z.string()).optional(), // Format: "City, XXX" (3-char country code)
  educationLevel: z
    .enum([
      "High School",
      "Associates",
      "Bachelors",
      "Masters",
      "PhD",
      "Bootcamp",
      "Self-Taught",
      "No Requirement",
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
      "Software Engineering",
      "Data Science",
      "Product Management",
      "Design",
      "Marketing",
      "Sales",
      "Operations",
      "Finance",
      "HR",
      "Legal",
      "Customer Success",
      "Business Development",
      "General Apply",
    ])
    .optional(),
  roleSubcategory: z.string().optional(), // e.g., "fullstack", "backend", "frontend", "mobile", "devops", "ml-engineer", etc.
  employmentType: z
    .enum([
      "Permanent",
      "Contract",
      "Part-Time",
      "Temporary",
      "Freelance",
      "Internship",
    ])
    .default("Permanent")
    .optional(),
  internshipRequirements: z
    .object({
      graduationDate: z.string().optional(),
      eligiblePrograms: z.array(z.string()).optional(),
      additionalRequirements: z.string().optional(),
    })
    .optional(),
  additionalRequirements: z.string().optional(),

  // Mutually exclusive salary structures
  compensation: z
    .union([
      z.object({
        type: z.literal("annual"),
        min: z.number().optional(),
        max: z.number().optional(),
        currency: z.string().optional(),
      }),
      z.object({
        type: z.literal("hourly"),
        min: z.number().optional(),
        max: z.number().optional(),
        currency: z.string().optional(),
      }),
      z.object({
        type: z.literal("weekly"),
        min: z.number().optional(),
        max: z.number().optional(),
        currency: z.string().optional(),
      }),
      z.object({
        type: z.literal("monthly"),
        min: z.number().optional(),
        max: z.number().optional(),
        currency: z.string().optional(),
      }),
    ])
    .optional(),

  remoteOptions: z.enum(["On-Site", "Remote", "Hybrid"]).optional(),
  remoteTimezonePreferences: z.array(z.string()).optional(), // e.g., ["CEST", "PST", "EST"]
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

export async function parseJobListings(
  html: string,
): Promise<JobListingParseResult> {
  try {
    const cleanedHtml = cleanHtmlForAI(html, 6000);

    const prompt = `Extract job listings from this HTML content. Focus on finding:
1. Job titles and their URLs/links
2. Brief descriptions if visible on the listing page
3. Location information if mentioned - normalize to "City, XXX" format where XXX is 3-char country code
4. Any other details that are clearly visible

Only include jobs that have both a title and a URL. Convert relative URLs to be relative to the current page.

For locations, normalize common abbreviations:
- SF, San Francisco → "San Francisco, USA"
- NYC, New York → "New York City, USA"
- London → "London, GBR"
- Berlin → "Berlin, DEU"

HTML content to parse:
${cleanedHtml}`;

    return await generateStructuredOnly(JobListingParseResultSchema, prompt);
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
    const cleanedHtml = cleanHtmlForAI(html, 12000);

    const prompt = `Extract detailed job information from this job posting HTML. Look for:

1. **Education Requirements**: Look for mentions of degree requirements. Use proper case format: "High School", "Associates", "Bachelors", "Masters", "PhD", "Bootcamp", "Self-Taught", or "No Requirement"
2. **Experience**: Extract years of experience required (e.g., "2-5 years", "3+ years")
3. **Role Type**: Categorize the role using proper case format: "Software Engineering", "Data Science", "Product Management", "Design", "Marketing", "Sales", "Operations", "Finance", "HR", "Legal", "Customer Success", "Business Development", or "General Apply"
4. **Role Subcategory**: For software engineering roles, specify subcategory like "fullstack", "backend", "frontend", "mobile", "devops", "ml-engineer", "security", "platform", etc. For other roles, use relevant subcategories.
5. **Employment Type**: Determine the employment type using proper case format: "Permanent" (default), "Contract", "Part-Time", "Temporary", "Freelance", or "Internship"
6. **Internship Requirements**: If employment type is "Internship", extract any graduation requirements
7. **Location**: Extract all mentioned locations in the format "City, XXX" where XXX is the 3-character country code (e.g., "San Francisco, USA", "London, GBR", "Berlin, DEU"). Normalize city names (SF → San Francisco, NYC → New York City).
8. **Compensation**: Look for salary information and categorize as annual, hourly, weekly, or monthly. Extract min/max ranges and currency.
9. **Remote Work**: Determine if the position is using proper case format: "On-Site", "Remote", or "Hybrid"
10. **Remote Timezone Preferences**: If remote/hybrid, look for timezone preferences. Convert regions to common timezone abbreviations (Europe → CEST, US East Coast → EST, US West Coast → PST, etc.)
11. **Equity**: Look for mentions of stock options, equity, ownership percentage, or equity compensation
12. **Additional Requirements**: Any other important requirements that don't fit the structured fields

**Location Normalization Examples:**
- SF, San Francisco → "San Francisco, USA"
- NYC, New York → "New York City, USA"

**Timezone Mapping Examples:**
- Europe, European time zones → ["CEST"]
- US East Coast, Eastern time → ["EST"]
Be conservative - only include information that is clearly stated. If unsure, omit the field.

HTML content to parse:
${cleanedHtml}`;

    return await generateStructuredOnly(JobDetailParseResultSchema, prompt);
  } catch (error) {
    console.error("AI parsing error:", error);
    return {}; // Return empty object on error
  }
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
