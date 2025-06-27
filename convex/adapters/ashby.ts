import { BaseATSAdapter } from "./base";

export class AshbyAdapter extends BaseATSAdapter {
  name = "Ashby";

  extractJobLinks(html: string, baseUrl: string): string[] {
    try {
      // Ashby embeds job data in JSON format within the HTML
      // Look for the JSON data that contains job postings

      let postings: any[] = [];

      // Method 1: Try to extract jobPostings array more carefully
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

      // Method 2: If that fails, look for individual job UUIDs in the HTML
      if (postings.length === 0) {
        console.log("Trying fallback method to find job IDs");
        const uuidRegex =
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
        const uuidMatches = html.match(uuidRegex) || [];

        // Filter for what looks like job IDs (appear in job-like contexts)
        const potentialJobIds = [...new Set(uuidMatches)].filter((uuid) => {
          // Look for UUIDs that appear in contexts suggesting they're job IDs
          const contextRegex = new RegExp(
            `"id":\\s*"${uuid}"[\\s\\S]*?"title":`,
          );
          return contextRegex.test(html);
        });

        console.log(
          `Found ${potentialJobIds.length} potential job IDs via fallback method`,
        );

        // Create mock postings for the job IDs we found
        postings = potentialJobIds.map((id) => ({ id, isListed: true }));
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
          // Format: https://jobs.ashbyhq.com/{company}/d37f8d9c-8efc-40de-b068-37bb03b37e91
          const jobUrl = `${baseUrl}/${posting.id}`;
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
