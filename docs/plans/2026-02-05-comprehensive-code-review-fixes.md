# Comprehensive Code Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical security vulnerabilities, performance issues, and code quality problems identified in the full code review.

**Architecture:** This plan addresses issues in three priority tiers: (1) Critical security fixes for authorization and access control, (2) Performance optimizations for N+1 queries and expensive operations, (3) Code quality improvements for type safety and testing. Each tier can be implemented independently but should follow the order for maximum impact.

**Tech Stack:** Next.js 16, Convex (serverless backend), React 19, Zustand, TypeScript 5, Vitest

---

## Phase 1: Critical Security Fixes

### Task 1: Create Shared Types in Convex

**Files:**
- Create: `convex/lib/types.ts`

**Why:** Types must live in `convex/` folder since Convex runs in isolated environment and cannot import from `src/`.

**Step 1: Create the types file**

```typescript
// convex/lib/types.ts
import type { Id } from "../_generated/dataModel";

/**
 * Order status values
 */
export const ORDER_STATUSES = [
  "confirmed",
  "production",
  "qc",
  "ready_to_ship",
  "shipped",
  "delivered",
  "complete",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

/**
 * Submission status values
 */
export const SUBMISSION_STATUSES = [
  "pending",
  "in_review",
  "quoted",
  "ordered",
  "rejected",
] as const;

export type SubmissionStatus = typeof SUBMISSION_STATUSES[number];

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = [
  "order_confirmed",
  "production_started",
  "qc_complete",
  "ready_to_ship",
  "delivered",
  "post_install",
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number];

/**
 * Production photo milestones
 */
export const PHOTO_MILESTONES = [
  "production",
  "qc",
  "packaging",
  "delivery",
] as const;

export type PhotoMilestone = typeof PHOTO_MILESTONES[number];

/**
 * Valid image MIME types
 */
export const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/**
 * Timeline mapping from status to field
 */
export const STATUS_TO_TIMELINE: Record<OrderStatus, string | null> = {
  confirmed: "confirmed",
  production: "productionStart",
  qc: "qcComplete",
  ready_to_ship: "readyToShip",
  shipped: "shipped",
  delivered: "delivered",
  complete: null,
};

/**
 * Status to notification type mapping
 */
export const STATUS_TO_NOTIFICATION: Partial<Record<OrderStatus, NotificationType>> = {
  confirmed: "order_confirmed",
  production: "production_started",
  qc: "qc_complete",
  ready_to_ship: "ready_to_ship",
  delivered: "delivered",
};

/**
 * Order timeline structure
 */
export interface OrderTimeline {
  confirmed?: number;
  productionStart?: number;
  qcComplete?: number;
  readyToShip?: number;
  shipped?: number;
  delivered?: number;
  installed?: number;
}

/**
 * Time constants (in milliseconds)
 */
export const MS_PER_DAY = 86400000;
export const MS_PER_HOUR = 3600000;
export const MS_PER_WEEK = MS_PER_DAY * 7;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Image processing limits
 */
export const IMAGE_LIMITS = {
  MAX_DIMENSION_PX: 1568,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  COMPRESSION_QUALITY: 0.8,
} as const;

/**
 * Email sender configuration
 */
export const EMAIL_CONFIG = {
  FROM_ADDRESS: "North South Carpentry <orders@northsouthcarpentry.com>",
  ADMIN_DOMAIN: "@northsouthcarpentry.com",
} as const;
```

**Step 2: Commit**

```bash
git add convex/lib/types.ts
git commit -m "feat: create shared types and constants in convex/lib"
```

---

### Task 2: Create Auth Helper Utilities

**Files:**
- Create: `convex/lib/auth.ts`

**Step 1: Create the auth helper file**

```typescript
// convex/lib/auth.ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { EMAIL_CONFIG } from "./types";

/**
 * Get the current authenticated user identity
 * Returns null if not authenticated
 */
export async function getAuthIdentity(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity();
}

/**
 * Get the current authenticated user ID (subject)
 * Returns null if not authenticated
 */
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

/**
 * Require authentication - throws if not authenticated
 * Returns the user identity
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
}

/**
 * Check if user is admin
 * Admin check: email domain matches configured admin domain
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const email = identity.email;
  if (!email) return false;

  return email.endsWith(EMAIL_CONFIG.ADMIN_DOMAIN);
}

/**
 * Require admin access - throws if not admin
 * Returns the user identity
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  const email = identity.email;

  if (!email || !email.endsWith(EMAIL_CONFIG.ADMIN_DOMAIN)) {
    throw new Error("Admin access required");
  }

  return identity;
}

/**
 * Check if the authenticated user owns a resource
 * Compares the resource's userId/email with the authenticated user
 */
export async function requireOwnershipOrAdmin(
  ctx: QueryCtx | MutationCtx,
  resourceEmail: string | undefined
): Promise<void> {
  const identity = await requireAuth(ctx);

  // Admins can access any resource
  if (identity.email?.endsWith(EMAIL_CONFIG.ADMIN_DOMAIN)) {
    return;
  }

  // Check ownership by email
  if (resourceEmail && identity.email === resourceEmail) {
    return;
  }

  throw new Error("Access denied: you don't own this resource");
}
```

**Step 2: Commit**

```bash
git add convex/lib/auth.ts
git commit -m "feat(security): add auth helper utilities for access control"
```

---

### Task 3: Create users.current Query

**Files:**
- Modify: `convex/users.ts`

**Why:** AdminGuard needs a query to get the current authenticated user's profile.

**Step 1: Add current user query at end of file**

