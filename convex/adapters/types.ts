export interface ATSAdapter {
  name: string;
  /**
   * Extract absolute or relative job links from the provided HTML.
   * Returned strings should be URLs (relative or absolute) that point to individual job postings.
   */
  extractJobLinks(html: string, baseUrl: string): string[];
}

export type ATSType = "ashby" | "greenhouse" | "lever" | "workday" | "other";

export interface ScrapingResult {
  links: string[];
  atsType: ATSType;
  totalFound: number;
}
