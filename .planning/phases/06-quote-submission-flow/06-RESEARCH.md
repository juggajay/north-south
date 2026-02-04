# Phase 06: Quote Submission Flow - Research

**Researched:** 2026-02-04
**Domain:** Form submission flows, internal queue dashboards, Convex mutations, React Hook Form
**Confidence:** HIGH

## Summary

This phase implements a multi-step submission flow that captures customer intent after design completion, stores submissions in Convex, and provides an internal dashboard for the team to review and process quote requests. The research focuses on form patterns, authenticated user prefill, real-time queue management, and confirmation flow UX.

The standard approach uses React Hook Form with Zod validation for type-safe form handling, Convex mutations for real-time data persistence, Sonner for toast notifications, and shadcn/ui components for consistent UI. The codebase already has these libraries installed and patterns established, making this primarily an implementation task rather than architectural decisions.

Key technical constraints from CONTEXT.md: User is already authenticated (leverage existing auth), design is already auto-saved (no draft logic needed), minimal submission friction (pre-fill name/email automatically), simple 3-step status workflow (New → In Review → Quoted), and FIFO queue sorting by default.

**Primary recommendation:** Use existing React Hook Form + Zod patterns from codebase, leverage Convex's real-time subscriptions for queue updates, pre-fill form with authenticated user data from `useAuth()` hook, implement optimistic UI for instant feedback, and use TanStack Table (if needed) or simple shadcn/ui table for internal dashboard.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.71.1 | Form state management | Industry standard (2026), minimal re-renders, excellent DX |
| zod | 4.3.6 | Schema validation | TypeScript-first validation, type inference, runtime safety |
| @hookform/resolvers | 5.2.2 | Zod integration with RHF | Official bridge between Zod schemas and RHF |
| Convex | 1.31.7 | Backend mutations/queries | Real-time subscriptions, transactional mutations, type-safe |
| sonner | 2.0.7 | Toast notifications | Modern, lightweight, Shadcn/ui aligned (already in codebase) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.20 | Server state (optional) | If complex data fetching needed beyond Convex queries |
| lucide-react | 0.563.0 | Icons | Form feedback icons, status indicators |
| framer-motion | 12.30.1 | Animations | Optional confirmation screen transitions |
| shadcn/ui components | Latest | UI primitives | Form, Button, Input, Textarea, Switch, Card, Table |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form | Formik | RHF has better performance, less re-renders, smaller bundle |
| Zod | Yup | Zod has TypeScript inference, better DX, modern API |
| Sonner | React Toastify | Sonner is lighter, better shadcn/ui integration (already chosen) |
| TanStack Table | Custom table | TanStack is overkill for simple FIFO list, shadcn/ui table sufficient |

**Installation:**
```bash
# Already installed in package.json
npm install react-hook-form zod @hookform/resolvers sonner
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── submission/              # New submission flow components
│   │   ├── SubmissionForm.tsx   # Main form with pre-submit options
│   │   ├── PreSubmitOptions.tsx # Site measure, installation toggles
│   │   ├── ReviewSummary.tsx    # Final review before submit
│   │   ├── ConfirmationScreen.tsx # Success message + redirect
│   │   └── SubmissionSchema.ts  # Zod validation schema
│   ├── dashboard/               # Internal team dashboard
│   │   ├── SubmissionQueue.tsx  # Queue list/table
│   │   ├── SubmissionDetail.tsx # Full config breakdown
│   │   ├── StatusBadge.tsx      # Visual status indicators
│   │   └── InternalNotes.tsx    # Team-only notes field
│   └── ui/                      # Existing shadcn/ui components
├── hooks/
│   └── useAuth.ts               # Existing auth hook (provides user data)
└── convex/
    └── submissions.ts           # Existing submission mutations/queries
```

### Pattern 1: Authenticated User Pre-fill
**What:** Automatically populate form fields with authenticated user data from Convex
**When to use:** User is logged in (required for submission), reduce friction
**Example:**
```typescript
// Source: Existing codebase pattern + State Management in 2026 research
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function SubmissionForm() {
  const { user } = useAuth(); // Convex query returns user data

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      siteMeasure: false,
      installQuote: false,
      notes: "",
    },
  });

  // Form renders with pre-filled name/email from auth
}
```

