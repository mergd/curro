import type { MutationCtx, QueryCtx } from "./_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";

import { mutation, query } from "./_generated/server";

const authContext = customCtx(async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("User not authenticated");
  }
  return { userId };
});

export const authenticatedQuery = customQuery(query, authContext);

export const authenticatedMutation = customMutation(mutation, authContext);
