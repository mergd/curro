import { createPerplexity } from "@ai-sdk/perplexity";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject, generateText } from "ai";
import { z } from "zod";

// AI Model Configuration
export const AI_MODELS = {
  // For raw information gathering and research
  PERPLEXITY: "sonar-pro",
  // For structured output generation
  GEMINI: "google/gemini-2.5-flash-preview-05-20",
} as const;

// Client configurations
const openRouterClient = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const perplexityClient = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY!,
});

/**
 * Generate raw research information using Perplexity
 */
export async function generateRawInfo(prompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: perplexityClient(AI_MODELS.PERPLEXITY),
      prompt,
    });
    return text;
  } catch (error) {
    console.error("Perplexity API error:", error);
    throw new Error("Failed to generate raw information");
  }
}

/**
 * Generate structured output using Gemini via OpenRouter
 */
export async function generateStructuredOutput<T>(
  schema: z.ZodSchema<T>,
  prompt: string,
  rawInfo?: string,
): Promise<T> {
  try {
    const finalPrompt = rawInfo
      ? `${prompt}\n\nBased on this research information:\n${rawInfo}`
      : prompt;

    const { object } = await generateObject({
      model: openRouterClient(AI_MODELS.GEMINI),
      schema,
      prompt: finalPrompt,
    });

    return object;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate structured output");
  }
}

/**
 * LLM Chain: Use Perplexity for research, then Gemini for structured output
 */
export async function chainLLMs<T>(
  schema: z.ZodSchema<T>,
  researchPrompt: string,
  structurePrompt: string,
): Promise<T> {
  // Step 1: Get raw information from Perplexity
  const rawInfo = await generateRawInfo(researchPrompt);

  // Step 2: Structure the information with Gemini
  return await generateStructuredOutput(schema, structurePrompt, rawInfo);
}

/**
 * Simple structured generation without chaining (for when we already have the data)
 */
export async function generateStructuredOnly<T>(
  schema: z.ZodSchema<T>,
  prompt: string,
): Promise<T> {
  return await generateStructuredOutput(schema, prompt);
}

