import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upload document (quote or invoice)
 */
export const upload = mutation({
  args: {
    orderId: v.id("orders"),
    type: v.union(v.literal("quote"), v.literal("invoice")),
    fileName: v.string(),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify order exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Get current max version for this type
    const existingDocs = await ctx.db
      .query("documents")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();

    const maxVersion = existingDocs.reduce((max, doc) => Math.max(max, doc.version), 0);
    const version = maxVersion + 1;

    // Create document
    const documentId = await ctx.db.insert("documents", {
      orderId: args.orderId,
      type: args.type,
      version,
      fileName: args.fileName,
      storageId: args.storageId,
      createdAt: Date.now(),
    });

    return documentId;
  },
});

/**
 * Generate upload URL for admin to upload documents
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * List documents for an order, grouped by type
 */
export const list = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .collect();

    // Group by type and sort by version (latest first)
    const quotes = documents
      .filter((doc) => doc.type === "quote")
      .sort((a, b) => b.version - a.version);

    const invoices = documents
      .filter((doc) => doc.type === "invoice")
      .sort((a, b) => b.version - a.version);

    return {
      quotes,
      invoices,
    };
  },
});

/**
 * Get temporary download URL from Convex storage
 */
export const getDownloadUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