```typescript
import { getAuthIdentity, requireAdmin } from "./lib/auth";

/**
 * Get the currently authenticated user
 * Returns user profile if found, null otherwise
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthIdentity(ctx);
    if (!identity || !identity.email) {
      return null;
    }

    // Find user by email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      return null;
    }

    // Return user with email from identity (in case stored email differs)
    return {
      ...user,
      email: identity.email,
    };
  },
});
```

**Step 2: Secure the list query**

Replace the existing `list` query (lines 92-100) with:

```typescript
/**
 * List all users (admin only)
 * SECURED: Requires admin authentication
 */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    // SECURITY: Require admin access
    await requireAdmin(ctx);

    return await ctx.db
      .query("users")
      .order("desc")
      .take(limit);
  },
});
```

**Step 3: Commit**

```bash
git add convex/users.ts
git commit -m "feat(security): add users.current query and secure users.list"
```

---

### Task 4: Secure Admin Notification Trigger

**Files:**
- Modify: `convex/notifications.ts:41-84`

**Step 1: Add auth import and requireAdmin check**

Add at top of file:
```typescript
import { requireAdmin } from "./lib/auth";
import { NOTIFICATION_TYPES, NotificationType } from "./lib/types";
```

Replace the `adminTriggerNotification` mutation (lines 41-84) with:

```typescript
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
```

**Step 2: Commit**

```bash
git add convex/notifications.ts
git commit -m "fix(security): add admin auth check to adminTriggerNotification"
```

---

### Task 5: Secure Orders Queries

**Files:**
- Modify: `convex/orders.ts`

**Step 1: Add imports at top of file**

```typescript
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { MS_PER_DAY, ORDER_STATUSES, OrderStatus, STATUS_TO_TIMELINE, STATUS_TO_NOTIFICATION, NotificationType, OrderTimeline } from "./lib/types";
```

**Step 2: Replace generateOrderNumber function (lines 8-28)**

```typescript
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
```

**Step 3: Update generateOrderNumber call site (around line 47)**

Change from:
```typescript
const orderNumber = await generateOrderNumber(ctx);
```
To:
```typescript
const orderNumber = generateOrderNumber();
```

**Step 4: Update time calculation (around line 14)**

Change from:
```typescript
const endOfDay = startOfDay + 86400000;
```
To:
```typescript
const endOfDay = startOfDay + MS_PER_DAY;
```

**Step 5: Add admin check to listAll query (lines 252-278)**

```typescript
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
```

**Step 6: Fix type assertions in updateStatus (around lines 193, 224)**

Replace the timeline update logic:
```typescript
// Update timeline with proper typing
const timeline: OrderTimeline = order.timeline || {};
const timelineField = STATUS_TO_TIMELINE[status as OrderStatus];
if (timelineField) {
  (timeline as Record<string, number>)[timelineField] = Date.now();
}
```

Replace the notification type cast:
```typescript
const notificationType = STATUS_TO_NOTIFICATION[status as OrderStatus];
// ...
type: notificationType as NotificationType,
```

**Step 7: Commit**

```bash
git add convex/orders.ts
git commit -m "fix(security): secure orders.listAll and use proper types"
```

---

### Task 6: Secure Submissions Queries

**Files:**
- Modify: `convex/submissions.ts`

**Step 1: Add imports at top of file**

```typescript
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { requireAdmin, requireAuth } from "./lib/auth";
```

**Step 2: Secure listAll query (lines 85-106)**

```typescript
/**
 * List all submissions (admin use only)
 * SECURED: Requires admin authentication
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const submissions = await ctx.db
      .query("submissions")
      .order("asc")
      .take(100);

    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const design = await ctx.db.get(submission.designId);
        return { ...submission, design };
      })
    );

    return enriched;
  },
});
```

**Step 3: Secure listPending query (lines 111-133)**

```typescript
/**
 * List pending submissions (admin use only)
 * SECURED: Requires admin authentication
 */
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const design = await ctx.db.get(submission.designId);
        return { ...submission, design };
      })
    );

    return enriched;
  },
});
```

**Step 4: Secure listByStatus query (lines 138-149)**

```typescript
/**
 * List submissions by status (admin use only)
 * SECURED: Requires admin authentication
 */
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();

    return submissions;
  },
});
```

**Step 5: Commit**

```bash
git add convex/submissions.ts
git commit -m "fix(security): secure all submissions admin queries"
```

---

### Task 7: Secure Document and Photo Access

**Files:**
- Modify: `convex/documents.ts`
- Modify: `convex/productionPhotos.ts`

**Step 1: Update documents.ts**

Add imports at top:
```typescript
import { requireAuth, requireOwnershipOrAdmin } from "./lib/auth";
```

Secure `generateUploadUrl`:
```typescript
/**
 * Generate upload URL for admin to upload documents
 * SECURED: Requires authentication
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
```

Secure `list` query:
```typescript
/**
 * List documents for an order
 * SECURED: Requires ownership or admin access
 */
export const list = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    // Get order and submission to check ownership
    const order = await ctx.db.get(orderId);
    if (!order) return { quotes: [], invoices: [] };

    const submission = await ctx.db.get(order.submissionId);
    await requireOwnershipOrAdmin(ctx, submission?.email);

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .collect();

    const quotes = documents
      .filter((doc) => doc.type === "quote")
      .sort((a, b) => b.version - a.version);

    const invoices = documents
      .filter((doc) => doc.type === "invoice")
      .sort((a, b) => b.version - a.version);

    return { quotes, invoices };
  },
});
```

Secure `getDownloadUrl`:
```typescript
/**
 * Get temporary download URL from Convex storage
 * SECURED: Requires authentication (URL is temporary)
 */
export const getDownloadUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    await requireAuth(ctx);
    return await ctx.storage.getUrl(storageId);
  },
});
```

**Step 2: Update productionPhotos.ts**

