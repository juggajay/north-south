# Phase 07: Customer Portal & Notifications - Research

**Researched:** 2026-02-05
**Domain:** Customer experience, email notifications, order tracking, QR panel lookup
**Confidence:** HIGH

## Summary

This phase implements the post-purchase customer experience: order status visibility through a vertical timeline, document access (quotes and invoices), QR panel lookup for installers, email notifications at 6 key milestones, production photo gallery, chat/support access, and referral program tracking.

The standard approach uses the **Convex Resend Component** (`@convex-dev/resend`) for reliable email delivery with built-in queueing, batching, idempotency, and rate limiting. Email templates use **React Email** (`@react-email/components`) for type-safe, plaintext-friendly templates per the CONTEXT.md decision for text-only emails. The customer portal extends the existing Orders tab with expanded sections, while QR lookup uses a public (no-auth) route.

**Primary recommendation:** Use the official Convex Resend Component with React Email templates for notifications. Build the order timeline as a custom vertical stepper component (per existing wizard StepIndicator patterns) rather than importing a heavy third-party library.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @convex-dev/resend | latest | Email delivery from Convex | Official component with queueing, batching, idempotency |
| @react-email/components | latest | Email template building | Type-safe React templates, plaintext conversion |
| @react-email/render | latest | Template rendering | Convert React to HTML + plaintext |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icons | Already installed, use for timeline icons |
| framer-motion | 12.30.1 | Animations | Already installed, subtle timeline animations |
| next-qrcode | 2.5.1 | QR generation (optional) | Only if generating QRs client-side |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @convex-dev/resend | Resend SDK directly | Lose queueing, idempotency, rate limiting |
| Custom timeline | MUI Stepper | Heavy dependency for simple vertical list |
| react-vertical-timeline-component | Custom component | Unnecessary dependency, less control |

**Installation:**
```bash
npm install @convex-dev/resend @react-email/components @react-email/render
```

## Architecture Patterns

### Recommended Project Structure
```
convex/
├── notifications.ts         # Email sending actions
├── notifications/
│   ├── templates/           # React Email templates
│   │   ├── OrderConfirmed.tsx
│   │   ├── ProductionStarted.tsx
│   │   ├── QCComplete.tsx
│   │   ├── ReadyToShip.tsx
│   │   ├── Delivered.tsx
│   │   └── PostInstall.tsx
│   └── sendEmail.ts         # Unified send function
├── orders.ts                # Order CRUD, status updates
├── documents.ts             # Document management (quotes, invoices)
├── referrals.ts             # Referral program mutations/queries
└── convex.config.ts         # Add resend component

src/
├── app/
│   ├── (tabs)/orders/page.tsx      # Enhanced portal (existing)
│   ├── panel/[qrCode]/page.tsx     # Public QR lookup (new)
│   └── portal/                     # Customer portal sections
│       ├── [orderId]/
│       │   ├── page.tsx            # Order detail with timeline
│       │   ├── documents/page.tsx  # Documents section
│       │   └── photos/page.tsx     # Production photos
│       └── referrals/page.tsx      # Referral tracking
├── components/
│   └── portal/
│       ├── OrderTimeline.tsx       # Vertical stepper timeline
│       ├── TimelineStep.tsx        # Individual step component
│       ├── DocumentList.tsx        # Document section
│       ├── ProductionGallery.tsx   # Photo gallery
│       ├── PanelCard.tsx           # QR lookup result card
│       └── ReferralTracker.tsx     # Referral status display
```

### Pattern 1: Convex Resend Component Setup
**What:** Initialize and configure email sending with official component
**When to use:** All email notifications in this phase
**Example:**
```typescript
// convex/convex.config.ts
// Source: https://www.convex.dev/components/resend
import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp();
app.use(resend);
export default app;

// convex/notifications/sendEmail.ts
import { components } from "../_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "../_generated/server";

// Initialize with test mode disabled for production
export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

export const sendOrderConfirmed = internalMutation({
  args: { orderId: v.id("orders"), to: v.string() },
  handler: async (ctx, { orderId, to }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    await resend.sendEmail(ctx, {
      from: "North South Carpentry <orders@northsouthcarpentry.com>",
      to,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: renderOrderConfirmedEmail(order),
      text: renderOrderConfirmedText(order), // Plaintext version
    });
  },
});
```