### Pattern 2: Multi-Step Form with Review Screen
**What:** Collect options, show review summary, then final submit button
**When to use:** Reduce errors, give users confidence before irreversible action
**Example:**
```typescript
// Source: Multi-Step Form Navigation Best Practices 2026
import { useState } from "react";

function SubmissionFlow() {
  const [step, setStep] = useState<"options" | "review">("options");

  // Step 1: Pre-submit options (site measure, installation, notes)
  // Step 2: Review summary (config + options + notes visible)
  // Final action: Submit button triggers mutation

  return step === "options" ? (
    <PreSubmitOptions onNext={() => setStep("review")} />
  ) : (
    <ReviewSummary onBack={() => setStep("options")} onSubmit={handleSubmit} />
  );
}
```

### Pattern 3: Optimistic UI with Error Rollback
**What:** Instant UI feedback, show success immediately, handle errors gracefully
**When to use:** Form submissions, status updates, any user action with server roundtrip
**Example:**
```typescript
// Source: Convex mutations + Optimistic UI patterns 2026
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

function SubmissionForm() {
  const submitDesign = useMutation(api.submissions.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);

    try {
      const submissionId = await submitDesign({
        designId: currentDesignId,
        ...data,
      });

      // Success: Show confirmation + redirect after delay
      toast.success("Quote request submitted! We'll be in touch within 2-3 business days.");

      setTimeout(() => {
        router.push("/orders");
      }, 2500);

    } catch (error) {
      // Error: Rollback UI state, show error message
      toast.error(error instanceof Error ? error.message : "Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
      <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
        Submit for Quote
      </Button>
    </form>
  );
}
```

### Pattern 4: Real-Time Queue with Status Filtering
**What:** Internal dashboard subscribes to Convex queries, updates automatically when new submissions arrive
**When to use:** Team dashboard, any collaborative tool where multiple users need live data
**Example:**
```typescript
// Source: Convex real-time patterns + existing submissions.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function SubmissionQueue() {
  // Real-time subscription - updates automatically via WebSocket
  const submissions = useQuery(api.submissions.listPending);
  const updateStatus = useMutation(api.submissions.updateStatus);

  // FIFO sorting handled by Convex query (order by createdAt desc)
  // Displays: customer name, design thumbnail, price estimate, status

  const handleStatusChange = async (id: Id<"submissions">, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus });
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      {submissions?.map((submission) => (
        <SubmissionCard
          key={submission._id}
          submission={submission}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
```

### Pattern 5: Double-Submit Prevention
**What:** Disable submit button during submission, prevent duplicate requests
**When to use:** All form submissions, especially async operations
**Example:**
```typescript
// Source: Form submission race condition prevention patterns
function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SubmissionFormData) => {
    if (isSubmitting) return; // Guard clause

    setIsSubmitting(true);

    try {
      await submitMutation(data);
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false); // Always reset in finally block
    }
  };

  return (
    <Button
      type="submit"
      disabled={isSubmitting || !form.formState.isValid}
      loading={isSubmitting}
    >
      Submit for Quote
    </Button>
  );
}
```

### Anti-Patterns to Avoid
- **Using `value` instead of `defaultValue`:** React Hook Form uses uncontrolled inputs with `defaultValue`, not controlled `value` props
- **Forgetting form tag:** Must wrap in `<form>` tag for proper validation and submission handling
- **Not handling loading state in finally block:** Use try-finally to ensure loading state resets even on error
- **Calling setValue without validation:** By default setValue doesn't trigger validation, pass `{ shouldValidate: true }` option if needed
- **Reading form values with getValues in computed logic:** Use `watch()` for reactive computed values, not `getValues()`
- **No error boundary for mutation failures:** Always wrap async operations in try-catch, show user-friendly error messages

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Zod schemas + zodResolver | Type inference, runtime safety, 100+ built-in validators |
| Form state management | useState for every field | React Hook Form useForm | Performance (no re-renders), error handling, touched state |
| Toast notifications | Custom toast component | Sonner (already in codebase) | Stacking, auto-dismiss, promise support, accessibility |
| Date formatting | String concatenation | Date.now() + Intl.DateTimeFormat | Localization, timezone handling |
| Email validation | Regex patterns | Zod z.string().email() | RFC 5322 compliant, tested edge cases |
| Status workflow | Manual status strings | Union types + Zod enum | Type safety, validation, prevents typos |
| Double-submit prevention | Custom debounce logic | isSubmitting state + disabled button | Simpler, covers edge cases, no race conditions |
| Real-time updates | Polling with setInterval | Convex useQuery subscriptions | WebSocket-based, automatic, efficient |

