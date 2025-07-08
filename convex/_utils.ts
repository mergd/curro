import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";

import { api } from "./_generated/api";
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

export async function getUserId(ctx: QueryCtx | MutationCtx) {
  return await getAuthUserId(ctx);
}

// Admin protection handler
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("User not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user?.isAdmin) {
    throw new ConvexError("Unauthorized: Admin access required");
  }

  return user;
}

// Admin context for mutations and queries
const adminContext = customCtx(async (ctx: QueryCtx | MutationCtx) => {
  const user = await requireAdmin(ctx);
  return { adminUser: user };
});

export const adminQuery = customQuery(query, adminContext);
export const adminMutation = customMutation(mutation, adminContext);

// Admin protection handler for actions
export async function requireAdminAction(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("User not authenticated");
  }

  // We need to get the user record to check isAdmin
  // Since we're in an action, we need to use a query to get the user
  const isAdmin = await ctx.runQuery(api.auth.isAdmin);
  if (!isAdmin) {
    throw new ConvexError("Unauthorized: Admin access required");
  }

  return { userId };
}
