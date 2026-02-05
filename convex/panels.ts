import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * PUBLIC lookup by QR code (no auth required)
 * Returns basic panel info only for privacy
 */
export const lookupByQrCode = query({
  args: { qrCode: v.string() },
  handler: async (ctx, { qrCode }) => {
    const panelQr = await ctx.db
      .query("panelQrCodes")
      .withIndex("by_qrCode", (q) => q.eq("qrCode", qrCode))
      .first();

    if (!panelQr) {
      return null;
    }

    // Update scannedAt timestamp
    await ctx.db.patch(panelQr._id, {
      scannedAt: Date.now(),
    });

    // Return ONLY basic info per CONTEXT.md
    // moduleInfo should contain: panelName, dimensions, material, finish
    const { moduleInfo } = panelQr;

    return {
      panelName: moduleInfo?.panelName || "Panel",
      dimensions: moduleInfo?.dimensions || { width: 0, height: 0, depth: 0 },
      material: moduleInfo?.material || "Unknown",
      finish: moduleInfo?.finish || "Unknown",
      assemblyNotes: panelQr.assemblyNotes,
      videoUrl: panelQr.videoUrl,
    };
  },
});

/**
 * Create panel QR code (for admin in Phase 08)
 */
export const createPanelQr = mutation({
  args: {
    orderId: v.id("orders"),
    panelId: v.string(),
    moduleInfo: v.any(),
    assemblyNotes: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify order exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Generate simple QR code: {orderId}-{panelId}
    const qrCode = `${args.orderId}-${args.panelId}`;

    // Create panel QR record
    const panelQrId = await ctx.db.insert("panelQrCodes", {
      orderId: args.orderId,
      panelId: args.panelId,
      qrCode,
      moduleInfo: args.moduleInfo,
      assemblyNotes: args.assemblyNotes,
      videoUrl: args.videoUrl,
    });

    return { panelQrId, qrCode };
  },
});