**Key insight:** Form handling has edge cases (async validation, field dependencies, error states, accessibility) that take years to get right. React Hook Form + Zod is battle-tested across thousands of apps. Similarly, Convex's real-time subscriptions handle reconnection, conflict resolution, and consistency automatically.

## Common Pitfalls

### Pitfall 1: Default Values Set to `undefined`
**What goes wrong:** Form fields appear empty even when user data exists, validation fails unexpectedly
**Why it happens:** React Hook Form requires explicit defaultValues, `undefined` conflicts with controlled component state
**How to avoid:** Always provide default values, use empty string `""` for missing strings, `false` for booleans
**Warning signs:** Fields remain empty after user data loads, form validation fails on initial render
```typescript
// BAD
const form = useForm({
  defaultValues: {
    name: user?.name, // undefined if user not loaded yet
  }
});

// GOOD
const form = useForm({
  defaultValues: {
    name: user?.name ?? "", // Always defined, updates when user loads
  }
});
```

### Pitfall 2: Wrong Import for Form Component
**What goes wrong:** TypeScript errors, Form component doesn't work with useForm hook
**Why it happens:** IDEs auto-import `Form` from "react-hook-form" instead of shadcn/ui components
**How to avoid:** Always import `Form`, `FormField`, etc. from "@/components/ui/form"
**Warning signs:** Type errors about FormProvider, form validation doesn't work with shadcn/ui inputs
```typescript
// BAD
import { Form } from "react-hook-form"; // Wrong!

// GOOD
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
```

### Pitfall 3: Not Handling Convex Mutation Errors
**What goes wrong:** Errors are silent, user sees loading state forever, no feedback on failure
**Why it happens:** Mutations are async, unhandled promise rejections don't show in UI
**How to avoid:** Always wrap mutations in try-catch, show toast on error, reset loading state in finally
**Warning signs:** Button stays disabled after error, no error message shown, user confused about what happened
```typescript
// BAD
const handleSubmit = async (data) => {
  await submitMutation(data); // If this fails, user never knows
  toast.success("Submitted!");
};

// GOOD
const handleSubmit = async (data) => {
  try {
    await submitMutation(data);
    toast.success("Submitted!");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to submit");
  } finally {
    setIsSubmitting(false); // Always reset loading state
  }
};
```

### Pitfall 4: Race Condition on Auto-Redirect
**What goes wrong:** Redirect happens before user reads success message, or component unmounts mid-mutation
**Why it happens:** setTimeout runs even if component unmounts, async operations continue after navigation
**How to avoid:** Use 2-3 second delay for redirect, cleanup timeout on unmount, check component mounted before setState
**Warning signs:** Console errors about "can't set state on unmounted component", success message flashes too quickly
```typescript
// GOOD
useEffect(() => {
  if (submissionSuccess) {
    const timer = setTimeout(() => {
      router.push("/orders");
    }, 2500); // 2.5s to read message

    return () => clearTimeout(timer); // Cleanup on unmount
  }
}, [submissionSuccess, router]);
```

### Pitfall 5: Forgetting to Validate Status Transitions
**What goes wrong:** Invalid status values saved to database, broken workflow, UI shows incorrect states
**Why it happens:** Status is just a string, no runtime validation of allowed transitions
**How to avoid:** Use Zod enum for status, validate in mutation, define allowed transitions
**Warning signs:** Typos in status strings, invalid states in database, status badges break
```typescript
// In submissions.ts mutation - existing pattern validated
const validStatuses = ["pending", "quoted", "ordered", "rejected"];
if (!validStatuses.includes(status)) {
  throw new Error(`Invalid status: ${status}`);
}
```

