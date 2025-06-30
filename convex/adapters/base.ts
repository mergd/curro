import { ATSAdapter } from "./types";

export abstract class BaseATSAdapter implements ATSAdapter {
  abstract name: string;
  abstract extractJobLinks(
    html: string,
    baseUrl: string,
  ): string[] | Promise<string[]>;

  protected cleanText(text: string): string {
    return text.trim().replace(/\s+/g, " ");
  }

  protected resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith("http")) {
      return url;
    }
    return new URL(url, baseUrl).href;
  }

  protected extractTextContent(element: string): string {
    // Simple text extraction - remove HTML tags
    return element.replace(/<[^>]*>/g, "").trim();
  }

  protected extractJobCount(html: string): number | null {
    // Common patterns for job count extraction
    const patterns = [/(\d+)\s+jobs?/i];

    const match = html.match(patterns[0]);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return null;
  }
}
