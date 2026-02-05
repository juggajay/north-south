import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Log notification to database
 * Separate file because mutations cannot be in Node.js files
 */
export const logNotification = internalMutation({
  args: {
    orderId: v.id("orders"),
    type: v.string(),
    channel: v.string(),
    recipient: v.string(),
    sentAt: v.number(),
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      orderId: args.orderId,
      type: args.type,
      channel: args.channel,
      recipient: args.recipient,
      sentAt: args.sentAt,
      status: args.status,
      errorMessage: args.errorMessage,
    });
  },
});
