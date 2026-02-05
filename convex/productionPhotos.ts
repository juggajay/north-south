import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireOwnershipOrAdmin, requireAdmin } from "./lib/auth";
import { PHOTO_MILESTONES, PhotoMilestone, VALID_IMAGE_TYPES, IMAGE_LIMITS } from "./lib/types";

/**
 * Upload production photo
 * SECURED: Only admins can upload production photos
 */
export const upload = mutation({
  args: {
    orderId: v.id("orders"),
    storageId: v.string(),
    milestone: v.string(),
    caption: v.optional(v.string()),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only admins can upload production photos
    await requireAdmin(ctx);

    // Validate milestone
    if (!PHOTO_MILESTONES.includes(args.milestone as PhotoMilestone)) {
      throw new Error(`Invalid milestone: ${args.milestone}`);
    }

    // Validate content type if provided
    if (args.contentType && !VALID_IMAGE_TYPES.includes(args.contentType as typeof VALID_IMAGE_TYPES[number])) {
      throw new Error(`Invalid file type: ${args.contentType}. Only images allowed.`);
    }

    // Validate file size if provided
    if (args.fileSize && args.fileSize > IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File too large: ${args.fileSize} bytes. Maximum is 10MB.`);
    }

    // Verify order exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
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
 * SECURED: Only admins can generate upload URLs
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * List photos for an order, grouped by milestone
 * SECURED: Requires ownership or admin access
 */
export const listByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    // Get order and submission to check ownership
    const order = await ctx.db.get(orderId);
    if (!order) {
      return {
        production: [],
        qc: [],
        packaging: [],
        delivery: [],
      };
    }

    const submission = await ctx.db.get(order.submissionId);
    await requireOwnershipOrAdmin(ctx, submission?.email);

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
 * SECURED: Requires authentication
 */
export const getPhotoUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    await requireAuth(ctx);
    return await ctx.storage.getUrl(storageId);
  },
});
