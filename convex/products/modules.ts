import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all active modules sorted by sortOrder
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("modules")
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

/**
 * Get a single module by code
 */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("modules")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
  },
});

/**
 * Get modules by category (base, overhead, tall, corner)
 */
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("modules")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});

/**
 * Get modules by product code
 */
export const listByProduct = query({
  args: { productCode: v.string() },
  handler: async (ctx, { productCode }) => {
    return await ctx.db
      .query("modules")
      .withIndex("by_productCode", (q) => q.eq("productCode", productCode))
      .filter((q) => q.eq(q.field("active"), true))
      .order("asc")
      .collect();
  },
});
