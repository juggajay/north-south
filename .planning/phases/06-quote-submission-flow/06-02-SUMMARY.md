---
phase: 06-quote-submission-flow
plan: 02
subsystem: ui
tags: [react, forms, submission, wizard]

# Dependency graph
requires:
  - phase: 06-01
    provides: Backend submissions API with create mutation
  - phase: 05-03
    provides: Pricing hook and database-driven pricing display
  - phase: 04-02
    provides: Auto-save pattern and design ID persistence
provides:
  - Customer-facing submission flow (options -> review -> confirmation)
  - Pre-submit options UI (site measure, installation toggles)
  - Review summary before final submit
  - Confirmation screen with auto-redirect to Orders tab
  - Integration with StepReview (Submit for Quote button)
affects: [06-03-team-dashboard, orders-tab]

# Tech tracking
tech-stack:
  added:
    - react-hook-form: Form state management
    - zod: Schema validation for submission form
  patterns:
    - "Multi-step flow state machine (options -> review -> confirmation)"
    - "Auto-populate user data from auth context (no name/email form fields)"
    - "Existing design reuse via sessionStorage (no duplicate creation)"
    - "Form-driven submission with validation"

key-files:
  created:
    - src/components/submission/PreSubmitOptions.tsx
    - src/components/submission/ReviewSummary.tsx
    - src/components/submission/ConfirmationScreen.tsx
    - src/components/submission/SubmissionFlow.tsx
  modified:
    - src/components/wizard/StepReview.tsx

key-decisions:
  - "NO name/email form fields - auto-populated from useAuth() (logged-in account)"
  - "Design ID comes from existing sessionStorage auto-save (Phase 04 pattern)"
  - "No duplicate design creation on submission - uses existing auto-saved design"
  - "Confirmation screen clarifies NO confirmation email will be sent now"
  - "Auto-redirect to Orders tab after 2.5 seconds"
  - "3-step flow: options (toggles + notes) -> review (summary + confirm) -> confirmation (success + redirect)"

patterns-established:
  - "Submission flow as overlay in wizard (replaces review content when active)"
  - "Cancel returns to review screen (no navigation away from wizard)"
  - "React Hook Form + Zod for submission validation"
  - "Toast notifications for submission success/error"

# Metrics
duration: 4min 25sec
completed: 2026-02-05
---

# Phase 6 Plan 2: Customer-Facing Submission Flow Summary

**Complete submission UI with pre-submit options, review summary, and confirmation screen integrated into wizard**

## Performance

- **Duration:** 4 min 25 sec
- **Started:** 2026-02-05T06:04:49Z
- **Completed:** 2026-02-05T06:09:14Z
- **Tasks:** 2
- **Files created:** 4
- **Files modified:** 1

## Accomplishments

- Created PreSubmitOptions component with site measure and installation toggles
- Created ReviewSummary component showing full config summary, pricing, and options
- Created ConfirmationScreen with success message, no-email clarification, and auto-redirect
- Created SubmissionFlow orchestrator managing 3-step flow state machine
- Integrated submission flow into StepReview with "Submit for Quote" button
- Auto-populates name/email from logged-in user account (no form fields needed)
- Uses existing auto-saved designId from sessionStorage (no duplicate design creation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create submission flow components** - `8b630b6` (feat)
   - PreSubmitOptions: Site measure & installation toggles, optional notes textarea
   - ReviewSummary: Config summary, pricing, options display, Back/Submit buttons
   - ConfirmationScreen: Success message, timeline, no-email note, auto-redirect
   - SubmissionFlow: 3-step orchestrator with React Hook Form + Zod validation

2. **Task 2: Wire submission flow to wizard** - `d890b53` (feat)
   - StepReview: Added submission state toggle
   - Submit for Quote button launches SubmissionFlow
   - Gets designId from existing sessionStorage (Phase 04 auto-save)
   - Cancel returns to review screen

## Files Created/Modified

**Created:**
- `src/components/submission/PreSubmitOptions.tsx` - Pre-submit options UI (site measure, installation, notes)
- `src/components/submission/ReviewSummary.tsx` - Final review summary before submit
- `src/components/submission/ConfirmationScreen.tsx` - Success confirmation with auto-redirect
- `src/components/submission/SubmissionFlow.tsx` - Multi-step flow orchestrator

**Modified:**
- `src/components/wizard/StepReview.tsx` - Added submission flow integration with toggle state

## Decisions Made

- **No name/email form fields:** Auto-populated from `useAuth()` hook (logged-in account)
- **Design ID source:** Retrieved from sessionStorage (Phase 04 auto-save pattern), not created on submission
- **No duplicate design creation:** Uses existing auto-saved design from configurator session
- **Confirmation email clarification:** Added explicit note that NO confirmation email is sent now (user will hear when quote is ready)
- **Auto-redirect timing:** 2.5 seconds after submission confirmation
- **Flow pattern:** Submission flow replaces review content (overlay pattern), Cancel returns to review
- **Form validation:** React Hook Form + Zod for type-safe submission validation
- **Error handling:** Toast notifications for submission success/error states

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward React component creation and wizard integration.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Phase 06-03 (Team Dashboard UI):
- Submission flow complete with all required data collection
- Creates submissions in Convex with correct schema format
- Auto-populates user data from auth context
- Uses existing auto-saved design (no duplicate creation)
- Provides confirmation to user with auto-redirect to Orders tab
- No blockers for team dashboard implementation

---

*Phase: 06-quote-submission-flow*
*Completed: 2026-02-05*
