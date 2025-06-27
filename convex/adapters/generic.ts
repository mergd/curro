import { parseJobListings } from "../parsers/aiParser";
import { BaseATSAdapter } from "./base";

export class GenericAdapter extends BaseATSAdapter {
  name = "Generic";

  /**
   * Synchronous extraction not implemented – always returns empty list.
   */
  extractJobLinks(_html: string, _baseUrl: string): string[] {
    return [];
  }

  /**
   * AI-powered asynchronous extraction of job links. Evaluates anchor tag link + text.
   */
  async extractJobLinksAsync(html: string, baseUrl: string): Promise<string[]> {
    try {
      console.log("Using AI fallback for job link extraction");
      const { jobs } = await parseJobListings(html);

      const links = jobs
        .map((job) => job.url)
        .filter((u): u is string => typeof u === "string" && u.length > 0)
        .map((u) => (u.startsWith("http") ? u : new URL(u, baseUrl).href));

      return Array.from(new Set(links));
    } catch (error) {
      console.error("AI parsing failed in GenericAdapter:", error);
      return [];
    }
  }
}
