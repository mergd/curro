import { z } from "zod";

import { cleanHtmlForAI, generateStructuredOnly } from "../../lib/ai";
import { BaseATSAdapter } from "./base";

// Simple schema for extracting just URLs
const JobLinksParseResultSchema = z.object({
  urls: z.array(z.string().url()),
});

type JobLinksParseResult = z.infer<typeof JobLinksParseResultSchema>;

export class GenericAdapter extends BaseATSAdapter {
  name = "Generic";

  /**
   * AI-powered asynchronous extraction of job links.
   */
  async extractJobLinks(html: string, baseUrl: string): Promise<string[]> {
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
    const cleanedHtml = cleanHtmlForAI(html, 6000);

    const prompt = `Extract job listing URLs from this HTML content. Only return the URLs/links that lead to individual job postings.

Look for:
- URLs containing "/jobs/", "/careers/", "/job/", "/position/"
- Links that clearly lead to individual job postings (not category pages)

Return only the URLs as an array of strings. Ignore navigation links, footer links, or other non-job-related links.

HTML content to parse:
${cleanedHtml}`;

    return await generateStructuredOnly(JobLinksParseResultSchema, prompt);
  }
}
