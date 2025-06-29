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

/**
 * Clean HTML for AI processing (utility function)
 */
export function cleanHtmlForAI(html: string, maxLength: number = 6000): string {
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
