import { Resend } from "@convex-dev/resend";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

// Initialize Resend component
export const resend = new Resend(internal.resend.send, {
  testMode: false, // Production mode - sends real emails when API key configured
});

/**
 * Internal mutation for sending order notification emails
 * Will be extended with email templates in Plan 02
 */
export const sendOrderEmail = internalMutation({
  args: {
    to: internal.resend.send.args.to,
    subject: internal.resend.send.args.subject,
    html: internal.resend.send.args.html,
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
