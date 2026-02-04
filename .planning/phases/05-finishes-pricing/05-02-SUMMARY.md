---
phase: 05-finishes-pricing
plan: 02
subsystem: pricing
tags: [convex, zustand, react, intl, pricing, currency, typescript]

# Dependency graph
requires:
  - phase: 05-01
    provides: Database schema with pricing fields (materials, hardware, doorProfiles, modules)
  - phase: 04-01
    provides: Zustand store for cabinet configuration
provides:
  - Centralized usePricing hook for reactive price calculations
  - PriceDisplay component for single price formatting
  - PriceBreakdown component for itemized display
  - PriceStickyBar component for wizard navigation
affects: [05-03, 05-04, 06-review-step]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Integer-based pricing (cents) to avoid floating-point errors"
    - "Intl.NumberFormat for locale-aware currency formatting"
    - "Zustand selectors for performance (subscribe to config slice only)"
    - "useMemo for expensive calculations"
    - "Loading skeletons for async pricing data"

key-files:
  created:
    - src/hooks/usePricing.ts
    - src/components/pricing/PriceDisplay.tsx
    - src/components/pricing/PriceBreakdown.tsx
    - src/components/pricing/PriceStickyBar.tsx
  modified: []

key-decisions:
  - "All pricing stored and calculated in integer cents to avoid JavaScript floating-point precision errors"
  - "Intl.NumberFormat with en-AU locale for Australian dollar formatting"
  - "Hardware variance (±5%) calculated and displayed in all price breakdowns"
  - "Zustand selector pattern (state) => state.config to prevent unnecessary re-renders"

patterns-established:
  - "usePricing: Centralized hook pattern for all pricing calculations"
  - "Integer cents → format on display: Never store or calculate with decimals"
  - "Loading state handling: Return zero values during data loading, show skeleton in UI"
  - "Variance disclaimer: Always show ±5% hardware variance in price breakdowns"

# Metrics
duration: 4min
completed: 2026-02-04
---

# Phase 05 Plan 02: Pricing Hook & Display Components Summary

**Reactive pricing engine with integer-based calculations, Intl.NumberFormat currency formatting, and hardware variance tracking**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-04T10:44:20Z
- **Completed:** 2026-02-04T10:48:13Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Centralized pricing hook that queries Convex and calculates from Zustand config
- Integer-based pricing calculations (cents) to eliminate floating-point errors
- Three reusable display components with consistent AUD formatting
- Hardware variance (±5%) calculated and displayed with disclaimers

## Task Commits

Each task was committed atomically:

1. **Task 1: Create usePricing hook** - `0b9ba3c` (feat)
2. **Task 2: Create pricing display components** - `53c61a8` (feat)

## Files Created/Modified

### Created
- `src/hooks/usePricing.ts` - Centralized pricing calculation hook that queries Convex for materials, hardware, doorProfiles, and modules, reads config from Zustand, calculates breakdown by category (all in integer cents), and returns both raw cents and formatted currency strings
- `src/components/pricing/PriceDisplay.tsx` - Single price display component with optional variance indicator, uses Intl.NumberFormat for AUD formatting
- `src/components/pricing/PriceBreakdown.tsx` - Itemized price breakdown component showing cabinets, material, hardware, door profile costs with variance disclaimer and loading skeleton
- `src/components/pricing/PriceStickyBar.tsx` - Sticky bottom bar for wizard showing live total price with disclaimer text

## Decisions Made

1. **Integer-based pricing throughout:** All prices stored in database as cents, all calculations performed in integer arithmetic, conversion to dollars only happens at display time using `Intl.NumberFormat`. This eliminates JavaScript floating-point precision errors (0.1 + 0.2 !== 0.3) that can cause incorrect totals.

2. **Zustand selector for config slice:** Hook subscribes to `(state) => state.config` instead of entire store, preventing unnecessary re-renders when unrelated store state changes.

3. **Module type matching strategy:** Hook maps store module types ('standard', 'sink-base', etc.) to database module codes ('MOD-BASE-600', 'MOD-BASE-SINK', etc.) using string matching with fallback to default module. This handles the impedance mismatch between simplified store types and detailed database codes.

4. **Hardware variance at 5%:** Variance calculated as Math.round((breakdown.hardware * 5) / 100) and displayed in both PriceBreakdown disclaimer and formatted output.

5. **Loading state returns zeros:** During Convex query loading (undefined), hook returns breakdown with all zeros instead of undefined/null, allowing components to render safely with $0.00 until data loads.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript implicit 'any' errors in find() callbacks:**
- **Problem:** TypeScript strict mode required explicit type annotations for Convex query result array methods
- **Solution:** Added `(m: any)`, `(h: any)`, `(p: any)` type annotations to find() callbacks in usePricing.ts
- **Reason:** Convex generated types not fully inferring query result types in array methods

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for 05-03 and 05-04:**
- usePricing hook available for all wizard steps
- Display components ready to integrate into StepFinishes and StepReview
- Pricing calculations reactive to config changes via Zustand and Convex

**Foundation established:**
- Pattern for integer-based pricing can be applied to add-ons pricing in Phase 06
- Currency formatting centralized in reusable components
- Variance disclaimer pattern established for all estimates

**No blockers.**

---
*Phase: 05-finishes-pricing*
*Completed: 2026-02-04*
