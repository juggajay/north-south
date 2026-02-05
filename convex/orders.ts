import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { requireAdmin, requireOwnershipOrAdmin } from "./lib/auth";
import { batchGet } from "./lib/batch";
import { MS_PER_DAY, ORDER_STATUSES, OrderStatus, STATUS_TO_TIMELINE, STATUS_TO_NOTIFICATION, NotificationType, OrderTimeline } from "./lib/types";

/**
 * Generate secure order number with random component
 * Format: NS-YYYYMMDD-XXXX (4 random alphanumeric chars)
 */
function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Generate 4 random alphanumeric characters
  // Exclude confusing chars (0/O, 1/I/L)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `NS-${dateStr}-${randomPart}`;
}

/**
 * Create order from submission
 */
export const create = mutation({
  args: {
    submissionId: v.id("submissions"),
    depositAmount: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify submission exists
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with initial "confirmed" status
    const orderId = await ctx.db.insert("orders", {
      submissionId: args.submissionId,
      orderNumber,
      status: "confirmed",
      depositPaid: false,
      depositAmount: args.depositAmount,
      totalAmount: args.totalAmount,
      balanceDue: args.totalAmount && args.depositAmount
        ? args.totalAmount - args.depositAmount
        : args.totalAmount,
      timeline: {
        confirmed: Date.now(),
      },
      createdAt: Date.now(),
    });

    return orderId;
  },
});

/**
 * Get order by ID with submission data
 */
export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) return null;

    // Get submission data
    const submission = await ctx.db.get(order.submissionId);

    // Get design data if submission exists
    let design = null;
    if (submission) {
      design = await ctx.db.get(submission.designId);
    }

    return {
      ...order,
      submission,
      design,
    };
  },
});

/**
 * Get order by ID with ownership check
 * Returns order only if user owns it or is admin
 */
export const getSecure = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) return null;

    const submission = await ctx.db.get(order.submissionId);

    // Check ownership
    await requireOwnershipOrAdmin(ctx, submission?.email);

    let design = null;
    if (submission) {
      design = await ctx.db.get(submission.designId);
    }

    return {
      ...order,
      submission,
      design,
    };
  },
});

/**
 * Get order for a submission
 */
export const getBySubmission = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
      .first();

    return order;
  },
});

/**
 * List all orders for a user (via submission's userId)
 */
export const listByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Get all submissions for user
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get orders for those submissions
    const orders = await Promise.all(
      submissions.map(async (submission) => {
        const order = await ctx.db
          .query("orders")
          .withIndex("by_submissionId", (q) => q.eq("submissionId", submission._id))
          .first();

        if (!order) return null;

        // Get design data
        const design = await ctx.db.get(submission.designId);

        return {
          ...order,
          submission,
          design,
        };
      })
    );

    // Filter out nulls and sort by creation date (most recent first)
    return orders
      .filter((order) => order !== null)
      .sort((a, b) => b!.createdAt - a!.createdAt);
  },
});

/**
 * Update order status and timeline
 */
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const order = await ctx.db.get(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Validate status using imported constant
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const typedStatus = status as OrderStatus;

    // Update timeline using imported mapping
    const timeline: OrderTimeline = (order.timeline as OrderTimeline) || {};
    const timelineField = STATUS_TO_TIMELINE[typedStatus];
    if (timelineField) {
      timeline[timelineField] = Date.now();
    }

    // Update order
    await ctx.db.patch(id, {
      status: typedStatus,
      timeline,
    });

    // Get notification type using imported mapping
    const notificationType = STATUS_TO_NOTIFICATION[typedStatus];

    // Schedule email notification if applicable
    if (notificationType) {
      // Get submission to find customer email
      const submission = await ctx.db.get(order.submissionId);
      if (submission && submission.email) {
        // Schedule email (non-blocking, runs async)
        // Type assertion needed to avoid TS2589 with Convex scheduler inference
        await ctx.scheduler.runAfter(
          0,
          internal.notifications.sendEmail.sendNotificationEmail,
          {
            orderId: id,
            type: notificationType as NotificationType,
            to: submission.email,
          }
        );

        // Special case: schedule post-install email 7 days after delivered
        if (typedStatus === "delivered") {
          const sevenDaysMs = 7 * MS_PER_DAY;
          await ctx.scheduler.runAfter(
            sevenDaysMs,
            internal.notifications.sendEmail.sendNotificationEmail,
            {
              orderId: id,
              type: "post_install" as NotificationType,
              to: submission.email,
            }
          );
        }
      }
    }

    return await ctx.db.get(id);
  },
});

/**
 * List all orders (admin use only)
 * SECURED: Requires admin authentication
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    // SECURITY: Require admin access
    await requireAdmin(ctx);

    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .take(100);

    // Parallel load all submissions
    const submissionIds = orders.map((o) => o.submissionId);
    const submissionsMap = await batchGet(ctx, submissionIds);

    // Collect design IDs from loaded submissions
    const designIds: Id<"designs">[] = [];
    submissionsMap.forEach((sub) => {
      if (sub.designId) designIds.push(sub.designId);
    });

    // Parallel load all designs
    const designsMap = await batchGet(ctx, designIds);

    // Enrich orders
    return orders.map((order) => {
      const submission = submissionsMap.get(order.submissionId.toString());
      const design = submission
        ? designsMap.get(submission.designId.toString())
        : null;
      return { ...order, submission, design };
    });
  },
});

/**
 * Get timeline data for an order
 */
export const getTimeline = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) return null;

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      timeline: order.timeline,
      createdAt: order.createdAt,
    };
  },
});