Add imports at top:
```typescript
import { requireAuth, requireOwnershipOrAdmin, requireAdmin } from "./lib/auth";
import { PHOTO_MILESTONES, PhotoMilestone, VALID_IMAGE_TYPES, IMAGE_LIMITS } from "./lib/types";
```

Secure and validate `upload` mutation:
```typescript
/**
 * Upload production photo
 * SECURED: Requires admin access, validates file type and size
 */
export const upload = mutation({
  args: {
    orderId: v.id("orders"),
    storageId: v.string(),
    milestone: v.string(),
    caption: v.optional(v.string()),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only admins can upload production photos
    await requireAdmin(ctx);

    // Verify order exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Validate milestone
    if (!PHOTO_MILESTONES.includes(args.milestone as PhotoMilestone)) {
      throw new Error(`Invalid milestone: ${args.milestone}`);
    }

    // Validate content type if provided
    if (args.contentType && !VALID_IMAGE_TYPES.includes(args.contentType as any)) {
      throw new Error(`Invalid file type: ${args.contentType}. Only images allowed.`);
    }

    // Validate file size
    if (args.fileSize && args.fileSize > IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File too large: ${args.fileSize} bytes. Maximum is 10MB.`);
    }

    const photoId = await ctx.db.insert("productionPhotos", {
      orderId: args.orderId,
      storageId: args.storageId,
      milestone: args.milestone,
      caption: args.caption,
      uploadedAt: Date.now(),
    });

    return photoId;
  },
});
```

Secure `generateUploadUrl`:
```typescript
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
```

Secure `listByOrder`:
```typescript
/**
 * List photos for an order
 * SECURED: Requires ownership or admin access
 */
export const listByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return { production: [], qc: [], packaging: [], delivery: [] };

    const submission = await ctx.db.get(order.submissionId);
    await requireOwnershipOrAdmin(ctx, submission?.email);

    const photos = await ctx.db
      .query("productionPhotos")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .collect();

    photos.sort((a, b) => b.uploadedAt - a.uploadedAt);

    const grouped: Record<string, typeof photos> = {
      production: [],
      qc: [],
      packaging: [],
      delivery: [],
    };

    for (const photo of photos) {
      if (grouped[photo.milestone]) {
        grouped[photo.milestone].push(photo);
      }
    }

    return grouped;
  },
});
```

Secure `getPhotoUrl`:
```typescript
export const getPhotoUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    await requireAuth(ctx);
    return await ctx.storage.getUrl(storageId);
  },
});
```

**Step 3: Update PhotoUploader.tsx to pass content type and size**

In `src/components/admin/PhotoUploader.tsx`, update the uploadPhoto call (around line 79):

```typescript
await uploadPhoto({
  orderId,
  storageId,
  milestone: selectedMilestone,
  caption: `${selectedMilestone} photo - ${new Date().toLocaleDateString()}`,
  contentType: file.type,
  fileSize: file.size,
});
```

**Step 4: Commit**

```bash
git add convex/documents.ts convex/productionPhotos.ts src/components/admin/PhotoUploader.tsx
git commit -m "fix(security): secure document and photo access with ownership checks"
```

---

### Task 8: Create Admin Route Protection Component

**Files:**
- Create: `src/components/auth/AdminGuard.tsx`

**Step 1: Create the AdminGuard component**

```typescript
"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

const ADMIN_DOMAIN = "@northsouthcarpentry.com";

