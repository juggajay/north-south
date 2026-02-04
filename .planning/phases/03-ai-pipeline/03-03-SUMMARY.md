---
phase: 03-ai-pipeline
plan: 03
subsystem: ai-backend
tags: [dimension-estimation, render-generation, gemini, polytec, convex-action]
dependency-graph:
  requires: ["03-01"]
  provides: ["dimension-estimation", "render-generation", "polytec-style-mapping"]
  affects: ["04-configurator", "ui-render-carousel"]
tech-stack:
  added: []
  patterns: ["aesthetic-based-style-mapping", "dimension-tier-system", "partial-failure-handling"]
key-files:
  created:
    - src/lib/ai/depth-estimation.ts
    - src/lib/ai/render-generation.ts
  modified:
    - convex/ai.ts
decisions:
  - id: "dim-tier-mvp"
    choice: "Basic tier only for MVP"
    rationale: "Claude Vision estimates sufficient for MVP; Depth Anything V2 deferred"
  - id: "style-mapping-aesthetic"
    choice: "Aesthetic-based style mapping"
    rationale: "Fixed 3 styles per aesthetic; dynamic per-space matching deferred"
  - id: "render-partial-failure"
    choice: "Graceful partial failure handling"
    rationale: "Return successful renders even if some generations fail"
metrics:
  duration: "4m18s"
  completed: "2026-02-04"
---

# Phase 03 Plan 03: Dimension Estimation & Render Generation Summary

Dimension estimation from Claude Vision analysis and render generation via Gemini, with Polytec style mapping for Australian joinery market.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create Dimension Estimation Module | `3c68f00` | src/lib/ai/depth-estimation.ts |
| 2 | Create Render Generation Client | `9cd960e` | src/lib/ai/render-generation.ts |
| 3 | Add Render Generation Convex Action | `20e3628` | convex/ai.ts |

## What Was Built

### Dimension Estimation (`src/lib/ai/depth-estimation.ts`)

Client-side module for processing Claude Vision space analysis into structured dimensions:

- **estimateDimensions**: Takes SpaceAnalysis, returns Dimensions with confidence tier
- **getDimensionTierLabel**: Returns "High confidence" or "Verify dimensions" based on tier
- **formatDimensions**: Formats as "WxDxHmm" string for display

Tier system designed for future expansion:
- **Basic** (MVP): Single photo, +/-15% accuracy, 85% confidence
- **Standard** (future): Photo + reference object, +/-10% accuracy
- **Enhanced** (future): Multiple photos, +/-5% accuracy
- **Precision** (future): LiDAR scan, +/-2% accuracy

Sanity constraints applied:
- Width: 500-6000mm (small alcove to large wall unit)
- Depth: 300-2000mm (shallow shelf to walk-in pantry)
- Height: 2100-3500mm (Australian ceiling heights)

### Render Generation Client (`src/lib/ai/render-generation.ts`)

Client-side helpers for AI-powered render generation:

- **getStylesForSpace**: Maps aesthetic to 3 Polytec style options
- **buildRenderPrompt**: Builds detailed prompt for Gemini image generation
- **parseRenderResult**: Parses Gemini response to Render type

POLYTEC_STYLES mapping covers all 5 aesthetics:

| Aesthetic | Style 1 | Style 2 | Style 3 |
|-----------|---------|---------|---------|
| Modern | Modern White | Concrete Grey | Modern Charcoal |
| Traditional | Classic Oak | Warm Walnut | Cream Shaker |
| Industrial | Industrial Dark | Raw Concrete | Brushed Metal |
| Coastal | Coastal White | Beach Timber | Ocean Blue |
| Scandinavian | Nordic Light | Scandi Oak | Stockholm Grey |

### Render Generation Action (`convex/ai.ts`)

Server-side Convex action using Gemini API:

- **generateRendersAction**: Generates up to 3 styled renders
- Uses Gemini 2.0 Flash (gemini-2.0-flash-exp)
- Handles partial failures gracefully
- Returns successful renders even if some fail
- Returns error details for failed styles

## Decisions Made

### Dimension Tier MVP Scope

**Decision:** Use Basic tier only for MVP (Claude Vision estimates, +/-15% accuracy)

**Rationale:** Claude Vision's spatial reasoning is sufficient for initial dimension estimates. Depth Anything V2 integration deferred to future enhancement. Tier system designed to accommodate future integration without code changes.

### Aesthetic-Based Style Mapping

**Decision:** Fixed 3 styles per aesthetic (not dynamic per-space)

**Rationale:** All users with same detected aesthetic get same style options. This satisfies "Matches space to 3 appropriate design styles" since styles ARE appropriate for detected aesthetic. Dynamic per-space matching based on flooring/wall colors deferred.

### Partial Failure Handling

**Decision:** Return successful renders even if some style generations fail

**Rationale:** Better UX to show 1-2 successful renders than fail entirely. Errors logged and returned for debugging but don't block the pipeline.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] `npm run typecheck` passes
- [x] src/lib/ai/depth-estimation.ts exports: estimateDimensions, getDimensionTierLabel, formatDimensions
- [x] src/lib/ai/render-generation.ts exports: getStylesForSpace, buildRenderPrompt, parseRenderResult
- [x] convex/ai.ts exports: generateRendersAction
- [x] Style mapping covers all 5 aesthetics with 3 options each

## Success Criteria

- [x] Dimension estimation applies sanity constraints (500-6000mm width, 300-2000mm depth, 2100-3500mm height)
- [x] Confidence tiers clearly labeled ("Verify dimensions" for Basic)
- [x] Style-to-Polytec mapping covers all aesthetics (5 aesthetics, 3 styles each)
- [x] Render generation handles model fallback gracefully
- [x] Partial failures don't break the whole pipeline
- [x] MVP scope documented (Claude Vision for dimensions, aesthetic-based style matching)

## Dependencies

**Requires:**
- GEMINI_API_KEY environment variable for render generation
- Plan 03-01 (Query Infrastructure) for type definitions

**Provides for:**
- Phase 04 (Configurator): Dimension estimation for space configuration
- UI components: Render carousel display

## Next Phase Readiness

Phase 03 Plan 03 complete. Dimension estimation and render generation backend ready for:
- Plan 04: Processing pipeline orchestration
- Plan 05: UI components for render carousel

**Environment Setup Required:**
- GEMINI_API_KEY must be set in Convex environment for render generation
