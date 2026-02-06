import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===================
// CREATE
// ===================

/** Start a new design session (called when user taps "Let's Go") */
export const create = mutation({
  args: {
    userId: v.id("users"),
    isDemo: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, isDemo }) => {
    const now = Date.now();
    return await ctx.db.insert("designSessions", {
      userId,
      currentStep: "intro",
      completedSteps: [],
      lastActiveAt: now,
      isDemo: isDemo ?? false,
      createdAt: now,
    });
  },
});

// ===================
// READ
// ===================

/** Get a session by ID */
export const get = query({
  args: { id: v.id("designSessions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Get the most recent active session for a user */
export const getActiveForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const sessions = await ctx.db
      .query("designSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(1);
    return sessions[0] ?? null;
  },
});

/** List all sessions for a user (for dashboard) */
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("designSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ===================
// UPDATE FLOW STATE
// ===================

/** Advance to the next step */
export const advanceStep = mutation({
  args: {
    id: v.id("designSessions"),
    nextStep: v.string(),
  },
  handler: async (ctx, { id, nextStep }) => {
    const session = await ctx.db.get(id);
    if (!session) throw new Error("Session not found");

    const completedSteps = session.completedSteps.includes(session.currentStep)
      ? session.completedSteps
      : [...session.completedSteps, session.currentStep];

    await ctx.db.patch(id, {
      currentStep: nextStep,
      completedSteps,
      lastActiveAt: Date.now(),
    });
  },
});

/** Touch lastActiveAt (for interruption recovery) */
export const touch = mutation({
  args: { id: v.id("designSessions") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { lastActiveAt: Date.now() });
  },
});

// ===================
// PHOTO & WALLS
// ===================

/** Save photo data after capture */
export const savePhoto = mutation({
  args: {
    id: v.id("designSessions"),
    photoStorageId: v.string(),
  },
  handler: async (ctx, { id, photoStorageId }) => {
    await ctx.db.patch(id, {
      photoStorageId,
      lastActiveAt: Date.now(),
    });
  },
});

/** Save photo analysis from AI */
export const savePhotoAnalysis = mutation({
  args: {
    id: v.id("designSessions"),
    photoAnalysis: v.string(),
  },
  handler: async (ctx, { id, photoAnalysis }) => {
    await ctx.db.patch(id, {
      photoAnalysis,
      lastActiveAt: Date.now(),
    });
  },
});

/** Save wall detection results */
export const saveWalls = mutation({
  args: {
    id: v.id("designSessions"),
    walls: v.array(v.object({
      label: v.string(),
      lengthMm: v.number(),
      selected: v.boolean(),
    })),
    roomShape: v.string(),
  },
  handler: async (ctx, { id, walls, roomShape }) => {
    await ctx.db.patch(id, {
      walls,
      roomShape,
      lastActiveAt: Date.now(),
    });
  },
});

/** Update wall selection (user toggles walls on/off) */
export const updateWallSelection = mutation({
  args: {
    id: v.id("designSessions"),
    wallIndex: v.number(),
    selected: v.boolean(),
  },
  handler: async (ctx, { id, wallIndex, selected }) => {
    const session = await ctx.db.get(id);
    if (!session?.walls) throw new Error("No walls data");

    const walls = [...session.walls];
    if (wallIndex < 0 || wallIndex >= walls.length) throw new Error("Invalid wall index");

    walls[wallIndex] = { ...walls[wallIndex], selected };
    await ctx.db.patch(id, { walls, lastActiveAt: Date.now() });
  },
});

// ===================
// DISCOVERY (user context)
// ===================

/** Save discovery responses (partial updates — called as user answers each question) */
export const updateUserContext = mutation({
  args: {
    id: v.id("designSessions"),
    userContext: v.object({
      purpose: v.optional(v.string()),
      styleSignals: v.optional(v.array(v.string())),
      stylePresetId: v.optional(v.string()),
      budgetRange: v.optional(v.string()),
      priorities: v.optional(v.array(v.string())),
      specificRequests: v.optional(v.array(v.string())),
      concerns: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { id, userContext }) => {
    const session = await ctx.db.get(id);
    if (!session) throw new Error("Session not found");

    // Merge with existing context (keep previous values, override with new ones)
    const existing = session.userContext ?? {};
    const merged = {
      ...existing,
      ...Object.fromEntries(
        Object.entries(userContext).filter(([, v]) => v !== undefined)
      ),
    };

    await ctx.db.patch(id, {
      userContext: merged,
      lastActiveAt: Date.now(),
    });
  },
});

// ===================
// DESIGN GENERATION RESULTS
// ===================

/** Save the generated layout config */
export const saveLayout = mutation({
  args: {
    id: v.id("designSessions"),
    layoutConfig: v.any(),
    layoutDescription: v.string(),
    designId: v.optional(v.id("designs")),
  },
  handler: async (ctx, { id, layoutConfig, layoutDescription, designId }) => {
    await ctx.db.patch(id, {
      layoutConfig,
      layoutDescription,
      designId,
      lastActiveAt: Date.now(),
    });
  },
});

/** Save render images */
export const saveRenders = mutation({
  args: {
    id: v.id("designSessions"),
    renderStorageIds: v.array(v.string()),
  },
  handler: async (ctx, { id, renderStorageIds }) => {
    await ctx.db.patch(id, {
      renderStorageIds,
      lastActiveAt: Date.now(),
    });
  },
});

/** Save price estimate */
export const savePriceEstimate = mutation({
  args: {
    id: v.id("designSessions"),
    priceEstimate: v.object({
      lowCents: v.number(),
      estimateCents: v.number(),
      highCents: v.number(),
      breakdown: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { id, priceEstimate }) => {
    await ctx.db.patch(id, {
      priceEstimate,
      lastActiveAt: Date.now(),
    });
  },
});

// ===================
// MESSAGES
// ===================

/** Add a message to the session conversation */
export const addMessage = mutation({
  args: {
    sessionId: v.id("designSessions"),
    role: v.string(),
    content: v.string(),
    step: v.string(),
  },
  handler: async (ctx, { sessionId, role, content, step }) => {
    return await ctx.db.insert("designSessionMessages", {
      sessionId,
      role,
      content,
      step,
      createdAt: Date.now(),
    });
  },
});

/** Get all messages for a session */
export const getMessages = query({
  args: { sessionId: v.id("designSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("designSessionMessages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

/** Get messages for a specific step */
export const getMessagesByStep = query({
  args: {
    sessionId: v.id("designSessions"),
    step: v.string(),
  },
  handler: async (ctx, { sessionId, step }) => {
    const allMessages = await ctx.db
      .query("designSessionMessages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
    return allMessages.filter(m => m.step === step);
  },
});

// ===================
// GENERATION JOBS
// ===================

/** Create a background generation job */
export const createJob = mutation({
  args: {
    sessionId: v.id("designSessions"),
    type: v.string(),
  },
  handler: async (ctx, { sessionId, type }) => {
    return await ctx.db.insert("generationJobs", {
      sessionId,
      type,
      status: "queued",
      createdAt: Date.now(),
    });
  },
});

/** Update job progress */
export const updateJobProgress = mutation({
  args: {
    jobId: v.id("generationJobs"),
    status: v.string(),
    progress: v.optional(v.number()),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, status, progress, result, error }) => {
    const patch: Record<string, unknown> = { status };
    if (progress !== undefined) patch.progress = progress;
    if (result !== undefined) patch.result = result;
    if (error !== undefined) patch.error = error;
    if (status === "processing") patch.startedAt = Date.now();
    if (status === "completed" || status === "failed") patch.completedAt = Date.now();

    await ctx.db.patch(jobId, patch);
  },
});

/** Get jobs for a session */
export const getJobs = query({
  args: { sessionId: v.id("designSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("generationJobs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
  },
});

/** Get the latest job of a specific type for a session */
export const getLatestJob = query({
  args: {
    sessionId: v.id("designSessions"),
    type: v.string(),
  },
  handler: async (ctx, { sessionId, type }) => {
    const jobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_sessionId_type", (q) =>
        q.eq("sessionId", sessionId).eq("type", type)
      )
      .order("desc")
      .take(1);
    return jobs[0] ?? null;
  },
});