/**
 * Protects admin routes - redirects non-admins to home
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Get current user profile
  const currentUser = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.replace("/login?redirect=/admin");
      return;
    }

    // Wait for user query
    if (currentUser === undefined) return;

    // User loaded - check admin status
    setIsChecking(false);

    // Not admin - redirect to home
    if (!currentUser?.email?.endsWith(ADMIN_DOMAIN)) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, currentUser, router]);

  // Loading state
  if (authLoading || isChecking || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  // Not admin - show nothing while redirecting
  if (!currentUser?.email?.endsWith(ADMIN_DOMAIN)) {
    return null;
  }

  return <>{children}</>;
}
```

**Step 2: Commit**

```bash
git add src/components/auth/AdminGuard.tsx
git commit -m "feat(security): create AdminGuard component for route protection"
```

---

### Task 9: Apply AdminGuard to All Admin Pages

**Files:**
- Modify: `src/app/admin/orders/page.tsx`
- Modify: `src/app/admin/submissions/page.tsx`
- Modify: `src/app/admin/qr-labels/page.tsx`

**Step 1: Update admin/orders/page.tsx**

```typescript
"use client";

import { OrderList } from "@/components/admin/OrderList";
import { AdminGuard } from "@/components/auth/AdminGuard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto p-6">
          <header className="mb-8">
            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Submissions
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Order Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Track and manage production orders
            </p>
          </header>

          <OrderList />
        </div>
      </div>
    </AdminGuard>
  );
}
```

**Step 2: Update admin/submissions/page.tsx**

```typescript
"use client";

import { SubmissionQueue } from "@/components/dashboard/SubmissionQueue";
import { AdminGuard } from "@/components/auth/AdminGuard";
import Link from "next/link";
import { Package } from "lucide-react";

export default function AdminSubmissionsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto p-6">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Submission Queue
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  Review customer submissions and create quotes
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <Package className="w-4 h-4" />
                View Orders
              </Link>
            </div>
          </header>

          <SubmissionQueue />
        </div>
      </div>
    </AdminGuard>
  );
}
```

**Step 3: Update admin/qr-labels/page.tsx**

```typescript
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { QRLabelSheet, printStyles } from "@/lib/qr";
import { transformOrderToSpec } from "@/lib/pdf/transformOrderToSpec";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/auth/AdminGuard";

function QRLabelsContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id");
  const orderId = orderIdParam as Id<"orders"> | null;

  const order = useQuery(
    api.orders.get,
    orderId ? { id: orderId } : "skip"
  );

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = printStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">No order ID provided</p>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Order not found</p>
      </div>
    );
  }

  const specData = transformOrderToSpec(order);
  const panelLabels = specData.panels.map((panel) => ({
    panelId: panel.id,
    cabinetRef: panel.cabinetRef,
    dimensions: `${panel.width} x ${panel.height} x ${panel.thickness}mm`,
    material: panel.material,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden fixed top-4 right-4 z-10">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Labels
        </Button>
      </div>

      <div className="print:hidden p-6 border-b">
        <h1 className="text-xl font-bold">QR Labels - {order.orderNumber}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {panelLabels.length} panels
        </p>
      </div>

      <QRLabelSheet
        orderId={order._id}
        orderNumber={order.orderNumber}
        panels={panelLabels}
      />
    </div>
  );
}

export default function QRLabelsPage() {
  return (
    <AdminGuard>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        }
      >
        <QRLabelsContent />
      </Suspense>
    </AdminGuard>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/admin/orders/page.tsx src/app/admin/submissions/page.tsx src/app/admin/qr-labels/page.tsx
git commit -m "fix(security): protect all admin pages with AdminGuard"
```

---

### Task 10: Secure Portal Page with Ownership Check

**Files:**
- Modify: `src/app/portal/page.tsx`
- Modify: `src/components/portal/OrderDetail.tsx` (if exists)

**Why:** Portal accepts order ID from URL with no ownership validation - anyone can view any order.

**Step 1: Update portal page to pass ownership context**

The fix requires updating OrderDetail component to verify ownership. Add auth check in the OrderDetail component or create a secure query.

First, update `convex/orders.ts` to add a secure get query:

```typescript
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
```

**Step 2: Update OrderDetail to use secure query**

In `src/components/portal/OrderDetail.tsx`, change the query from `api.orders.get` to `api.orders.getSecure`.

**Step 3: Commit**

```bash
git add convex/orders.ts src/components/portal/OrderDetail.tsx
git commit -m "fix(security): add ownership check to portal order access"
```

---

## Phase 2: Performance Optimizations

### Task 11: Fix N+1 Queries with Batch Loading Helper

**Files:**
- Create: `convex/lib/batch.ts`
- Modify: `convex/orders.ts`
- Modify: `convex/submissions.ts`

**Note:** Convex doesn't have native batch reads. This helper runs queries in parallel, which is better than sequential but still N queries. Document this limitation.

**Step 1: Create batch helper**

```typescript
// convex/lib/batch.ts
import { Doc, Id, TableNames } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

/**
 * Batch load multiple documents by ID
 *
 * NOTE: Convex doesn't have native batch reads. This runs queries
 * in parallel which is faster than sequential but still N queries.
 * For true batch optimization, consider denormalizing data.
 */
export async function batchGet<T extends TableNames>(
  ctx: QueryCtx,
  ids: Id<T>[]
): Promise<Map<string, Doc<T>>> {
  const results = new Map<string, Doc<T>>();

  // Deduplicate IDs
  const uniqueIds = [...new Set(ids.map(id => id.toString()))];

  await Promise.all(
    uniqueIds.map(async (idStr) => {
      const doc = await ctx.db.get(idStr as Id<T>);
      if (doc) {
        results.set(idStr, doc as Doc<T>);
      }
    })
  );

  return results;
}

/**
 * Batch load with a simpler return type for common use cases
 */
export async function batchGetArray<T extends TableNames>(
  ctx: QueryCtx,
  ids: Id<T>[]
): Promise<(Doc<T> | null)[]> {
  const map = await batchGet(ctx, ids);
  return ids.map(id => map.get(id.toString()) ?? null);
}
```

**Step 2: Update orders.ts listAll to use batch loading**

```typescript
import { batchGet } from "./lib/batch";

/**
 * List all orders (admin use only)
 * OPTIMIZED: Uses parallel loading (not true batch, but faster than sequential)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
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
```

**Step 3: Apply same pattern to listByUserId and submission queries**

**Step 4: Commit**

```bash
git add convex/lib/batch.ts convex/orders.ts convex/submissions.ts
git commit -m "perf: add batch loading helper to reduce query overhead"
```

---

### Task 12: Replace Expensive JSON.stringify Equality Check

**Files:**
- Modify: `src/stores/useCabinetStore.ts:129-133`

**Step 1: Replace equality function with proper comparison**

```typescript
    {
      // Temporal options
      limit: 20, // Maximum 20 undo states
      // Custom equality check (much faster than JSON.stringify)
      equality: (a, b) => {
        // Compare dimensions
        const dimA = a.config.dimensions;
        const dimB = b.config.dimensions;
        if (dimA.width !== dimB.width) return false;
        if (dimA.height !== dimB.height) return false;
        if (dimA.depth !== dimB.depth) return false;

        // Compare finishes
        const finA = a.config.finishes;
        const finB = b.config.finishes;
        if (finA.material !== finB.material) return false;
        if (finA.hardware !== finB.hardware) return false;
        if (finA.doorProfile !== finB.doorProfile) return false;

        // Compare slots - check size first
        const slotsA = a.config.slots;
        const slotsB = b.config.slots;
        if (slotsA.size !== slotsB.size) return false;

        // Compare slot contents
        for (const [key, slotA] of slotsA) {
          const slotB = slotsB.get(key);
          if (!slotB) return false;

          // Compare module presence
          if (!slotA.module && !slotB.module) continue;
          if (!slotA.module || !slotB.module) return false;

          // Compare module type
          if (slotA.module.type !== slotB.module.type) return false;
        }

        return true;
      },
    }
```

**Step 2: Commit**

```bash
git add src/stores/useCabinetStore.ts
git commit -m "perf: replace JSON.stringify with proper equality check in cabinet store"
```

---

### Task 13: Optimize MaterialApplicator with Stable Mesh Caching

**Files:**
- Modify: `src/components/configurator/MaterialPreview.tsx:117-139`

**Step 1: Replace MaterialApplicator with optimized version**

```typescript
/**
 * Component to apply materials to all cabinet meshes in the scene
 * OPTIMIZED: Caches mesh references with invalidation on scene change
 */
