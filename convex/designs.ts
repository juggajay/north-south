import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new design
 */
export const create = mutation({
  args: {
    userId: v.optional(v.id("users")),
    productType: v.string(),
    config: v.any(),
  },
  handler: async (ctx, { userId, productType, config }) => {
    const now = Date.now();
    const designId = await ctx.db.insert("designs", {
      userId,
      productType,
      config,
      status: "draft",
      renders: [],
      createdAt: now,
      updatedAt: now,
    });

    return designId;
  },
});

/**
 * Update an existing design's configuration
 */
export const update = mutation({
  args: {
    id: v.id("designs"),
    config: v.any(),
  },
  handler: async (ctx, { id, config }) => {
    const design = await ctx.db.get(id);
    if (!design) {
      throw new Error("Design not found");
    }

    await ctx.db.patch(id, {
      config,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Get a single design by ID
 */
export const get = query({
  args: { id: v.id("designs") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * List all designs for a user
 */
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("designs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * List designs by status
 */
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("designs")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

/**
 * Update design status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("designs"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const design = await ctx.db.get(id);
    if (!design) {
      throw new Error("Design not found");
    }

    // Validate status transition
    const validStatuses = ["draft", "submitted", "quoted", "ordered"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await ctx.db.patch(id, {
      status,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Add a render image to a design
 */
export const addRender = mutation({
  args: {
    id: v.id("designs"),
    storageId: v.string(),
  },
  handler: async (ctx, { id, storageId }) => {
    const design = await ctx.db.get(id);
    if (!design) {
      throw new Error("Design not found");
    }

    await ctx.db.patch(id, {
      renders: [...design.renders, storageId],
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Delete a design (only if in draft status)
 */
export const remove = mutation({
  args: { id: v.id("designs") },
  handler: async (ctx, { id }) => {
    const design = await ctx.db.get(id);
    if (!design) {
      throw new Error("Design not found");
    }

    if (design.status !== "draft") {
      throw new Error("Can only delete draft designs");
    }

    await ctx.db.delete(id);
    return { success: true };
  },
});

/**
 * Get recent designs (for home page)
 */
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    return await ctx.db
      .query("designs")
      .order("desc")
      .take(limit);
  },
});

/**
 * Duplicate a design (for "Save a Copy" from share page)
 */
export const duplicate = mutation({
  args: {
    sourceId: v.id("designs"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { sourceId, userId }) => {
    const sourceDesign = await ctx.db.get(sourceId);
    if (!sourceDesign) {
      throw new Error("Design not found");
    }

    const now = Date.now();
    const newDesignId = await ctx.db.insert("designs", {
      userId,
      productType: sourceDesign.productType,
      config: sourceDesign.config,
      status: "draft",
      renders: [], // Don't copy renders
      createdAt: now,
      updatedAt: now,
    });

    return newDesignId;
  },
});
