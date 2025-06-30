"use node";

import { v } from "convex/values";
import { JSDOM } from "jsdom";

import { internalAction } from "../_generated/server";

// General-purpose JSDOM scraper that can be used by any adapter
export const scrapeWithJSDOM = internalAction({
  args: {
    url: v.string(),
    waitTime: v.optional(v.number()), // How long to wait for JS execution (default: 2000ms)
  },
  returns: v.object({
    success: v.boolean(),
    html: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { url, waitTime = 2000 }) => {
    try {
      console.log(`Starting JSDOM-based scraping for: ${url}`);

      // Fetch the HTML content
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log(`Fetched HTML, length: ${html.length}`);

      // Create JSDOM instance with script execution enabled
      const dom = new JSDOM(html, {
        url,
        referrer: url,
        contentType: "text/html",
        includeNodeLocations: false,
        storageQuota: 10000000,
        runScripts: "dangerously", // Enable JavaScript execution
        resources: "usable", // Allow loading external resources
        pretendToBeVisual: true, // Pretend to be a visual browser
      });

      // Wait for any async scripts to run
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      // Get the final HTML after JavaScript execution
      const finalHtml = dom.serialize();

      console.log(
        `JSDOM processing completed, final HTML length: ${finalHtml.length}`,
      );

      // Clean up JSDOM instance
      dom.window.close();

      return {
        success: true,
        html: finalHtml,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("JSDOM scraping failed:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});
