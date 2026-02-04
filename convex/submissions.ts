import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new submission (submit design for quote)
 */
export const create = mutation({
  args: {
    designId: v.id("designs"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    siteMeasure: v.boolean(),
    installQuote: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify design exists
    const design = await ctx.db.get(args.designId);
    if (!design) {
      throw new Error("Design not found");
    }

    // Create submission
    const submissionId = await ctx.db.insert("submissions", {
      designId: args.designId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      siteMeasure: args.siteMeasure,
      installQuote: args.installQuote,
      notes: args.notes,
      status: "pending",
      createdAt: Date.now(),
    });

    // Update design status to submitted
    await ctx.db.patch(args.designId, {
      status: "submitted",
      updatedAt: Date.now(),
    });

    return submissionId;
  },
});

/**
 * Get submission by ID
 */
export const get = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    const submission = await ctx.db.get(id);
    if (!submission) return null;

    // Also get the associated design
    const design = await ctx.db.get(submission.designId);

    return {
      ...submission,
      design,
    };
  },
});

/**
 * Get submissions by design ID
 */
export const getByDesign = query({
  args: { designId: v.id("designs") },
  handler: async (ctx, { designId }) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_designId", (q) => q.eq("designId", designId))
      .order("desc")
      .collect();
  },
});

/**
 * List all submissions (internal/admin use)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db
      .query("submissions")
      .order("desc")
      .take(100);

    // Enrich with design data
    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const design = await ctx.db.get(submission.designId);
        return {
          ...submission,
          design,
        };
      })
    );

    return enriched;
  },
});

/**
 * List pending submissions (internal/admin use)
 */
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // Enrich with design data
    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const design = await ctx.db.get(submission.designId);
        return {
          ...submission,
          design,
        };
      })
    );

    return enriched;
  },
});

/**
 * List submissions by status
 */
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();

    return submissions;
  },
});

/**
 * List submissions by email (customer view)
 */
export const listByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .collect();

    // Enrich with design data
    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const design = await ctx.db.get(submission.designId);
        return {
          ...submission,
          design,
        };
      })
    );

    return enriched;
  },
});

/**
 * Update submission status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("submissions"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const submission = await ctx.db.get(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Validate status (3-step workflow: pending -> in_review -> quoted)
    const validStatuses = ["pending", "in_review", "quoted", "ordered", "rejected"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await ctx.db.patch(id, { status });

    // Also update the design status if moving to quoted or ordered
    if (status === "quoted" || status === "ordered") {
      await ctx.db.patch(submission.designId, {
        status,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.get(id);
  },
});

/**
 * Add notes to a submission
 */
export const addNotes = mutation({
  args: {
    id: v.id("submissions"),
    notes: v.string(),
  },
  handler: async (ctx, { id, notes }) => {
    const submission = await ctx.db.get(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.patch(id, { notes });

    return await ctx.db.get(id);
  },
});

/**
 * Update internal notes (team-only)
 */
export const updateInternalNotes = mutation({
  args: {
    id: v.id("submissions"),
    internalNotes: v.string(),
  },
  handler: async (ctx, { id, internalNotes }) => {
    const submission = await ctx.db.get(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.patch(id, { internalNotes });

    return await ctx.db.get(id);
  },
});