### Pattern 2: React Email Text-Only Templates
**What:** Create simple, text-focused email templates per CONTEXT.md
**When to use:** All 6 notification triggers
**Example:**
```typescript
// convex/notifications/templates/OrderConfirmed.tsx
"use node";
import { render } from "@react-email/render";
import { Html, Text, Link, Container, Section } from "@react-email/components";

interface OrderConfirmedProps {
  orderNumber: string;
  customerName: string;
  portalUrl: string;
}

export function OrderConfirmedEmail({ orderNumber, customerName, portalUrl }: OrderConfirmedProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Thanks for your order ({orderNumber}). We've received your deposit
            and your panels are scheduled for production.
          </Text>
          <Text>
            <Link href={portalUrl}>Track your order</Link>
          </Text>
          <Text>
            Cheers,
            North South Carpentry
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

// Render both HTML and plaintext
export async function renderOrderConfirmed(props: OrderConfirmedProps) {
  const html = await render(<OrderConfirmedEmail {...props} />);
  const text = await render(<OrderConfirmedEmail {...props} />, { plainText: true });
  return { html, text };
}
```

### Pattern 3: Order Timeline Vertical Stepper
**What:** Custom vertical timeline following existing wizard patterns
**When to use:** Order status display in portal
**Example:**
```typescript
// src/components/portal/OrderTimeline.tsx
// Based on existing src/components/wizard/StepIndicator.tsx pattern
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const ORDER_STEPS = [
  { id: "confirmed", name: "Order Confirmed", icon: Check },
  { id: "production", name: "In Production", icon: Circle },
  { id: "qc", name: "QC Complete", icon: Circle },
  { id: "ready_to_ship", name: "Ready to Ship", icon: Circle },
  { id: "shipped", name: "Shipped", icon: Circle },
  { id: "delivered", name: "Delivered", icon: Circle },
  { id: "complete", name: "Complete", icon: Circle },
];

interface OrderTimelineProps {
  currentStatus: string;
  timeline: {
    confirmed?: number;
    productionStart?: number;
    qcComplete?: number;
    shipped?: number;
    delivered?: number;
    installed?: number;
  };
}

export function OrderTimeline({ currentStatus, timeline }: OrderTimelineProps) {
  const currentIndex = ORDER_STEPS.findIndex(s => s.id === currentStatus);

  return (
    <div className="flex flex-col space-y-0">
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const timestamp = getTimestampForStep(step.id, timeline);

        return (
          <TimelineStep
            key={step.id}
            step={step}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
            timestamp={timestamp}
            isLast={index === ORDER_STEPS.length - 1}
          />
        );
      })}
    </div>
  );
}
```

### Pattern 4: Public QR Panel Lookup (No Auth)
**What:** Unauthenticated route for panel information
**When to use:** Installers, family members scanning QR codes
**Example:**
```typescript
// src/app/panel/[qrCode]/page.tsx
// Public route - no auth required per CONTEXT.md
import { api } from "../../../../convex/_generated/api";
import { PanelCard } from "@/components/portal/PanelCard";

// This page is public - no useConvexAuth wrapper
export default function PanelLookupPage({ params }: { params: { qrCode: string } }) {
  // Use server-side fetch or client-side query without auth
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <PanelLookup qrCode={params.qrCode} />
    </div>
  );
}

// convex/panels.ts
export const lookupByQrCode = query({
  args: { qrCode: v.string() },
  // No auth check - public access
  handler: async (ctx, { qrCode }) => {
    const panel = await ctx.db
      .query("panelQrCodes")
      .withIndex("by_qrCode", (q) => q.eq("qrCode", qrCode))
      .first();

    if (!panel) return null;

    // Return only basic info per CONTEXT.md
    return {
      panelName: panel.moduleInfo?.name,
      dimensions: panel.moduleInfo?.dimensions,
      material: panel.moduleInfo?.material,
      finish: panel.moduleInfo?.finish,
    };
  },
});
```

### Pattern 5: Document Download (No Preview)
**What:** Download-only document access per CONTEXT.md
**When to use:** Quote and Invoice documents
**Example:**
```typescript
// src/components/portal/DocumentList.tsx
import { Download } from "lucide-react";

interface Document {
  _id: string;
  type: "quote" | "invoice";
  version: number;
  fileName: string;
  storageId: string;
  createdAt: number;
}

export function DocumentList({ documents }: { documents: Document[] }) {
  // Group by type per CONTEXT.md: "separate sections for Quotes and Invoices"
  const quotes = documents.filter(d => d.type === "quote");
  const invoices = documents.filter(d => d.type === "invoice");

  return (
    <div className="space-y-6">
      <DocumentSection title="Quotes" documents={quotes} />
      <DocumentSection title="Invoices" documents={invoices} />
    </div>
  );
}

function DocumentItem({ doc }: { doc: Document }) {
  const handleDownload = async () => {
    // Get download URL from Convex storage
    const url = await getDownloadUrl(doc.storageId);
    // Trigger browser download
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.fileName;
    link.click();
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-zinc-50"
    >
      <div>
        <p className="font-medium">{doc.fileName}</p>
        <p className="text-sm text-zinc-500">
          Version {doc.version} - {new Date(doc.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Download className="w-5 h-5 text-zinc-400" />
    </button>
  );
}
```

