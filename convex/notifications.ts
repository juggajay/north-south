import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { NOTIFICATION_TYPES, NotificationType } from "./lib/types";

// Initialize Resend component
// @ts-ignore - Resend component not yet deployed to Convex
export const resend: any = new Resend((internal as any).resend.send, {
  testMode: false, // Production mode - sends real emails when API key configured
});

// logNotification moved to notifications/logNotification.ts
// (mutations cannot be in Node.js files)

/**
 * Internal mutation for sending order notification emails
 * Will be extended with email templates in Plan 02
 */
export const sendOrderEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    // Template rendering logic will be added in Plan 02
    // For now, just pass through to Resend
    await resend.send(ctx, {
      to: args.to,
      subject: args.subject,
      html: args.html,
      from: "North South Carpentry <orders@northsouthcarpentry.com>",
    });
  },
});

/**
 * Admin action to manually trigger notification
 * Allows re-sending emails or sending custom notifications
 * SECURED: Requires admin authentication
 */
export const adminTriggerNotification = mutation({
  args: {
    orderId: v.id("orders"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin access
    await requireAdmin(ctx);

    // Get order to find customer email
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const submission = await ctx.db.get(order.submissionId);
    if (!submission || !submission.email) {
      throw new Error("Customer email not found");
    }

    // Validate notification type using shared constant
    if (!NOTIFICATION_TYPES.includes(args.type as NotificationType)) {
      throw new Error(`Invalid notification type: ${args.type}`);
    }

    // Schedule email
    await ctx.scheduler.runAfter(
      0,
      internal.notifications.sendEmail.sendNotificationEmail,
      {
        orderId: args.orderId,
        type: args.type as NotificationType,
        to: submission.email,
      }
    );

    return { success: true, sentTo: submission.email };
  },
});
