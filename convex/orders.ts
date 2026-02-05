import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Generate order number in format: NS-YYYYMMDD-XXX
 */
async function generateOrderNumber(ctx: any): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Get count of orders created today
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 86400000; // +24 hours

  const todayOrders = await ctx.db
    .query("orders")
    .filter((q: any) =>
      q.and(
        q.gte(q.field("createdAt"), startOfDay),
        q.lt(q.field("createdAt"), endOfDay)
      )
    )
    .collect();

  const sequence = (todayOrders.length + 1).toString().padStart(3, "0");
  return `NS-${dateStr}-${sequence}`;
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
    const orderNumber = await generateOrderNumber(ctx);

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

    // Validate status
    const validStatuses = [
      "confirmed",
      "production",
      "qc",
      "ready_to_ship",
      "shipped",
      "delivered",
      "complete",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    // Map status to timeline field
    const timelineMap: Record<string, string> = {
      confirmed: "confirmed",
      production: "productionStart",
      qc: "qcComplete",
      ready_to_ship: "readyToShip",
      shipped: "shipped",
      delivered: "delivered",
    };

    // Update timeline
    const timeline = order.timeline || {};
    const timelineField = timelineMap[status];
    if (timelineField) {
      (timeline as any)[timelineField] = Date.now();
    }

    // Update order
    await ctx.db.patch(id, {
      status,
      timeline,
    });

    // Map status to notification type
    const notificationMap: Record<string, string> = {
      confirmed: "order_confirmed",
      production: "production_started",
      qc: "qc_complete",
      ready_to_ship: "ready_to_ship",
      delivered: "delivered",
    };

    const notificationType = notificationMap[status];

    // Schedule email notification if applicable
    if (notificationType) {
      // Get submission to find customer email
      const submission = await ctx.db.get(order.submissionId);
      if (submission && submission.email) {
        // Schedule email (non-blocking, runs async)
        await ctx.scheduler.runAfter(
          0,
          internal.notifications.sendEmail.sendNotificationEmail,
          {
            orderId: id,
            type: notificationType as any,
            to: submission.email,
          }
        );

        // Special case: schedule post-install email 7 days after delivered
        if (status === "delivered") {
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          await ctx.scheduler.runAfter(
            sevenDaysMs,
            internal.notifications.sendEmail.sendNotificationEmail,
            {
              orderId: id,
              type: "post_install",
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
 * List all orders (admin use)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .take(100);

    // Enrich with submission and design data
    const enriched = await Promise.all(
      orders.map(async (order) => {
        const submission = await ctx.db.get(order.submissionId);
        let design = null;
        if (submission) {
          design = await ctx.db.get(submission.designId);
        }
        return {
          ...order,
          submission,
          design,
        };
      })
    );

    return enriched;
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
