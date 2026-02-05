"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { resend } from "../notifications";
import { renderOrderConfirmed } from "./templates/OrderConfirmed";
import { renderProductionStarted } from "./templates/ProductionStarted";
import { renderQCComplete } from "./templates/QCComplete";
import { renderReadyToShip } from "./templates/ReadyToShip";
import { renderDelivered } from "./templates/Delivered";
import { renderPostInstall } from "./templates/PostInstall";

/**
 * Send notification email
 * Central dispatch for all order status emails
 */
export const sendNotificationEmail = internalAction({
  args: {
    orderId: v.id("orders"),
    type: v.union(
      v.literal("order_confirmed"),
      v.literal("production_started"),
      v.literal("qc_complete"),
      v.literal("ready_to_ship"),
      v.literal("delivered"),
      v.literal("post_install")
    ),
    to: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Fetch order data
      const order = await ctx.runQuery(internal.orders.get, { id: args.orderId });
      if (!order) {
        throw new Error(`Order ${args.orderId} not found`);
      }

      // Fetch submission for customer name
      const submission = order.submission;
      if (!submission) {
        throw new Error(`Submission for order ${args.orderId} not found`);
      }

      // Build portal URL
      const siteUrl = process.env.SITE_URL || "https://northsouthcarpentry.com";
      const portalUrl = `${siteUrl}/portal/${args.orderId}`;
      const referralUrl = submission.userId
        ? `${siteUrl}/referral/${submission.userId}`
        : portalUrl;

      // Select template and render
      const customerName = submission.name.split(" ")[0]; // First name only
      const orderNumber = order.orderNumber;

      let rendered: { html: string; text: string };
      let subject: string;

      switch (args.type) {
        case "order_confirmed":
          rendered = await renderOrderConfirmed({ customerName, orderNumber, portalUrl });
          subject = `Order Confirmed - ${orderNumber}`;
          break;
        case "production_started":
          rendered = await renderProductionStarted({ customerName, orderNumber, portalUrl });
          subject = `Production Started - ${orderNumber}`;
          break;
        case "qc_complete":
          rendered = await renderQCComplete({ customerName, orderNumber, portalUrl });
          subject = `Quality Check Complete - ${orderNumber}`;
          break;
        case "ready_to_ship":
          rendered = await renderReadyToShip({ customerName, orderNumber, portalUrl });
          subject = `Ready to Ship - ${orderNumber}`;
          break;
        case "delivered":
          rendered = await renderDelivered({ customerName, orderNumber, portalUrl });
          subject = `Delivered - ${orderNumber}`;
          break;
        case "post_install":
          rendered = await renderPostInstall({
            customerName,
            orderNumber,
            portalUrl,
            referralUrl
          });
          subject = `How's it looking? - ${orderNumber}`;
          break;
      }

      // Send email via Resend
      await resend.send(ctx, {
        from: "North South Carpentry <orders@northsouthcarpentry.com>",
        to: args.to,
        subject,
        html: rendered.html,
        text: rendered.text,
      });

      // Log successful send
      await ctx.runMutation(internal.notifications.logNotification, {
        orderId: args.orderId,
        type: args.type,
        channel: "email",
        recipient: args.to,
        sentAt: Date.now(),
        status: "sent",
      });

      console.log(`Email sent: ${args.type} to ${args.to} for order ${orderNumber}`);
    } catch (error) {
      // Log error but don't throw - allow order status update to succeed
      console.error(`Failed to send email for order ${args.orderId}:`, error);

      await ctx.runMutation(internal.notifications.logNotification, {
        orderId: args.orderId,
        type: args.type,
        channel: "email",
        recipient: args.to,
        sentAt: Date.now(),
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  },
});
