import { z } from "zod";

import { cleanHtmlForAI, generateStructuredOnly } from "../../lib/ai";
import {
  COMPENSATION_TYPES,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  REMOTE_OPTIONS,
  ROLE_TYPES,
} from "../../lib/constants";

// Zod schemas for structured parsing
const ParsedJobSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string().optional(),
  locations: z.array(z.string()).optional(), // Format: "City, XXX" (3-char country code)
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  yearsOfExperience: z
    .object({
      min: z.number(),
      max: z.number().optional(),
    })
    .optional(),
  roleType: z.enum(ROLE_TYPES).optional(),
  roleSubcategory: z.string().optional(), // e.g., "fullstack", "backend", "frontend", "mobile", "devops", "ml-engineer", etc.
  employmentType: z.enum(EMPLOYMENT_TYPES).default("Permanent").optional(),
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

  remoteOptions: z.enum(REMOTE_OPTIONS).optional(),
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

// Resume parsing schema
const ParsedResumeSchema = z.object({
  // Personal info
  fullName: z.string().optional(),
  currentLocation: z.string().optional(), // Format: "City, XXX" (3-char country code)

  // Education
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),

  // Experience and skills
  yearsOfExperience: z.number().optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  isCurrentlyEmployed: z.boolean().optional(),

  // Role preferences (inferred from experience)
  interestedRoleTypes: z.array(z.enum(ROLE_TYPES)).optional(),

  // Skills and interests
  technicalSkills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),

  // Notable achievements or facts
  keyAchievements: z.array(z.string()).optional(),
});

export type ParsedJob = z.infer<typeof ParsedJobSchema>;
export type JobListingParseResult = z.infer<typeof JobListingParseResultSchema>;
export type JobDetailParseResult = z.infer<typeof JobDetailParseResultSchema>;
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

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

    const educationLevelsList = EDUCATION_LEVELS.map(
      (level) => `"${level}"`,
    ).join(", ");
    const roleTypesList = ROLE_TYPES.map((type) => `"${type}"`).join(", ");
    const employmentTypesList = EMPLOYMENT_TYPES.map(
      (type) => `"${type}"`,
    ).join(", ");
    const remoteOptionsList = REMOTE_OPTIONS.map(
      (option) => `"${option}"`,
    ).join(", ");

    const prompt = `Extract detailed job information from this job posting HTML. Look for:

1. **Education Requirements**: Look for mentions of degree requirements. Use proper case format: ${educationLevelsList}
2. **Experience**: Extract years of experience required (e.g., "2-5 years", "3+ years")
3. **Role Type**: Categorize the role using proper case format: ${roleTypesList}
4. **Role Subcategory**: For software engineering roles, specify subcategory like "fullstack", "backend", "frontend", "mobile", "devops", "ml-engineer", "security", "platform", etc. For other roles, use relevant subcategories.
5. **Employment Type**: Determine the employment type using proper case format: ${employmentTypesList}
6. **Internship Requirements**: If employment type is "Internship", extract any graduation requirements
7. **Location**: Extract all mentioned locations in the format "City, XXX" where XXX is the 3-character country code (e.g., "San Francisco, USA", "London, GBR", "Berlin, DEU"). Normalize city names (SF → San Francisco, NYC → New York City).
8. **Compensation**: Look for salary information and categorize as annual, hourly, weekly, or monthly. Extract min/max ranges and currency.
9. **Remote Work**: Determine if the position is using proper case format: ${remoteOptionsList}
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

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  try {
    const educationLevelsList = EDUCATION_LEVELS.map(
      (level) => `"${level}"`,
    ).join(", ");
    const roleTypesList = ROLE_TYPES.map((type) => `"${type}"`).join(", ");

    const prompt = `Extract structured information from this resume text. Look for:

1. **Personal Information**:
   - Full name
   - Current location in format "City, XXX" where XXX is 3-character country code (e.g., "San Francisco, USA", "London, GBR")

2. **Education Level**: Determine the highest education level using: ${educationLevelsList}

3. **Experience**:
   - Total years of professional experience (approximate)
   - Current company name (if employed)
   - Current role/title (if employed)
   - Whether currently employed (true/false)

4. **Role Types**: Based on experience and skills, determine what role types this person would be interested in: ${roleTypesList}
   - Look at their job titles, responsibilities, and skills to infer this
   - Can include multiple role types

5. **Skills and Interests**:
   - Technical skills (programming languages, tools, technologies)
   - Professional interests or areas of expertise
   - Limit to 5-8 most relevant items each

6. **Key Achievements**: Extract 3-4 most impressive accomplishments, projects, or notable facts about their career

**Location Normalization Examples:**
- SF, San Francisco, Bay Area → "San Francisco, USA"
- NYC, New York → "New York City, USA"
- London, UK → "London, GBR"
- Berlin, Germany → "Berlin, DEU"

Be conservative - only extract information that is clearly stated. If unsure about something, omit that field.

Resume text to parse:
${resumeText}`;

    console.log(prompt);

    return await generateStructuredOnly(ParsedResumeSchema, prompt);
  } catch (error) {
    console.error("Resume parsing error:", error);
    return {}; // Return empty object on error
  }
}
