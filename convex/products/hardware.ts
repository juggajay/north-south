import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all active hardware items
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("hardware")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

/**
 * Get hardware by category (hinge, drawer, lift, organizer)
 */
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("hardware")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

/**
 * Get a single hardware item by code
 */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("hardware")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
  },
});

/**
 * Get hardware with pricing including variance
 */
export const listWithPricing = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("hardware")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    return items.map((item) => {
      const variance = item.priceVariance || 0;
      const varianceAmount = (item.pricePerUnit * variance) / 100;
      return {
        ...item,
        priceMin: item.pricePerUnit - varianceAmount,
        priceMax: item.pricePerUnit + varianceAmount,
      };
    });
  },
});
