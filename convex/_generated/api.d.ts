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
import type * as auth from "../auth.js";
import type * as companies from "../companies.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as parsers_aiParser from "../parsers/aiParser.js";
import type * as parsers_ashby from "../parsers/ashby.js";
import type * as parsers_greenhouse from "../parsers/greenhouse.js";
import type * as resumes from "../resumes.js";
import type * as scraper from "../scraper.js";
import type * as userProfiles from "../userProfiles.js";

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
  auth: typeof auth;
  companies: typeof companies;
  http: typeof http;
  jobs: typeof jobs;
  "parsers/aiParser": typeof parsers_aiParser;
  "parsers/ashby": typeof parsers_ashby;
  "parsers/greenhouse": typeof parsers_greenhouse;
  resumes: typeof resumes;
  scraper: typeof scraper;
  userProfiles: typeof userProfiles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
