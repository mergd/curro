import { BaseATSAdapter } from "./base";

export class GreenhouseAdapter extends BaseATSAdapter {
  name = "Greenhouse";

  extractJobLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];

    // Look for Greenhouse job links using regex pattern
    // Greenhouse URLs typically follow: https://job-boards.greenhouse.io/company/jobs/jobId
    const greenhouseJobRegex =
      /href="(https:\/\/job-boards\.greenhouse\.io\/[^"]+\/jobs\/\d+)"/g;

    let match;
    while ((match = greenhouseJobRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    console.log(`Greenhouse adapter found ${links.length} job links`);
    console.log(`First 5 links:`, links.slice(0, 5));

    return Array.from(new Set(links)); // Remove duplicates
  }
}
