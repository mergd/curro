import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

import { AI_MODEL } from "../constants";
import { BaseATSAdapter } from "./base";

// Simple schema for extracting just URLs
const JobLinksParseResultSchema = z.object({
  urls: z.array(z.string().url()),
});

type JobLinksParseResult = z.infer<typeof JobLinksParseResultSchema>;

// OpenRouter client configuration
const openRouterClient = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export class GenericAdapter extends BaseATSAdapter {
  name = "Generic";

  /**
   * Synchronous extraction not implemented – always returns empty list.
   */
  extractJobLinks(_html: string, _baseUrl: string): string[] {
    return [];
  }

  /**
   * AI-powered asynchronous extraction of job links.
   */
  async extractJobLinksAsync(html: string, baseUrl: string): Promise<string[]> {
    try {
      console.log("Using AI for job link extraction");
      const { urls } = await this.parseJobLinks(html);

      const links = urls
        .filter((u): u is string => typeof u === "string" && u.length > 0)
        .map((u) => (u.startsWith("http") ? u : new URL(u, baseUrl).href));

      return Array.from(new Set(links));
    } catch (error) {
      console.error("AI parsing failed in GenericAdapter:", error);
      throw error;
    }
  }

  private async parseJobLinks(html: string): Promise<JobLinksParseResult> {
    const cleanedHtml = this.cleanHtmlForParsing(html, 6000);

    const { object } = await generateObject({
      model: openRouterClient(AI_MODEL),
      schema: JobLinksParseResultSchema,
      prompt: `
Extract job listing URLs from this HTML content. Only return the URLs/links that lead to individual job postings.

Look for:
- URLs containing "/jobs/", "/careers/", "/job/", "/position/"
- Links that clearly lead to individual job postings (not category pages)

Return only the URLs as an array of strings. Ignore navigation links, footer links, or other non-job-related links.

HTML content to parse:
${cleanedHtml}
      `,
    });

    return object;
  }

  private cleanHtmlForParsing(html: string, maxLength: number = 6000): string {
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
}