### Pitfall 6: Not Pre-filling Contact Info from Auth
**What goes wrong:** User has to manually type name/email they already entered during registration
**Why it happens:** Forgetting to leverage existing authenticated user data
**How to avoid:** Use `useAuth()` hook to get current user, set as defaultValues in useForm
**Warning signs:** Form shows empty name/email fields for logged-in users, user complaints about redundant data entry
```typescript
// GOOD - leverage existing pattern
const { user } = useAuth();

const form = useForm({
  defaultValues: {
    name: user?.name ?? "",
    email: user?.email ?? "",
  },
});
```

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete Submission Form with Pre-fill
```typescript
// Source: Existing codebase patterns + React Hook Form 2026 best practices
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const submissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  siteMeasure: z.boolean(),
  installQuote: z.boolean(),
  notes: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  designId: string;
}

export function SubmissionForm({ designId }: SubmissionFormProps) {
  const { user } = useAuth(); // Get authenticated user
  const router = useRouter();
  const submitDesign = useMutation(api.submissions.create);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      siteMeasure: false,
      installQuote: false,
      notes: "",
    },
  });

  const handleSubmit = async (data: SubmissionFormData) => {
    try {
      await submitDesign({
        designId,
        ...data,
      });

      toast.success("Quote request submitted! We'll be in touch within 2-3 business days.");

      // Redirect to orders after 2.5s
      setTimeout(() => {
        router.push("/orders");
      }, 2500);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit. Please try again.");
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Pre-filled contact info */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pre-submit options */}
        <FormField
          control={form.control}
          name="siteMeasure"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel>Professional site measure</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Team will include pricing in your quote
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="installQuote"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel>Installation quote</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Team will include pricing in your quote
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Optional notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anything else we should know?</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Access issues, timeline, special requirements..."
                  disabled={isSubmitting}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || !form.formState.isValid}
          loading={isSubmitting}
        >
          Submit for Quote
        </Button>
      </form>
    </Form>
  );
}
```

### Internal Queue with Real-Time Updates
```typescript
// Source: Convex real-time patterns + existing submissions.ts queries
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SubmissionQueue() {
  // Real-time subscription - updates automatically when new submissions arrive
  const submissions = useQuery(api.submissions.listPending);
  const updateStatus = useMutation(api.submissions.updateStatus);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus });
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (submissions === undefined) {
    return <div>Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return <div>No pending submissions</div>;
  }

  // FIFO sorting by createdAt (handled in Convex query)
  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission._id} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{submission.name}</h3>
              <p className="text-sm text-muted-foreground">{submission.email}</p>

              <div className="mt-2 space-y-1 text-sm">
                <p>Site measure: {submission.siteMeasure ? "Yes" : "No"}</p>
                <p>Installation: {submission.installQuote ? "Yes" : "No"}</p>
                {submission.notes && (
                  <p className="text-muted-foreground">Notes: {submission.notes}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={submission.status === "pending" ? "default" : "secondary"}>
                {submission.status}
              </Badge>

              <Button
                size="sm"
                onClick={() => handleStatusChange(submission._id, "quoted")}
              >
                Mark as Quoted
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### Toast Notification Patterns
```typescript
// Source: Sonner documentation + existing codebase pattern
import { toast } from "sonner";

// Success with auto-dismiss
toast.success("Quote request submitted!");

// Error with longer duration
toast.error("Failed to submit. Please try again.", {
  duration: 5000,
});

// Loading toast that updates to success/error
const toastId = toast.loading("Submitting your request...");

try {
  await submitMutation(data);
  toast.success("Submitted!", { id: toastId });
} catch (error) {
  toast.error("Failed to submit", { id: toastId });
}

