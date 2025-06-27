import { ATSAdapter } from "./types";

export abstract class BaseATSAdapter implements ATSAdapter {
  abstract name: string;
  abstract extractJobLinks(html: string, baseUrl: string): string[];

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
}