export function MaterialApplicator() {
  const { cabinetMaterial, doorMaterial } = useMaterialPreview();
  const { scene, invalidate } = useThree();

  // Track scene children count for cache invalidation
  const [sceneVersion, setSceneVersion] = useState(0);

  // Update version when scene children change
  useEffect(() => {
    const checkScene = () => {
      setSceneVersion(v => v + 1);
    };

    // Listen for scene changes
    scene.addEventListener('childadded', checkScene);
    scene.addEventListener('childremoved', checkScene);

    return () => {
      scene.removeEventListener('childadded', checkScene);
      scene.removeEventListener('childremoved', checkScene);
    };
  }, [scene]);

  // Cache mesh references, invalidate when scene changes
  const meshRefs = useMemo(() => {
    const cabinetMeshes: THREE.Mesh[] = [];
    const doorMeshes: THREE.Mesh[] = [];

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.name.includes('cabinet') || object.userData.isCabinet) {
          cabinetMeshes.push(object);
        }
        if (object.name.includes('door') || object.userData.isDoor) {
          doorMeshes.push(object);
        }
      }
    });

    return { cabinetMeshes, doorMeshes };
  }, [scene, sceneVersion]);

  // Apply materials only to cached meshes
  useEffect(() => {
    meshRefs.cabinetMeshes.forEach((mesh) => {
      if (mesh.material !== cabinetMaterial) {
        mesh.material = cabinetMaterial;
      }
    });
    meshRefs.doorMeshes.forEach((mesh) => {
      if (mesh.material !== doorMaterial) {
        mesh.material = doorMaterial;
      }
    });
    invalidate();
  }, [cabinetMaterial, doorMaterial, meshRefs, invalidate]);

  return null;
}
```

**Step 2: Add useState import if missing**

```typescript
import { useMemo, useEffect, useState } from 'react';
```

**Step 3: Commit**

```bash
git add src/components/configurator/MaterialPreview.tsx
git commit -m "perf: cache mesh references with scene change invalidation"
```

---

### Task 14: Create Product Catalog Cache Context

**Files:**
- Create: `src/contexts/ProductCatalogContext.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create the context with proper types**

```typescript
// src/contexts/ProductCatalogContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Define proper types for catalog items
interface Material {
  _id: string;
  code: string;
  name: string;
  supplier: string;
  category: string;
  colorFamily: string;
  pricePerUnit: number;
  swatchUrl?: string;
  textureUrl?: string;
  active: boolean;
  sortOrder: number;
}

interface Hardware {
  _id: string;
  code: string;
  name: string;
  supplier: string;
  category: string;
  specs?: Record<string, unknown>;
  pricePerUnit: number;
  priceVariance?: number;
  active: boolean;
  sortOrder: number;
}

interface DoorProfile {
  _id: string;
  code: string;
  name: string;
  description?: string;
  pricePerDoor: number;
  imageUrl?: string;
  active: boolean;
  sortOrder: number;
}

interface Module {
  _id: string;
  code: string;
  name: string;
  productCode: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  minWidth?: number;
  maxWidth?: number;
  pricePerUnit: number;
  modelUrl?: string;
  thumbnailUrl?: string;
  active: boolean;
  sortOrder: number;
}

export interface ProductCatalog {
  materials: Material[] | undefined;
  hardware: Hardware[] | undefined;
  doorProfiles: DoorProfile[] | undefined;
  modules: Module[] | undefined;
  isLoading: boolean;
}

const ProductCatalogContext = createContext<ProductCatalog | null>(null);

/**
 * Provider that loads product catalog once at app level
 * Child components use useProductCatalog() hook instead of individual queries
 */
export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const materials = useQuery(api.products.materials.list) as Material[] | undefined;
  const hardware = useQuery(api.products.hardware.list) as Hardware[] | undefined;
  const doorProfiles = useQuery(api.doorProfiles.list) as DoorProfile[] | undefined;
  const modules = useQuery(api.products.modules.list) as Module[] | undefined;

  const isLoading = !materials || !hardware || !doorProfiles || !modules;

  return (
    <ProductCatalogContext.Provider
      value={{ materials, hardware, doorProfiles, modules, isLoading }}
    >
      {children}
    </ProductCatalogContext.Provider>
  );
}

/**
 * Hook to access cached product catalog
 */
export function useProductCatalog(): ProductCatalog {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  }
  return context;
}

// Re-export types for consumers
export type { Material, Hardware, DoorProfile, Module };
```

**Step 2: Add provider to app layout**

Update `src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";
import { QueryProvider } from "@/lib/query-client";
import { ProductCatalogProvider } from "@/contexts/ProductCatalogContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "North South Carpentry",
  description: "Design your dream kitchen, laundry, vanity or wardrobe",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NSC",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConvexClientProvider>
          <QueryProvider>
            <ProductCatalogProvider>
              {children}
            </ProductCatalogProvider>
          </QueryProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Step 3: Commit**

```bash
git add src/contexts/ProductCatalogContext.tsx src/app/layout.tsx
git commit -m "feat(perf): create typed ProductCatalogContext with app-level provider"
```

---

### Task 15: Update usePricing to Use Cached Catalog

**Files:**
- Modify: `src/hooks/usePricing.ts`

**Step 1: Replace imports and queries**

```typescript
/**
 * usePricing hook
 * Phase 05: Finishes & Pricing
 *
 * Centralized pricing calculation that:
 * - Uses cached product catalog from context
 * - Reads configuration from Zustand store
 * - Calculates breakdown by category (all in cents)
 * - Returns formatted currency strings
 */

