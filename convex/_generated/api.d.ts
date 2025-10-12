/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as _utils from "../_utils.js";
import type * as adapters_ashby from "../adapters/ashby.js";
import type * as adapters_base from "../adapters/base.js";
import type * as adapters_generic from "../adapters/generic.js";
import type * as adapters_greenhouse from "../adapters/greenhouse.js";
import type * as adapters_jsdom from "../adapters/jsdom.js";
import type * as adapters_types from "../adapters/types.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as bookmarks from "../bookmarks.js";
import type * as companies from "../companies.js";
import type * as companyRequests from "../companyRequests.js";
import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as parsers_aiParser from "../parsers/aiParser.js";
import type * as resumes from "../resumes.js";
import type * as scraper from "../scraper.js";
import type * as scrapingMetrics from "../scrapingMetrics.js";
import type * as userProfiles from "../userProfiles.js";
import type * as utils_backoff from "../utils/backoff.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  _utils: typeof _utils;
  "adapters/ashby": typeof adapters_ashby;
  "adapters/base": typeof adapters_base;
  "adapters/generic": typeof adapters_generic;
  "adapters/greenhouse": typeof adapters_greenhouse;
  "adapters/jsdom": typeof adapters_jsdom;
  "adapters/types": typeof adapters_types;
  applications: typeof applications;
  auth: typeof auth;
  bookmarks: typeof bookmarks;
  companies: typeof companies;
  companyRequests: typeof companyRequests;
  constants: typeof constants;
  crons: typeof crons;
  http: typeof http;
  jobs: typeof jobs;
  "parsers/aiParser": typeof parsers_aiParser;
  resumes: typeof resumes;
  scraper: typeof scraper;
  scrapingMetrics: typeof scrapingMetrics;
  userProfiles: typeof userProfiles;
  "utils/backoff": typeof utils_backoff;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