// Promise-based toast (auto-updates)
toast.promise(submitMutation(data), {
  loading: "Submitting...",
  success: "Quote request submitted!",
  error: "Failed to submit",
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik + Yup | React Hook Form + Zod | ~2022-2023 | Better performance, TypeScript inference, smaller bundles |
| Manual useState per field | useForm with register | ~2020 | Fewer re-renders, better validation, less boilerplate |
| React Toastify | Sonner | ~2023-2024 | Lighter bundle, better DX, native shadcn/ui integration |
| REST polling | Real-time WebSocket subscriptions | ~2024 | Instant updates, lower latency, better UX |
| TanStack Table v7 (React Table) | TanStack Table v8 | ~2022 | Headless architecture, framework-agnostic, better TypeScript |
| Custom form validation | Zod schemas | ~2021-2022 | Type safety, runtime validation, shared client/server schemas |

**Deprecated/outdated:**
- **Formik:** Still works but heavier bundle, no TypeScript inference, more re-renders than RHF
- **Class-based forms:** Hooks-based approach is now standard (useForm, not FormComponent extends React.Component)
- **Unstructured error strings:** Use ConvexError with structured data property for type-safe error handling

## Open Questions

Things that couldn't be fully resolved:

1. **Thumbnail generation for design summary card**
   - What we know: Designs have renders array (storage IDs), could use first render as thumbnail
   - What's unclear: Do we need to generate new thumbnail at submission time, or reuse existing render?
   - Recommendation: Reuse first render from design.renders array for MVP, add custom thumbnail capture later if needed

2. **Queue pagination strategy**
   - What we know: Convex queries support pagination with cursors, submissions.listPending currently uses `.collect()`
   - What's unclear: How many submissions expected? Need pagination immediately or can wait until volume increases?
   - Recommendation: Start with simple `.take(50)` limit, add pagination if queue regularly exceeds 50 items

3. **Internal notes vs customer notes distinction**
   - What we know: Schema has `notes` field on submission (customer-facing), CONTEXT.md mentions "internal notes field"
   - What's unclear: Should internal notes be separate field, or use existing `notes` field with visibility flag?
   - Recommendation: Add `internalNotes` field to submissions schema for team-only context, keep existing `notes` for customer input

4. **Status badge color mapping**
   - What we know: Status workflow is New → In Review → Quoted, shadcn/ui Badge has variant prop
   - What's unclear: Which variant for which status? Need custom colors?
   - Recommendation: New = "default" (blue), In Review = "secondary" (gray), Quoted = "success" (green)

## Sources

### Primary (HIGH confidence)
- React Hook Form official documentation - advanced usage patterns, defaultValues, validation modes
- Zod GitHub repository - schema definition, type inference, validation patterns
- Convex official documentation - mutations, queries, real-time subscriptions, error handling, transactions
- Existing codebase - convex/submissions.ts, src/hooks/useAuth.ts, package.json dependencies verified
- Sonner in shadcn/ui - src/components/ui/sonner.tsx existing implementation

### Secondary (MEDIUM confidence)
- [React Hook Form with Zod: Complete Guide for 2026](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) - Integration patterns
- [React Hook Form - Common Pitfalls & Gotchas](https://alexhooley.com/blog/react-hook-form-common-mistakes) - defaultValues, import issues
- [Multi-Step Form Navigation: Best Practices](https://www.reform.app/blog/multi-step-form-navigation-best-practices) - Review screens, validation timing
- [Sonner: Modern Toast Notifications Done Right](https://medium.com/@rivainasution/shadcn-ui-react-series-part-19-sonner-modern-toast-notifications-done-right-903757c5681f) - shadcn/ui integration
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Auth context patterns
- [Convex Error Handling Best Practices](https://docs.convex.dev/functions/error-handling/) - ConvexError, client-side handling
- [Optimistic UI patterns](https://plainenglish.io/blog/what-is-optimistic-ui) - Instant feedback, rollback on error

### Tertiary (LOW confidence)
- WebSearch results on data table libraries - TanStack Table vs alternatives (likely overkill for this phase)
- Form submission double-submit prevention - general patterns, not library-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, verified versions, existing patterns in codebase
- Architecture: HIGH - Patterns directly from codebase (useAuth, submissions.ts, sonner.tsx), official docs verified
- Pitfalls: HIGH - Sourced from official docs, community-recognized issues, existing codebase review
- Code examples: HIGH - Based on existing codebase patterns (auth, mutations, forms already used in LoginForm.tsx)
- Dashboard patterns: MEDIUM - Simple table/list sufficient, TanStack Table research done but may be unnecessary
- Thumbnail generation: LOW - Implementation detail not researched deeply, can defer to planning

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable libraries, unlikely to change significantly)
