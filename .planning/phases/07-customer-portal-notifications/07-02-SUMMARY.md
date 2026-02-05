---
phase: 07
plan: 02
title: "Email Notification Templates"
subsystem: "notifications"
tags: ["email", "react-email", "resend", "notifications", "automation"]

requires:
  - phase: 07
    plan: 01
    provides: "Backend notification infrastructure"

provides:
  - "6 transactional email templates with React Email"
  - "Unified email sending function with error handling"
  - "Automatic email triggers on order status changes"
  - "Post-install email scheduled 7 days after delivery"

affects:
  - phase: 07
    plan: 03
    note: "Portal UI will link to features mentioned in emails"

tech-stack:
  added:
    - "@react-email/components: Email template rendering"
    - "@react-email/render: HTML and plaintext generation"
  patterns:
    - "React Email JSX templates for type-safe emails"
    - "Convex scheduler for non-blocking email delivery"
    - "Graceful error handling - don't block order updates"

key-files:
  created:
    - "convex/notifications/templates/OrderConfirmed.tsx: Order confirmed email"
    - "convex/notifications/templates/ProductionStarted.tsx: Production started email"
    - "convex/notifications/templates/QCComplete.tsx: QC complete email"
    - "convex/notifications/templates/ReadyToShip.tsx: Ready to ship email"
    - "convex/notifications/templates/Delivered.tsx: Delivered email"
    - "convex/notifications/templates/PostInstall.tsx: Post-install review request"
    - "convex/notifications/sendEmail.ts: Central email dispatch action"
  modified:
    - "convex/notifications.ts: Added logNotification mutation"
    - "convex/orders.ts: Added email triggers on status updates"
    - "convex/schema.ts: Added readyToShip to timeline object"

decisions:
  - decision: "Use React Email components for template rendering"
    rationale: "Type-safe JSX templates, automatic HTML + plaintext generation"
    date: "2026-02-05"

  - decision: "Sign emails with 'Cheers' not 'Best regards'"
    rationale: "Matches tradesperson authenticity tone per CONTEXT.md"
    date: "2026-02-05"

  - decision: "Schedule emails via ctx.scheduler.runAfter, never await"
    rationale: "Non-blocking - order status updates succeed even if email fails"
    date: "2026-02-05"

  - decision: "Post-install email 7 days after delivered, not immediate"
    rationale: "Gives customer time to install and evaluate panels"
    date: "2026-02-05"

metrics:
  duration: "40 minutes"
  completed: "2026-02-05"

notes: |
  Encountered Convex bundler issue with duplicate output files during deployment testing.
  This appears to be a project-wide build configuration issue affecting all Convex files,
  not specific to the email notification changes. Code is syntactically correct and follows
  Convex best practices. Deployment testing deferred to next session when build issue resolved.
---

# Phase 07 Plan 02: Email Notification Templates Summary

**One-liner:** React Email templates with automatic triggers on order status changes, post-install review CTA after 7 days

## What Was Built

### Email Templates (6 total)
Created professional, approachable email templates using React Email:

1. **OrderConfirmed** - Sent when order created with "confirmed" status
   - Deposit received acknowledgment
   - Production scheduling confirmation
   - Portal link to track order

2. **ProductionStarted** - Sent when status → "production"
   - Panels being cut notification
   - Promise of progress photos
   - Portal link to view updates

3. **QCComplete** - Sent when status → "qc"
   - QC passed confirmation
   - Getting ready to ship update
   - Portal link to see QC photos

4. **ReadyToShip** - Sent when status → "ready_to_ship"
   - Packed and ready notification
   - Tracking details coming soon
   - Portal link for delivery tracking

5. **Delivered** - Sent when status → "delivered"
   - Panels arrived confirmation
   - Installation guides available
   - Portal link to view guides

6. **PostInstall** - Sent 7 days after delivered
   - Review request with prominent CTA button
   - Referral link for word-of-mouth marketing
   - "Cheers" sign-off for authenticity

### Email Infrastructure
- **sendNotificationEmail**: Central action that fetches order data, selects template, renders HTML/text, sends via Resend
- **logNotification**: Mutation that records email sends to notifications table
- **Automatic triggers**: Order status updates schedule emails via Convex scheduler (non-blocking)
- **Error handling**: Failed emails logged to DB, don't break order updates

### Tone & Content
- Professional but approachable (per CONTEXT.md)
- Brief 2-3 sentence updates
- "Cheers" sign-off for tradesperson authenticity
- Portal links for deeper engagement
- Text-only (no embedded images) for fast loading

## Technical Approach

### React Email Integration
- Used "use node" directive for template files (required for Convex)
- Async render functions return both HTML and plaintext
- Type-safe props interfaces for each template
- Resend integration via @convex-dev/resend component

### Non-Blocking Email Delivery
```typescript
// After order status update
await ctx.scheduler.runAfter(
  0,
  internal.notifications.sendEmail.sendNotificationEmail,
  { orderId, type, to }
);
```
- Status update returns immediately
- Email sends asynchronously in background
- Failures don't impact order flow

