export interface ATSAdapter {
  name: string;
  /**
   * Extract absolute or relative job links from the provided HTML.
   * Returned strings should be URLs (relative or absolute) that point to individual job postings.
   * Can be async to support JavaScript rendering.
   */
  extractJobLinks(html: string, baseUrl: string): string[] | Promise<string[]>;
}

export type ATSType = "ashby" | "greenhouse" | "other";

export interface ScrapingResult {
  links: string[];
  atsType: ATSType;
  totalFound: number;
}

export interface PaginationInfo {
  hasNextPage: boolean;
  nextPageUrl?: string;
  totalJobs?: number;
  currentPage: number;
}
