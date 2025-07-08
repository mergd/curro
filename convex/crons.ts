import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "scrape all companies",
  "0 0 * * *", // Every 24 hours at midnight
  internal.scraper.scrapeAllCompanies,
  {},
);

crons.cron(
  "cleanup old errors",
  "0 */12 * * *", // Every 12 hours
  internal.jobs.cleanupOldErrors,
  {},
);

export default crons;