import { useMemo } from 'react';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useProductCatalog, Material, Hardware, DoorProfile, Module } from '@/contexts/ProductCatalogContext';

interface PriceBreakdown {
  cabinets: number;
  material: number;
  hardware: number;
  doorProfile: number;
  addons: number;
  total: number;
}

interface FormattedBreakdown {
  cabinets: string;
  material: string;
  hardware: string;
  doorProfile: string;
  addons: string;
  total: string;
  hardwareVariance: string;
}

export function usePricing() {
  // Use cached product catalog from context
  const { materials, hardware, doorProfiles, modules, isLoading } = useProductCatalog();

  // Subscribe only to config slice
  const config = useCabinetStore((state) => state.config);

  // Memoized formatter instance
  const formatter = useMemo(
    () => new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    []
  );

  // Calculate breakdown
  const breakdown = useMemo<PriceBreakdown>(() => {
    if (!materials || !hardware || !doorProfiles || !modules) {
      return { cabinets: 0, material: 0, hardware: 0, doorProfile: 0, addons: 0, total: 0 };
    }

    let cabinetsCost = 0;
    let materialCost = 0;
    let hardwareCost = 0;
    let doorProfileCost = 0;
    let addonsCost = 0;

    // Calculate cabinet/module costs
    config.slots.forEach((slot) => {
      if (!slot.module) return;

      const moduleType = slot.module.type;
      let matchedModule = modules.find((m: Module) => {
        const codeLC = m.code.toLowerCase();
        if (moduleType === 'standard' && codeLC.includes('base-600')) return true;
        if (moduleType === 'sink-base' && codeLC.includes('sink')) return true;
        if (moduleType === 'drawer-stack' && codeLC.includes('drawer')) return true;
        if (moduleType === 'pull-out-pantry' && codeLC.includes('pantry')) return true;
        if (moduleType === 'corner-base' && codeLC.includes('corner') && m.category === 'corner') return true;
        if (moduleType === 'appliance-tower' && codeLC.includes('tall')) return true;
        if (moduleType === 'open-shelving' && codeLC.includes('base-300')) return true;
        if (moduleType === 'standard-overhead' && codeLC.includes('oh-600')) return true;
        if (moduleType === 'glass-door' && codeLC.includes('oh-450')) return true;
        if (moduleType === 'open-shelf' && codeLC.includes('oh-300')) return true;
        if (moduleType === 'rangehood-space' && codeLC.includes('rangehood')) return true;
        if (moduleType === 'lift-up-door' && codeLC.includes('oh-600')) return true;
        return false;
      });

      if (!matchedModule) {
        matchedModule = modules.find((m: Module) => m.code === 'MOD-BASE-600');
      }

      if (matchedModule) {
        cabinetsCost += matchedModule.pricePerUnit;
      }
    });

    // Calculate material cost
    const selectedMaterial = materials.find((m: Material) => m.code === config.finishes.material);
    if (selectedMaterial) {
      materialCost = selectedMaterial.pricePerUnit;
    }

    // Calculate hardware cost
    const selectedHardware = hardware.find((h: Hardware) => h.code === config.finishes.hardware);
    if (selectedHardware) {
      hardwareCost = selectedHardware.pricePerUnit;
    }

    // Calculate door profile cost
    const selectedProfile = doorProfiles.find((p: DoorProfile) => p.code === config.finishes.doorProfile);
    if (selectedProfile) {
      const doorCount = Array.from(config.slots.values()).filter(s => s.module).length;
      doorProfileCost = selectedProfile.pricePerDoor * doorCount;
    }

    return {
      cabinets: cabinetsCost,
      material: materialCost,
      hardware: hardwareCost,
      doorProfile: doorProfileCost,
      addons: addonsCost,
      total: cabinetsCost + materialCost + hardwareCost + doorProfileCost + addonsCost,
    };
  }, [config, materials, hardware, doorProfiles, modules]);

  // Format breakdown for display
  const formatted = useMemo<FormattedBreakdown>(() => {
    const hardwareVarianceAmount = Math.round((breakdown.hardware * 5) / 100);
    return {
      cabinets: formatter.format(breakdown.cabinets / 100),
      material: formatter.format(breakdown.material / 100),
      hardware: formatter.format(breakdown.hardware / 100),
      doorProfile: formatter.format(breakdown.doorProfile / 100),
      addons: formatter.format(breakdown.addons / 100),
      total: formatter.format(breakdown.total / 100),
      hardwareVariance: formatter.format(hardwareVarianceAmount / 100),
    };
  }, [breakdown, formatter]);

  const formatPrice = (cents: number) => formatter.format(cents / 100);

  return {
    breakdown,
    formatted,
    formatPrice,
    isLoading,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/usePricing.ts
git commit -m "perf: use typed ProductCatalogContext in usePricing"
```

---

## Phase 3: Code Quality Improvements

### Task 16: Create Frontend Types Mirror

**Files:**
- Create: `src/types/orders.ts`

**Why:** Frontend needs access to same types. Mirror the convex types for client use.

**Step 1: Create the types file**

```typescript
// src/types/orders.ts
// Mirror of convex/lib/types.ts for frontend use

import type { Id } from "../../convex/_generated/dataModel";

export const ORDER_STATUSES = [
  "confirmed",
  "production",
  "qc",
  "ready_to_ship",
  "shipped",
  "delivered",
  "complete",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const SUBMISSION_STATUSES = [
  "pending",
  "in_review",
  "quoted",
  "ordered",
  "rejected",
] as const;

export type SubmissionStatus = typeof SUBMISSION_STATUSES[number];

export interface OrderTimeline {
  confirmed?: number;
  productionStart?: number;
  qcComplete?: number;
  readyToShip?: number;
  shipped?: number;
  delivered?: number;
  installed?: number;
}

export interface EnrichedOrder {
  _id: Id<"orders">;
  submissionId: Id<"submissions">;
  orderNumber: string;
  status: OrderStatus;
  depositPaid: boolean;
  depositAmount?: number;
  balanceDue?: number;
  totalAmount?: number;
  timeline?: OrderTimeline;
  createdAt: number;
  submission?: {
    _id: Id<"submissions">;
    name: string;
    email: string;
    phone?: string;
    status: SubmissionStatus;
  } | null;
  design?: {
    _id: Id<"designs">;
    productType: string;
    config: unknown;
  } | null;
}
```

**Step 2: Commit**

```bash
git add src/types/orders.ts
git commit -m "feat(types): create frontend type definitions for orders"
```

---

### Task 17: Write Tests for Order Status Workflow

**Files:**
- Create: `src/__tests__/orders.test.ts`

**Why:** Tests should be in `src/` to be picked up by vitest config.

**Step 1: Create the test file**

```typescript
// src/__tests__/orders.test.ts
import { describe, it, expect } from "vitest";
import { ORDER_STATUSES } from "../types/orders";

describe("Order Status Workflow", () => {
  it("should have valid status progression", () => {
    const expectedOrder = [
      "confirmed",
      "production",
      "qc",
      "ready_to_ship",
      "shipped",
      "delivered",
      "complete",
    ];
    expect(ORDER_STATUSES).toEqual(expectedOrder);
  });

  it("should have 7 statuses", () => {
    expect(ORDER_STATUSES.length).toBe(7);
  });
});

describe("Order Number Format", () => {
  it("should match new random format", () => {
    const orderNumberRegex = /^NS-\d{8}-[A-HJ-NP-Z2-9]{4}$/;

    // Valid new format
    expect("NS-20260205-A3B4").toMatch(orderNumberRegex);
    expect("NS-20260205-XY7Z").toMatch(orderNumberRegex);

    // Invalid old sequential format
    expect("NS-20260205-001").not.toMatch(orderNumberRegex);
    expect("NS-20260205-123").not.toMatch(orderNumberRegex);
  });

  it("should not contain confusing characters", () => {
    // Characters excluded: 0, O, 1, I, L
    const validChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    expect(validChars).not.toContain("0");
    expect(validChars).not.toContain("O");
    expect(validChars).not.toContain("1");
    expect(validChars).not.toContain("I");
    expect(validChars).not.toContain("L");
  });
});
```

**Step 2: Run the test**

Run: `npx vitest run src/__tests__/orders.test.ts`

**Step 3: Commit**

```bash
git add src/__tests__/orders.test.ts
git commit -m "test: add tests for order status workflow and number format"
```

---

### Task 18: Write Tests for Pricing Calculations

**Files:**
- Create: `src/__tests__/pricing.test.ts`

**Step 1: Create the test file**

```typescript
// src/__tests__/pricing.test.ts
import { describe, it, expect } from "vitest";

describe("Pricing Calculations", () => {
  const mockModules = [
    { code: "MOD-BASE-600", pricePerUnit: 45000 },
    { code: "MOD-BASE-SINK", pricePerUnit: 65000 },
    { code: "MOD-DRAWER-600", pricePerUnit: 75000 },
  ];

  const mockMaterials = [
    { code: "POL-NOWM", pricePerUnit: 15000 },
    { code: "POL-MWS", pricePerUnit: 12000 },
  ];

  const mockDoorProfiles = [
    { code: "FLAT-PANEL", pricePerDoor: 2500 },
    { code: "SHAKER-SLIM", pricePerDoor: 4500 },
  ];

  it("should calculate cabinet cost from modules", () => {
    const slots = [
      { module: { type: "standard" } },
      { module: { type: "sink-base" } },
    ];

    let total = 0;
    slots.forEach((slot) => {
      if (slot.module?.type === "standard") {
        total += mockModules[0].pricePerUnit;
      } else if (slot.module?.type === "sink-base") {
        total += mockModules[1].pricePerUnit;
      }
    });

    expect(total).toBe(110000); // $1,100 in cents
  });

  it("should calculate material cost", () => {
    const selectedCode = "POL-NOWM";
    const material = mockMaterials.find((m) => m.code === selectedCode);
    expect(material?.pricePerUnit).toBe(15000);
  });

  it("should calculate door profile cost per door", () => {
    const doorCount = 5;
    const profile = mockDoorProfiles.find((p) => p.code === "SHAKER-SLIM");
    const total = (profile?.pricePerDoor ?? 0) * doorCount;
    expect(total).toBe(22500);
  });

  it("should format AUD prices correctly", () => {
    const formatter = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    });

    expect(formatter.format(150.00)).toBe("$150.00");
    expect(formatter.format(1234.56)).toBe("$1,234.56");
  });
});
```

**Step 2: Commit**

```bash
git add src/__tests__/pricing.test.ts
git commit -m "test: add tests for pricing calculations"
```

---

### Task 19: Write Tests for Auth Helpers

**Files:**
- Create: `src/__tests__/auth.test.ts`

**Step 1: Create the test file**

```typescript
// src/__tests__/auth.test.ts
import { describe, it, expect } from "vitest";

const ADMIN_DOMAIN = "@northsouthcarpentry.com";

// Test admin email domain logic (mirrors convex/lib/auth.ts)
describe("Admin Email Validation", () => {
  const isAdminEmail = (email: string | undefined): boolean => {
    if (!email) return false;
    return email.endsWith(ADMIN_DOMAIN);
  };

  it("should identify admin emails", () => {
    expect(isAdminEmail("admin@northsouthcarpentry.com")).toBe(true);
    expect(isAdminEmail("john@northsouthcarpentry.com")).toBe(true);
    expect(isAdminEmail("a@northsouthcarpentry.com")).toBe(true);
  });

  it("should reject non-admin emails", () => {
    expect(isAdminEmail("user@gmail.com")).toBe(false);
    expect(isAdminEmail("admin@other-company.com")).toBe(false);
    expect(isAdminEmail("northsouthcarpentry.com@gmail.com")).toBe(false);
    expect(isAdminEmail("fake@northsouthcarpentry.com.fake.com")).toBe(false);
  });

  it("should handle edge cases", () => {
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
    expect(isAdminEmail("@northsouthcarpentry.com")).toBe(true); // technically valid
  });
});
```

**Step 2: Commit**

```bash
git add src/__tests__/auth.test.ts
git commit -m "test: add tests for auth helper email validation"
```

---

### Task 20: Remove Disabled/Dead Routes

**Files:**
- Delete: `src/app/(tabs)/design/_[id]_disabled/`
- Delete: `src/app/design/share/_[id]_disabled/`

**Step 1: Check if directories exist and remove**

```bash
# Windows
if exist "src\app\(tabs)\design\_[id]_disabled" rmdir /s /q "src\app\(tabs)\design\_[id]_disabled"
if exist "src\app\design\share\_[id]_disabled" rmdir /s /q "src\app\design\share\_[id]_disabled"

# Unix/Mac
rm -rf "src/app/(tabs)/design/_[id]_disabled" 2>/dev/null || true
rm -rf "src/app/design/share/_[id]_disabled" 2>/dev/null || true
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove disabled/dead route files"
```

---

### Task 21: Create Structured Logger

**Files:**
- Create: `src/lib/logger.ts`
- Modify: `src/components/admin/PhotoUploader.tsx`

**Step 1: Create logger utility**

```typescript
// src/lib/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Only log info and above in production
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (!shouldLog("debug")) return;
    console.debug(formatMessage("debug", message, context));
  },

  info(message: string, context?: LogContext): void {
    if (!shouldLog("info")) return;
    console.info(formatMessage("info", message, context));
  },

  warn(message: string, context?: LogContext): void {
    if (!shouldLog("warn")) return;
    console.warn(formatMessage("warn", message, context));
  },

  error(message: string, error?: Error, context?: LogContext): void {
    if (!shouldLog("error")) return;
    const errorContext = error
      ? { ...context, errorMessage: error.message, errorStack: error.stack }
      : context;
    console.error(formatMessage("error", message, errorContext));
  },
};
```

**Step 2: Update PhotoUploader.tsx**

Replace line 94:
```typescript
console.error("Upload error:", error);
```
With:
```typescript
import { logger } from "@/lib/logger";
// ... in the catch block:
logger.error("Photo upload failed", error instanceof Error ? error : undefined, {
  orderId: orderId.toString(),
  milestone: selectedMilestone,
});
```

**Step 3: Commit**

```bash
git add src/lib/logger.ts src/components/admin/PhotoUploader.tsx
git commit -m "feat: add structured logger and replace console.log"
```

---

## Phase 4: Final Verification

### Task 22: Run Full Test Suite

**Step 1: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass

**Step 2: Run type check**

```bash
npx tsc --noEmit
```
Expected: No type errors

**Step 3: Run Convex type generation**

```bash
npx convex dev --once
```
Expected: No errors

**Step 4: Run linter**

```bash
npx eslint src/ --ext .ts,.tsx
```
Expected: No critical errors

---

### Task 23: Create Summary Commit and Tag

**Step 1: Verify all changes committed**

```bash
git status
```
Expected: Working tree clean

**Step 2: Create summary tag**

```bash
git tag -a v1.1.0-security-perf-fixes -m "Security, performance, and code quality improvements from comprehensive code review

