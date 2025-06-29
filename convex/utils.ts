import { SOURCE_TYPES } from "./constants";

/**
 * Helper to infer the applicant tracking system provider from a URL.
 */
export function inferSourceType(url: string): (typeof SOURCE_TYPES)[number] {
  const lower = url.toLowerCase();
  if (lower.includes("greenhouse.io")) {
    return "greenhouse";
  }
  if (lower.includes("ashbyhq.com") || lower.includes("ashbyhq")) {
    return "ashby";
  }
  return "other";
}