### Anti-Patterns to Avoid
- **Heavy timeline libraries:** Don't import MUI or similar just for a vertical list
- **Embedded image emails:** CONTEXT.md specifies "text only - no embedded images"
- **Preview modals for PDFs:** CONTEXT.md specifies "download only"
- **Auth on QR lookup:** Must be public for installer convenience
- **Complex email designs:** Keep brief (2-3 sentences) per decisions

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery | Direct Resend SDK | @convex-dev/resend component | Queueing, batching, idempotency, rate limiting built-in |
| Email templates | HTML strings | @react-email/components | Type-safe, responsive, plaintext conversion |
| Plaintext emails | Manual text extraction | @react-email/render with plainText option | Handles conversion correctly |
| Scheduled emails | setTimeout/cron | Convex scheduled functions | Durable, survives server restarts |
| File download URLs | Hardcoded paths | storage.getUrl() | Handles auth, expiration automatically |

**Key insight:** The Convex Resend component handles the hard parts of email delivery (retries, rate limits, idempotency) that would take significant effort to build correctly from scratch.

## Common Pitfalls

### Pitfall 1: Forgetting Test Mode Disable
**What goes wrong:** Emails only go to @resend.dev addresses in production
**Why it happens:** testMode defaults to true in @convex-dev/resend
**How to avoid:** Explicitly set `testMode: false` in production config
**Warning signs:** "Email sent successfully" but customer never receives it

### Pitfall 2: Missing Plaintext Version
**What goes wrong:** Email marked as spam or unreadable on some clients
**Why it happens:** Only providing HTML, not text alternative
**How to avoid:** Always render both HTML and plaintext with React Email
**Warning signs:** Low open rates, spam folder complaints

### Pitfall 3: Email Tone Mismatch
**What goes wrong:** Emails feel corporate or overly casual
**Why it happens:** Not following the "professional but approachable, tradesperson authenticity" tone from CONTEXT.md
**How to avoid:** Review each template against tone guidelines, use "Cheers" not "Best regards"
**Warning signs:** Customer feedback about impersonal communication

### Pitfall 4: Blocking UI on Email Send
**What goes wrong:** Status update takes 3+ seconds while email sends
**Why it happens:** Awaiting email send in the same transaction as status update
**How to avoid:** Status update returns immediately, email sends via scheduled function
**Warning signs:** Slow status transitions, timeout errors

### Pitfall 5: Auth Required on QR Lookup
**What goes wrong:** Installers can't scan panels without customer login
**Why it happens:** Adding auth wrapper by default
**How to avoid:** Explicitly make /panel/[qrCode] route public
**Warning signs:** "Login required" when scanning a panel

### Pitfall 6: Hardcoding Email Content
**What goes wrong:** Can't update email copy without deploy
**Why it happens:** Inline strings in code instead of templates
**How to avoid:** Use React Email components with props for all variable content
**Warning signs:** Simple typo fix requires full deployment

## Code Examples

Verified patterns from official sources:

### Convex HTTP Endpoint for Resend Webhooks
```typescript
// convex/http.ts
// Source: https://github.com/get-convex/resend
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { resend } from "./notifications/sendEmail";

const http = httpRouter();

// Existing routes...

// Resend webhook endpoint
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;
```

### Trigger Email on Status Change
```typescript
// convex/orders.ts
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, { orderId, status }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    // Update status
    await ctx.db.patch(orderId, {
      status,
      timeline: {
        ...order.timeline,
        [getTimelineField(status)]: Date.now(),
      },
    });

    // Get customer email
    const submission = await ctx.db.get(order.submissionId);
    if (!submission) return;

    // Schedule email notification (non-blocking)
    const notificationType = getNotificationType(status);
    if (notificationType) {
      await ctx.scheduler.runAfter(0, internal.notifications.send, {
        orderId,
        type: notificationType,
        to: submission.email,
      });
    }

    return order;
  },
});

function getNotificationType(status: string): string | null {
  const mapping: Record<string, string> = {
    confirmed: "order_confirmed",
    production: "production_started",
    qc: "qc_complete",
    ready_to_ship: "ready_to_ship",
    delivered: "delivered",
  };
  return mapping[status] || null;
}
```