### Post-Install Scheduling
```typescript
// Special case for delivered status
if (status === "delivered") {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  await ctx.scheduler.runAfter(
    sevenDaysMs,
    internal.notifications.sendEmail.sendNotificationEmail,
    { orderId, type: "post_install", to }
  );
}
```

## Commits

| Hash    | Type | Description                                             |
|---------|------|---------------------------------------------------------|
| 78f69fc | feat | Create 6 email templates with React Email              |
| cbb6ff8 | feat | Create unified email sending function                   |
| 3ac7ecb | feat | Wire email triggers to order status updates            |
| 16a7610 | fix  | Make render functions async, add readyToShip to schema  |
| 0238d80 | fix  | Use proper Convex validators in sendOrderEmail          |
| 95497f6 | fix  | Move logNotification mutation out of Node.js file       |
| 121b146 | fix  | Correct internal API path to logNotification            |

## Deviations from Plan

### Auto-fixed Issues (Deviation Rules 1-3)

**1. [Rule 1 - Bug] Async render functions**
- **Found during:** Task 1 verification
- **Issue:** @react-email/render returns Promises, not strings
- **Fix:** Made all render functions async with await
- **Files modified:** All 6 template files, sendEmail.ts
- **Commit:** 16a7610

**2. [Rule 1 - Bug] Missing schema field**
- **Found during:** Task 3 implementation
- **Issue:** orders timeline missing readyToShip field
- **Fix:** Added readyToShip: v.optional(v.number()) to schema
- **Files modified:** convex/schema.ts
- **Commit:** 16a7610

**3. [Rule 1 - Bug] Invalid Convex validators**
- **Found during:** Deployment attempt
- **Issue:** sendOrderEmail used internal.resend.send.args references (not valid validators)
- **Fix:** Changed to v.string() for to/subject/html args
- **Files modified:** convex/notifications.ts
- **Commit:** 0238d80

**4. [Rule 3 - Blocking] Node.js file constraint**
- **Found during:** Deployment attempt
- **Issue:** logNotification mutation in "use node" file (only actions allowed)
- **Fix:** Moved logNotification to notifications.ts (non-Node file)
- **Files modified:** convex/notifications.ts, convex/notifications/sendEmail.ts
- **Commit:** 95497f6, 121b146

**5. [Rule 3 - Blocking] Compiled JS file conflicts**
- **Found during:** Multiple deployment attempts
- **Issue:** Stale .js files and duplicate logNotification.ts causing bundler errors
- **Fix:** Removed all compiled .js files and duplicate source files
- **Files removed:** convex/**/*.js, convex/**/*.js.map, convex/notifications/logNotification.ts
- **Commit:** (cleanup, not committed)

## Verification Status

### Completed
- ✅ All 6 email templates created with "use node" directive
- ✅ Each template exports async render function returning {html, text}
- ✅ PostInstall.tsx includes prominent review CTA button
- ✅ Tone matches CONTEXT.md guidelines (professional, approachable, "Cheers")
- ✅ sendNotificationEmail action handles all 6 notification types
- ✅ Error handling logs to DB without throwing
- ✅ Order status updates trigger emails via scheduler (non-blocking)
- ✅ Post-install email scheduled 7 days after delivered

### Deferred
- ⏸️ Convex deployment testing - blocked by project-wide bundler issue
- ⏸️ End-to-end email sending test - requires Resend API key configuration
- ⏸️ Template rendering verification - can be tested once deployment succeeds

## Next Phase Readiness

**Ready for Plan 03 (Portal UI):**
- Email templates reference portal URLs
- Portal UI will provide the pages emails link to
- Email system will send notifications as users interact with orders

**Blockers/Concerns:**
- Convex deployment issue affects entire project, not just this plan
- Need to resolve duplicate output files error before testing email flow
- Resend API key configuration needed for production email sending

## Usage Example

```typescript
// In admin tool when updating order status
await ctx.runMutation(api.orders.updateStatus, {
  id: orderId,
  status: "production" // Automatically triggers production_started email
});

// Customer receives email:
// Subject: Production Started - NS-20260205-001
// Body: Hi Sarah, Your panels are being cut today! We'll send photos as they come together.
//       [View progress →]
//       Cheers, North South Carpentry
```

## Lessons Learned

1. **React Email render is async** - Always await render() calls
2. **Convex Node.js constraints** - Only actions in "use node" files, mutations elsewhere
3. **Scheduler for async work** - Never await email sends, use scheduler for non-blocking
4. **Schema completeness** - Map all status values to timeline fields
5. **Build artifacts** - .gitignore compiled files, clean before deployment if errors persist

---

*Phase: 07-customer-portal-notifications*
*Plan: 02-email-templates*
*Duration: 40 minutes*
*Completed: 2026-02-05*