// Aggressive HTML stripping - removes borderline elements that might contain content
function stripHtmlAggressive(htmlContent: string): string {
  let content = htmlContent;

  // Extract content from meta tags before removing them
  const ogDescriptionMatch = content.match(
    /<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i,
  );
  const descriptionMatch = content.match(
    /<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i,
  );

  // Extract JSON-LD structured data (Ashby-specific: contains compensation info)
  const jsonLdMatch = content.match(
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  );

  // Extract Ashby window.__appData (contains job postings data)
  const ashbyAppDataMatch = content.match(
    /window\.__appData\s*=\s*({[\s\S]*?});/i,
  );

  let extractedContent = "";

  // Handle Ashby app data extraction
  if (ashbyAppDataMatch) {
    try {
      const appData = JSON.parse(ashbyAppDataMatch[1]);

      // Extract organization info
      if (appData.organization) {
        extractedContent += `COMPANY: ${appData.organization.name}\n`;
        if (appData.organization.publicWebsite) {
          extractedContent += `WEBSITE: ${appData.organization.publicWebsite}\n`;
        }
      }

      // Extract job postings
      if (appData.jobBoard?.jobPostings) {
        extractedContent += `\nJOB POSTINGS:\n`;
        appData.jobBoard.jobPostings.forEach((job: any) => {
          extractedContent += `\n--- ${job.title} ---\n`;
          extractedContent += `Department: ${job.departmentName}\n`;
          extractedContent += `Team: ${job.teamName}\n`;
          extractedContent += `Location: ${job.locationName}\n`;
          extractedContent += `Employment Type: ${job.employmentType}\n`;
          if (job.workplaceType) {
            extractedContent += `Workplace Type: ${job.workplaceType}\n`;
          }
          if (job.compensationTierSummary) {
            extractedContent += `Compensation: ${job.compensationTierSummary}\n`;
          }
          if (job.publishedDate) {
            extractedContent += `Published: ${job.publishedDate}\n`;
          }
          if (job.jobRequisitionId) {
            extractedContent += `Requisition ID: ${job.jobRequisitionId}\n`;
          }
          extractedContent += `\n`;
        });
      }

      // Extract specific job posting if available
      if (appData.posting) {
        extractedContent += `\nJOB DETAILS:\n`;
        extractedContent += `Title: ${appData.posting.title}\n`;
        extractedContent += `Department: ${appData.posting.departmentName}\n`;
        if (appData.posting.descriptionHtml) {
          // Recursively clean the job description HTML
          const cleanDescription = stripHtmlAggressive(
            appData.posting.descriptionHtml,
          );
          extractedContent += `Description:\n${cleanDescription}\n`;
        }
      }
    } catch (e) {
      console.log("Failed to parse Ashby app data:", e);
    }
  }

  if (ogDescriptionMatch) {
    extractedContent += ogDescriptionMatch[1] + "\n\n";
  } else if (descriptionMatch) {
    extractedContent += descriptionMatch[1] + "\n\n";
  }

  // Add structured data if found
  if (jsonLdMatch) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      if (jsonData.baseSalary) {
        extractedContent += `\n\nCOMPENSATION:\n`;
        const salary = jsonData.baseSalary;
        if (salary.value) {
          const min = salary.value.minValue || "";
          const max = salary.value.maxValue || "";
          const currency = salary.currency || "";
          const unit = salary.value.unitText || "";
          // Map YEAR to annual for schema compatibility
          const mappedUnit = unit === "YEAR" ? "annual" : unit.toLowerCase();
          extractedContent += `${min}${max ? "-" + max : ""} ${currency} ${mappedUnit}\n\n`;
        }
      }
    } catch (e) {
      // If JSON parsing fails, just continue without structured data
    }
  }

  // Remove CSS styles completely
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Remove JavaScript completely
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Remove CSS within style attributes
  content = content.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, "");

  // Remove common non-content elements
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
  content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");

  // Remove form elements
  content = content.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, "");
  content = content.replace(/<input[^>]*>/gi, "");
  content = content.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, "");
  content = content.replace(/<select[^>]*>[\s\S]*?<\/select>/gi, "");
  content = content.replace(/<textarea[^>]*>[\s\S]*?<\/textarea>/gi, "");

  // Remove meta tags
  content = content.replace(/<meta[^>]*>/gi, "");

  // Remove link tags (CSS/favicon references)
  content = content.replace(/<link[^>]*>/gi, "");

  // Convert lists to readable format
  content = content.replace(/<ul[^>]*>/gi, "\n");
  content = content.replace(/<\/ul>/gi, "\n");
  content = content.replace(/<ol[^>]*>/gi, "\n");
  content = content.replace(/<\/ol>/gi, "\n");
  content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "• $1\n");

  // Convert emphasis tags to readable format
  content = content.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  content = content.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  content = content.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  content = content.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");

  // Convert links to readable format
  content = content.replace(
    /<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    "$2 ($1)",
  );

  // Convert tables to readable format
  content = content.replace(/<table[^>]*>/gi, "\n\n--- TABLE ---\n");
  content = content.replace(/<\/table>/gi, "\n--- END TABLE ---\n\n");
  content = content.replace(/<tr[^>]*>/gi, "");
  content = content.replace(/<\/tr>/gi, "\n");
  content = content.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, " | $1");
  content = content.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, " | **$1**");
  content = content.replace(/<thead[^>]*>/gi, "");
  content = content.replace(/<\/thead>/gi, "");
  content = content.replace(/<tbody[^>]*>/gi, "");
  content = content.replace(/<\/tbody>/gi, "");

  // Add spacing for block elements
  content = content.replace(/<div[^>]*>/gi, "\n");
  content = content.replace(/<\/div>/gi, "\n");
  content = content.replace(/<section[^>]*>/gi, "\n\n");
  content = content.replace(/<\/section>/gi, "\n\n");
  content = content.replace(/<article[^>]*>/gi, "\n\n");
  content = content.replace(/<\/article>/gi, "\n\n");

  // Convert additional HTML entities
  content = content.replace(/&mdash;/g, "—");
  content = content.replace(/&ndash;/g, "–");
  content = content.replace(/&hellip;/g, "…");
  content = content.replace(/&nbsp;/g, " ");
  content = content.replace(/&amp;/g, "&");
  content = content.replace(/&lt;/g, "<");
  content = content.replace(/&gt;/g, ">");
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#39;/g, "'");

  // Remove remaining HTML tags
  content = content.replace(/<\/?[^>]+>/g, "");

  // Clean up whitespace
  content = content.replace(/\n{4,}/g, "\n\n\n");
  content = content.replace(/[ \t]+/g, " ");
  content = content.trim();

  // Filter out common non-content phrases
  const nonContentPhrases = [
    "You need to enable JavaScript to run this app.",
    ".grecaptcha-badge",
    "visibility: hidden",
    "@keyframes",
    "animation-",
    "border-",
    "display:",
    "flex-",
    "height:",
    "width:",
    "justify-content:",
    "align-items:",
    "transform:",
    "opacity:",
    "from {",
    "to {",
    "100%",
    "linear",
    "ease-in-out",
    "rgba(",
    "var(--",
  ];

  // Remove lines that are primarily CSS or JavaScript artifacts
  const lines = content.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return true;

    // Skip lines that are primarily CSS/JS artifacts
    const containsNonContent = nonContentPhrases.some((phrase) =>
      trimmedLine.includes(phrase),
    );

    // Skip lines that are mostly CSS property-like
    const isCssLike = /^[a-z-]+:\s*[^;]+;?$/i.test(trimmedLine);

    return !containsNonContent && !isCssLike;
  });

  content = filteredLines.join("\n");

  return extractedContent + content;
}

/**
 * Clean HTML for AI processing (utility function)
 */
export function cleanHtmlForAI(
  html: string,
  maxLength?: number,
  aggressive = false,
): string {
  let cleanedAggressive = stripHtmlAggressive(html);
  console.log("cleanedAggressive", cleanedAggressive.slice(0, 2000));
  console.log("len cleanedAggressive", cleanedAggressive.length);

  // // Truncate if too long
  // if (maxLength && cleaned.length > maxLength) {
  //   cleaned = cleaned.substring(0, maxLength);
  // }

  return cleanedAggressive;
}
