import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all active door profiles
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("doorProfiles")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

/**
 * Get a single door profile by code
 */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("doorProfiles")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
  },
});
