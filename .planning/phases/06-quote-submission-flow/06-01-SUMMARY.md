---
phase: 06-quote-submission-flow
plan: 01
subsystem: api
tags: [convex, schema, mutations, queries, submissions]

# Dependency graph
requires:
  - phase: 05-finishes-pricing
    provides: Base submissions schema and CRUD operations
provides:
  - Internal notes field on submissions for team-only context
  - listAll query returning all submissions with design data
  - updateInternalNotes mutation for team notes management
  - Extended status workflow (pending/in_review/quoted/ordered/rejected)
affects: [06-02-team-dashboard, 06-03-quote-form]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Separation of customer-facing notes from internal team notes"
    - "Enriched queries returning submissions with related design data"

key-files:
  created: []
  modified:
    - convex/schema.ts
    - convex/submissions.ts

key-decisions:
  - "Added internalNotes as optional field for backward compatibility"
  - "Extended status workflow to include in_review state for 3-step process"
  - "listAll query limited to 100 most recent submissions for performance"

patterns-established:
  - "Team-only fields use 'internal' prefix for clarity"
  - "All admin queries enrich submissions with design data"

# Metrics
duration: 1min 28sec
completed: 2026-02-04
---

# Phase 6 Plan 1: Backend Foundation for Team Workflows Summary

**Submissions API extended with internal notes field, listAll query for team dashboard, and 3-step workflow status support**

## Performance

- **Duration:** 1 min 28 sec
- **Started:** 2026-02-04T19:00:14Z
- **Completed:** 2026-02-04T19:01:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added internalNotes field to submissions schema for team-only context
- Created listAll query to support team dashboard (all submissions with design data)
- Added updateInternalNotes mutation for managing team notes
- Extended updateStatus to support 3-step workflow (pending → in_review → quoted)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add internalNotes field to submissions schema** - `44491cc` (feat)
2. **Task 2: Add listAll query and updateInternalNotes mutation** - `f5d9e63` (feat)

## Files Created/Modified
- `convex/schema.ts` - Added internalNotes field to submissions table
- `convex/submissions.ts` - Added listAll query, updateInternalNotes mutation, extended status validation

## Decisions Made
- Made internalNotes optional to maintain backward compatibility with existing submissions
- Limited listAll query to 100 most recent submissions to prevent performance issues on large datasets
- Extended validStatuses array to include "in_review" state for 3-step workflow (pending → in_review → quoted)
- Kept existing listPending query alongside new listAll for specific use cases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward schema extension and API additions.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Phase 06-02 (Team Dashboard UI):
- Backend API complete with all required queries and mutations
- Schema supports separation of customer and internal notes
- Status workflow supports 3-step process (pending/in_review/quoted)
- No blockers for frontend implementation

---
*Phase: 06-quote-submission-flow*
*Completed: 2026-02-04*
