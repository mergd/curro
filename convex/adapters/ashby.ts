import { BaseATSAdapter } from "./base";

/**
 * Ashby Adapter - Requires JSDOM processing for job board pages
 *
 * Ashby job boards are heavily JavaScript-dependent, requiring DOM manipulation
 * to render job listings. This adapter should be used with HTML that has been
 * processed through JSDOM (see adapters/jsdom.ts) to ensure all job postings
 * are properly loaded and visible in the HTML.
 */
export class AshbyAdapter extends BaseATSAdapter {
  name = "Ashby";

  // Method for extracting job links from rendered HTML (after JSDOM processing)
  extractJobLinks(html: string, baseUrl: string): string[] {
    try {
      // Ashby embeds job data in JSON format within the HTML
      // Look for the JSON data that contains job postings

      let postings: any[] = [];

      const jobPostingsIndex = html.indexOf('"jobPostings":');
      if (jobPostingsIndex !== -1) {
        // Find the start of the array
        const arrayStart = html.indexOf("[", jobPostingsIndex);
        if (arrayStart !== -1) {
          // Find the matching closing bracket by counting brackets
          let bracketCount = 0;
          let arrayEnd = arrayStart;

          for (let i = arrayStart; i < html.length; i++) {
            if (html[i] === "[") bracketCount++;
            if (html[i] === "]") bracketCount--;
            if (bracketCount === 0) {
              arrayEnd = i;
              break;
            }
          }

          if (arrayEnd > arrayStart) {
            const postingsJson = html.substring(arrayStart, arrayEnd + 1);
            try {
              postings = JSON.parse(postingsJson);
            } catch (parseError) {
              console.log("Failed to parse jobPostings JSON:", parseError);
            }
          }
        }
      }

      if (postings.length === 0) {
        console.log("No job postings found in Ashby page");
        console.log("HTML sample:", html.substring(0, 500));
        return [];
      }

      // Extract job URLs from the postings data
      const jobLinks: string[] = [];

      for (const posting of postings) {
        if (posting.id && posting.isListed !== false) {
          // Construct the job URL using the posting ID
          // Ensure proper URL joining without double slashes
          const cleanBaseUrl = baseUrl.endsWith("/")
            ? baseUrl.slice(0, -1)
            : baseUrl;
          const jobUrl = `${cleanBaseUrl}/${posting.id}`;
          jobLinks.push(jobUrl);
        }
      }

      console.log(`Found ${jobLinks.length} Ashby job links`);
      return jobLinks;
    } catch (error) {
      console.error("Error parsing Ashby job data:", error);
      console.log("HTML sample for debugging:", html.substring(0, 1000));
      return [];
    }
  }
}
