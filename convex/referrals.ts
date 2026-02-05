import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Mask email for privacy: j***n@example.com
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}***${last}@${domain}`;
}

/**
 * Create referral (authenticated)
 */
export const create = mutation({
  args: {
    referrerId: v.id("users"),
    referredEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify referrer exists
    const referrer = await ctx.db.get(args.referrerId);
    if (!referrer) {
      throw new Error("Referrer not found");
    }

    // Check if referral already exists
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referredEmail", (q) => q.eq("referredEmail", args.referredEmail))
      .first();

    if (existing) {
      throw new Error("This email has already been referred");
    }

    // Create referral
    const referralId = await ctx.db.insert("referrals", {
      referrerId: args.referrerId,
      referredEmail: args.referredEmail,
      status: "pending",
      createdAt: Date.now(),
    });

    return referralId;
  },
});

/**
 * Get all referrals for current user (authenticated)
 */
export const getMyReferrals = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerId", (q) => q.eq("referrerId", userId))
      .order("desc")
      .collect();

    // Mask emails for privacy and return essential data
    return referrals.map((referral) => ({
      _id: referral._id,
      referredEmail: maskEmail(referral.referredEmail),
      status: referral.status,
      rewardAmount: referral.rewardAmount,
      createdAt: referral.createdAt,
    }));
  },
});

/**
 * Generate unique referral link for user (authenticated)
 */
export const getReferralLink = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate referral link
    // Format: https://northsouthcarpentry.com/ref/{userId}
    return `https://northsouthcarpentry.com/ref/${userId}`;
  },
});

/**
 * Update referral status (for admin)
 * Status flow: pending -> signed_up -> ordered -> rewarded
 */
export const updateStatus = mutation({
  args: {
    id: v.id("referrals"),
    status: v.string(),
    rewardAmount: v.optional(v.number()),
    orderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.id);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // Validate status
    const validStatuses = ["pending", "signed_up", "ordered", "rewarded"];
    if (!validStatuses.includes(args.status)) {
      throw new Error(`Invalid status: ${args.status}`);
    }

    // Update referral
    const updates: any = { status: args.status };
    if (args.rewardAmount !== undefined) {
      updates.rewardAmount = args.rewardAmount;
    }
    if (args.orderId !== undefined) {
      updates.orderId = args.orderId;
    }

    await ctx.db.patch(args.id, updates);

    return await ctx.db.get(args.id);
  },
});
