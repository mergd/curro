import { ConvexError } from "convex/values";

export interface ParsedJob {
  title: string;
  url: string;
  description: string;
  locations?: string[];
  educationLevel?: string;
  yearsOfExperience?: {
    min: number;
    max?: number;
  };
  roleType?: string;
  isInternship?: boolean;
  internshipRequirements?: {
    graduationDate?: string;
    eligiblePrograms?: string[];
    additionalRequirements?: string;
  };
  additionalRequirements?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: "hourly" | "annual";
  };
  remoteOptions?: "on-site" | "remote" | "hybrid";
  equity?: {
    offered: boolean;
    percentage?: number;
    details?: string;
  };
}

export interface JobListingParseResult {
  jobs: ParsedJob[];
}

const JOB_LISTING_EXTRACTION_PROMPT = `
You are a job listing parser. Extract job information from the provided HTML and return a JSON object with the following structure:

{
  "jobs": [
    {
      "title": "Job Title",
      "url": "/relative/url/to/job",
      "description": "Brief job description if available",
      "locations": ["Location 1", "Location 2"] // or null if not specified
      // Include other fields only if clearly specified in the content
    }
  ]
}

Focus on extracting:
1. Job title (required)
2. Job URL/link (required) 
3. Brief description if visible
4. Location(s) if mentioned
5. Only include other fields if they are clearly stated

Return valid JSON only, no additional text.
`;

const JOB_DETAIL_EXTRACTION_PROMPT = `
You are a job detail parser. Extract detailed job information from the provided HTML and return a JSON object matching this schema:

{
  "title": "Job Title",
  "description": "Full job description",
  "locations": ["Location 1", "Location 2"], // Array of locations or null
  "educationLevel": "bachelors" | "masters" | "phd" | "high-school" | "associates" | "bootcamp" | "self-taught" | "no-requirement" | null,
  "yearsOfExperience": { "min": 2, "max": 5 } | null,
  "roleType": "software-engineering" | "data-science" | "product-management" | "design" | "marketing" | "sales" | "operations" | "finance" | "hr" | "legal" | "customer-success" | "business-development" | "general-apply" | null,
  "isInternship": true | false | null,
  "internshipRequirements": {
    "graduationDate": "2025-05-01",
    "eligiblePrograms": ["undergraduate", "graduate"],
    "additionalRequirements": "Must be enrolled in Computer Science program"
  } | null,
  "additionalRequirements": "Additional text requirements that don't fit structured fields" | null,
  "salaryRange": {
    "min": 80000,
    "max": 120000,
    "currency": "USD",
    "period": "annual" | "hourly"
  } | null,
  "remoteOptions": "on-site" | "remote" | "hybrid" | null,
  "equity": {
    "offered": true | false,
    "percentage": 0.5, // if mentioned
    "details": "Stock options vesting over 4 years"
  } | null
}

Instructions:
- Only include fields that are clearly mentioned in the content
- For experience, extract minimum and maximum years if specified
- For education, map to one of the allowed enum values
- For salary, extract numbers and currency
- For equity, look for mentions of stock options, equity, or ownership
- Be conservative - if unsure, use null
- Return valid JSON only, no additional text
`;

export async function parseJobListings(html: string): Promise<JobListingParseResult> {
  try {
    // Clean HTML and extract job listings
    const cleanedHtml = cleanHtmlForParsing(html);
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `${JOB_LISTING_EXTRACTION_PROMPT}\n\nHTML to parse:\n${cleanedHtml}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new ConvexError(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    try {
      const parsed = JSON.parse(content) as JobListingParseResult;
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new ConvexError("Invalid JSON response from AI parser");
    }
  } catch (error) {
    console.error("AI parsing error:", error);
    // Fallback to basic regex parsing
    return fallbackParseJobListings(html);
  }
}

export async function parseJobDetails(html: string): Promise<Partial<ParsedJob>> {
  try {
    const cleanedHtml = cleanHtmlForParsing(html, 8000); // Longer limit for job details
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `${JOB_DETAIL_EXTRACTION_PROMPT}\n\nHTML to parse:\n${cleanedHtml}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new ConvexError(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    try {
      const parsed = JSON.parse(content) as Partial<ParsedJob>;
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return {}; // Return empty object if parsing fails
    }
  } catch (error) {
    console.error("AI parsing error:", error);
    return {}; // Return empty object on error
  }
}

function cleanHtmlForParsing(html: string, maxLength: number = 4000): string {
  // Remove script and style tags
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Truncate if too long
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '...';
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