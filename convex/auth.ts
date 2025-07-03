import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query } from "./_generated/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password,
    Resend({
      from: "noreply@mail.curro.work",
    }),
  ],
});

export const currentUser = query({
  args: {},

  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const checkUserExists = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Check if a user with this email exists in the authAccounts table
    const existingAccount = await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "resend"),
          q.eq(q.field("providerAccountId"), email),
        ),
      )
      .first();

    return existingAccount !== null;
  },
});
