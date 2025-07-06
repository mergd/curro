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

// reduce the number of tokens by stripping unnecessary things from the html
function stripHtml(htmlContent: string): string {
  let content = htmlContent;

  // Remove script, style, svg, and link tags
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  content = content.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
  content = content.replace(/<link[^>]*>/gi, "");

  // Remove HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, "");

  // Convert code blocks to markdown
  content = content.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    "\n```\n$1\n```\n",
  );
  content = content.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  content = content.replace(
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    "\n```\n$1\n```\n",
  );

  // Convert headings to markdown
  content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
  content = content.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
  content = content.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");

  // Convert emphasis tags
  content = content.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  content = content.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  content = content.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  content = content.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");

  // Convert links to markdown format
  content = content.replace(
    /<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    "[$2]($1)",
  );

  // Convert lists
  content = content.replace(/<ul[^>]*>/gi, "\n");
  content = content.replace(/<\/ul>/gi, "\n");
  content = content.replace(/<ol[^>]*>/gi, "\n");
  content = content.replace(/<\/ol>/gi, "\n");
  content = content.replace(/<li[^>]*>/gi, "• ");
  content = content.replace(/<\/li>/gi, "\n");

  // Convert paragraphs and line breaks
  content = content.replace(/<p[^>]*>/gi, "\n");
  content = content.replace(/<\/p>/gi, "\n\n");
  content = content.replace(/<br[^>]*\/?>/gi, "\n");

  // Replace divs and spans with newlines/spaces
  content = content.replace(/<div[^>]*>/gi, "\n");
  content = content.replace(/<\/div>/gi, "\n");
  content = content.replace(/<span[^>]*>/gi, " ");
  content = content.replace(/<\/span>/gi, " ");

  // Convert tables
  content = content.replace(/<table[^>]*>/gi, "\n");
  content = content.replace(/<\/table>/gi, "\n");
  content = content.replace(/<tr[^>]*>/gi, "");
  content = content.replace(/<\/tr>/gi, "\n");
  content = content.replace(/<td[^>]*>/gi, " | ");
  content = content.replace(/<\/td>/gi, "");
  content = content.replace(/<th[^>]*>/gi, " | ");
  content = content.replace(/<\/th>/gi, "");
  content = content.replace(/<thead[^>]*>/gi, "");
  content = content.replace(/<\/thead>/gi, "");
  content = content.replace(/<tbody[^>]*>/gi, "");
  content = content.replace(/<\/tbody>/gi, "");

  // Remove any remaining HTML tags
  content = content.replace(/<\/?[^>]+>/g, " ");

  // Decode common HTML entities
  content = content.replace(/&nbsp;/g, " ");
  content = content.replace(/&amp;/g, "&");
  content = content.replace(/&lt;/g, "<");
  content = content.replace(/&gt;/g, ">");
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#39;/g, "'");
  content = content.replace(/&apos;/g, "'");
  content = content.replace(/&mdash;/g, "—");
  content = content.replace(/&ndash;/g, "–");
  content = content.replace(/&hellip;/g, "…");

  // Clean up whitespace
  content = content.replace(/[ \t]+/g, " ");
  content = content.replace(/\n[ \t]+/g, "\n");
  content = content.replace(/[ \t]+\n/g, "\n");
  content = content.replace(/\n{3,}/g, "\n\n");
  content = content.trim();

  return content;
}

/**
 * Clean HTML for AI processing (utility function)
 */
export function cleanHtmlForAI(html: string, maxLength: number = 8000): string {
  let cleaned = stripHtml(html);

  // Truncate if too long
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
}
