import { BaseATSAdapter } from "./base";

export class GreenhouseAdapter extends BaseATSAdapter {
  name = "Greenhouse";

  async extractJobLinks(html: string, baseUrl: string): Promise<string[]> {
    const allLinks: string[] = [];

    // Extract total job count from the first page
    const totalJobs = this.extractJobCount(html);
    console.log(`Greenhouse: Found ${totalJobs || "unknown"} total jobs`);

    // Extract links from the current page
    const currentPageLinks = this.extractJobLinksFromPage(html);
    allLinks.push(...currentPageLinks);

    // If we have a total job count and it's more than the current page size (50),
    // we need to fetch additional pages
    if (totalJobs && totalJobs > currentPageLinks.length) {
      const jobsPerPage = 50; // Greenhouse standard
      const totalPages = Math.ceil(totalJobs / jobsPerPage);

      console.log(`Greenhouse: Need to fetch ${totalPages} total pages`);

      // Fetch remaining pages (starting from page 2)
      for (let page = 2; page <= totalPages; page++) {
        try {
          const pageUrl = this.buildPageUrl(baseUrl, page);
          console.log(`Fetching Greenhouse page ${page}: ${pageUrl}`);

          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const pageResponse = await fetch(pageUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; JobScraper/1.0)",
            },
          });

          if (!pageResponse.ok) {
            console.warn(
              `Failed to fetch page ${page}: ${pageResponse.status}`,
            );
            continue;
          }

          const pageHtml = await pageResponse.text();
          const pageLinks = this.extractJobLinksFromPage(pageHtml);
          allLinks.push(...pageLinks);

          console.log(
            `Greenhouse page ${page}: Found ${pageLinks.length} jobs`,
          );

          // If we get fewer jobs than expected, we might have reached the end
          if (pageLinks.length === 0) {
            console.log(
              `No more jobs found on page ${page}, stopping pagination`,
            );
            break;
          }
        } catch (error) {
          console.error(`Error fetching Greenhouse page ${page}:`, error);
          // Continue with other pages even if one fails
        }
      }
    }

    const uniqueLinks = Array.from(new Set(allLinks));
    console.log(
      `Greenhouse adapter found ${uniqueLinks.length} total unique job links across all pages`,
    );

    return uniqueLinks;
  }

  private extractJobLinksFromPage(html: string): string[] {
    const links: string[] = [];

    // Look for Greenhouse job links using regex pattern
    // Greenhouse URLs typically follow: https://job-boards.greenhouse.io/company/jobs/jobId
    const greenhouseJobRegex =
      /href="(https:\/\/job-boards\.greenhouse\.io\/[^"]+\/jobs\/\d+)"/g;

    let match;
    while ((match = greenhouseJobRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    return links;
  }

  private buildPageUrl(baseUrl: string, page: number): string {
    const url = new URL(baseUrl);
    url.searchParams.set("page", page.toString());
    return url.toString();
  }

  protected extractJobCount(html: string): number | null {
    const match = html.match(/(\d+)\s+jobs?/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return null;
  }
}
