import { v } from "convex/values";

import { authenticatedMutation, authenticatedQuery } from "./_utils";

export const getUserNotes = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .order("desc")
      .collect();
  },
});

export const createNote = authenticatedMutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      userId: ctx.userId,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return noteId;
  },
});

export const updateNote = authenticatedMutation({
  args: {
    id: v.id("notes"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId !== ctx.userId) {
      throw new Error("Not authorized to update this note");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const deleteNote = authenticatedMutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId !== ctx.userId) {
      throw new Error("Not authorized to delete this note");
    }

    await ctx.db.delete(args.id);
  },
});