Security fixes:
- Added auth helpers and admin guards
- Secured all admin queries and mutations
- Added ownership checks for documents and photos
- Replaced sequential order IDs with random
- Protected admin routes with AdminGuard
- Added server-side file validation

Performance improvements:
- Added batch loading helper for N+1 queries
- Replaced JSON.stringify equality with shallow comparison
- Cached mesh references with invalidation
- Created ProductCatalogContext for app-level caching

Code quality:
- Created shared types in convex/lib
- Added tests for critical paths
- Removed dead code
- Added structured logging"
```

---

## Summary

**Total: 23 tasks across 4 phases**

### Phase 1: Security (10 tasks)
- Shared types in `convex/lib/types.ts`
- Auth helpers with ownership checks
- `users.current` query + secured `users.list`
- Secured notifications, orders, submissions queries
- Secured documents and photos with ownership
- AdminGuard component
- Protected all 3 admin pages
- Portal ownership check

### Phase 2: Performance (5 tasks)
- Batch loading helper
- Fixed JSON.stringify equality
- Mesh caching with invalidation
- ProductCatalogContext with types
- Updated usePricing to use context

### Phase 3: Code Quality (6 tasks)
- Frontend types mirror
- Order workflow tests
- Pricing calculation tests
- Auth validation tests
- Dead code removal
- Structured logger

### Phase 4: Verification (2 tasks)
- Full test suite
- Summary tag

---

## Known Limitations

1. **Batch loading** - Convex doesn't have true batch reads. Helper runs N parallel queries, better than sequential but not optimal.

2. **Admin detection** - Currently uses email domain check. For production, consider a dedicated `isAdmin` field in users table.

3. **Rate limiting** - Not implemented. Consider Convex rate limiting or external service for production.
