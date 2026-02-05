import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upload production photo
 */
export const upload = mutation({
  args: {
    orderId: v.id("orders"),
    storageId: v.string(),
    milestone: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify order exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Validate milestone
    const validMilestones = ["production", "qc", "packaging", "delivery"];
    if (!validMilestones.includes(args.milestone)) {
      throw new Error(`Invalid milestone: ${args.milestone}`);
    }

    // Create photo record
    const photoId = await ctx.db.insert("productionPhotos", {
      orderId: args.orderId,
      storageId: args.storageId,
      milestone: args.milestone,
      caption: args.caption,
      uploadedAt: Date.now(),
    });

    return photoId;
  },
});

/**
 * Generate upload URL for admin to upload photos
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * List photos for an order, grouped by milestone
 */
export const listByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const photos = await ctx.db
      .query("productionPhotos")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .collect();

    // Sort by uploadedAt (most recent first)
    photos.sort((a, b) => b.uploadedAt - a.uploadedAt);

    // Group by milestone
    const grouped: Record<string, typeof photos> = {
      production: [],
      qc: [],
      packaging: [],
      delivery: [],
    };

    for (const photo of photos) {
      if (grouped[photo.milestone]) {
        grouped[photo.milestone].push(photo);
      }
    }

    return grouped;
  },
});

/**
 * Get photo URL from Convex storage
 */
export const getPhotoUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
