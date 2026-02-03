import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all active materials
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("materials")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

/**
 * Get materials by category (woodmatt, satin, gloss)
 */
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("materials")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

/**
 * Get materials by color family (oak, white, grey, black)
 */
export const listByColorFamily = query({
  args: { colorFamily: v.string() },
  handler: async (ctx, { colorFamily }) => {
    return await ctx.db
      .query("materials")
      .withIndex("by_colorFamily", (q) => q.eq("colorFamily", colorFamily))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

/**
 * Get a single material by code
 */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("materials")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
  },
});
