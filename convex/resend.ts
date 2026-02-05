"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend as ResendSDK } from "resend";

/**
 * Internal action to send emails via Resend API
 * This is called by the Resend component from @convex-dev/resend
 */
export const send = internalAction({
  args: {
    from: v.string(),
    to: v.union(v.string(), v.array(v.string())),
    subject: v.string(),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
    react: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured - email not sent");
      return { id: "test-email-id" };
    }

    const resend = new ResendSDK(apiKey);

    const emailData: any = {
      from: args.from,
      to: args.to,
      subject: args.subject,
    };

    if (args.html) {
      emailData.html = args.html;
    }
    if (args.text) {
      emailData.text = args.text;
    }

    const result = await resend.emails.send(emailData);

    if (result.error) {
      throw new Error(`Resend API error: ${result.error.message}`);
    }

    return result.data;
  },
});