### Post-Install Email with Review CTA
```typescript
// convex/notifications/templates/PostInstall.tsx
"use node";
import { render } from "@react-email/render";
import { Html, Text, Link, Container, Section, Button } from "@react-email/components";

interface PostInstallProps {
  customerName: string;
  googleReviewUrl: string;
  referralUrl: string;
}

export function PostInstallEmail({ customerName, googleReviewUrl, referralUrl }: PostInstallProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Hope your new panels are looking great! It's been a week since installation
            and we'd love to hear how everything's going.
          </Text>
          <Text>
            If you're happy with the work, a quick review helps other homeowners
            find quality cabinet makers:
          </Text>
          {/* Clear CTA per CONTEXT.md - "not buried" */}
          <Button href={googleReviewUrl} style={{ backgroundColor: "#18181b", color: "#fff", padding: "12px 24px" }}>
            Leave a Review
          </Button>
          <Text>
            Know someone planning a kitchen? Share your referral link: {referralUrl}
          </Text>
          <Text>
            Cheers,
            North South Carpentry
          </Text>
        </Section>
      </Container>
    </Html>
  );
}
```

### Referral Tracking Query
```typescript
// convex/referrals.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMyReferrals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get user ID from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) return [];

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrerId", (q) => q.eq("referrerId", user._id))
      .collect();

    return referrals.map((r) => ({
      email: maskEmail(r.referredEmail), // Privacy: show partial email
      status: r.status,
      rewardAmount: r.rewardAmount,
      createdAt: r.createdAt,
    }));
  },
});

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const masked = local.charAt(0) + "***" + local.charAt(local.length - 1);
  return `${masked}@${domain}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct SMTP/SES | Managed email APIs (Resend, Postmark) | 2023 | Simpler setup, better deliverability |
| HTML string templates | React Email components | 2023 | Type-safe, responsive, maintainable |
| Manual retries | Component-level queueing | 2024 | Reliability without custom infrastructure |
| render(template, { plainText: true }) | toPlainText(html) utility | @react-email/render 1.2.0 | Cleaner API for plaintext |

**Deprecated/outdated:**
- `plainText: true` option in render function: Use `toPlainText()` utility instead
- ResendOTP provider for magic links: Use @auth/core Resend provider (per STATE.md)

## Open Questions

Things that couldn't be fully resolved:

1. **Post-install email timing**
   - What we know: Should be sent 7 days after delivered status
   - What's unclear: Should this use Convex cron or scheduled function?
   - Recommendation: Use `scheduler.runAt()` with calculated timestamp when delivered status is set

2. **Document storage structure**
   - What we know: Need quotes and invoices with version history
   - What's unclear: Are documents uploaded via admin (Phase 08) or generated?
   - Recommendation: Create documents table now, populate in Phase 08

3. **Referral reward logic**
   - What we know: Schema exists with status and rewardAmount
   - What's unclear: What triggers "rewarded" status? Manual or automatic?
   - Recommendation: Keep manual for MVP, add automation later

## Sources

### Primary (HIGH confidence)
- [Convex Resend Component](https://www.convex.dev/components/resend) - Installation, API, webhooks
- [GitHub get-convex/resend](https://github.com/get-convex/resend) - README with full examples
- [Resend + Next.js Docs](https://resend.com/docs/send-with-nextjs) - Official integration guide
- [React Email Render](https://react.email/docs/utilities/render) - Plaintext rendering

### Secondary (MEDIUM confidence)
- [Stack Convex Resend Article](https://stack.convex.dev/convex-resend) - Component announcement
- [DEV.to React Email + Convex](https://dev.to/brentarcane/using-react-email-with-the-convex-resend-component-3he4) - Integration patterns
- [Convex File Storage Docs](https://docs.convex.dev/file-storage/serve-files) - Download URL generation
- [Convex Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions) - Background jobs

### Tertiary (LOW confidence)
- [MUI Stepper](https://mui.com/material-ui/react-stepper/) - Reference only, not using
- [react-vertical-timeline-component](https://www.npmjs.com/package/react-vertical-timeline-component) - Considered, not recommended

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Convex component with documentation
- Architecture: HIGH - Follows existing codebase patterns
- Pitfalls: MEDIUM - Based on common patterns, some project-specific
- Email templates: HIGH - React Email is well-documented

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable domain)
