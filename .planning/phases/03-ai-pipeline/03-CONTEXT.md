# Phase 03: AI Pipeline - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform user photos into styled renders showing joinery in their actual space, with dimension estimates. Includes processing feedback UI, render generation pipeline (Claude Vision + Depth Anything V2 + Nano Banana Pro), and error handling. Does not include the 3D configurator (Phase 04) or material selection (Phase 05).

</domain>

<decisions>
## Implementation Decisions

### Processing Feedback
- Step indicators showing named stages with checkmarks: Analyzing → Measuring → Styling → Creating
- Abstract geometric motion animation while processing (modern, not literal)
- No time estimates shown — avoids frustration if slower than expected
- No cancel option once processing starts — committed flow, simpler UX

### Render Presentation
- Swipeable carousel for 3 renders — full-screen, swipe left/right, dots indicator
- Single action from render view: "Customize this" opens configurator with selected style
- No before/after comparison on render screen — that happens in configurator (Phase 04)

### Dimension Display
- Dimensions shown in configurator (Phase 04), not on render screens
- Tier labels for confidence: "High confidence" vs "Verify dimensions" — human-readable
- Inline subtle disclaimer: "Estimates from photo — site measure confirms final dimensions"

### Error Handling
- Retry entire pipeline on failure — "Something went wrong. Try again?" — simple, clean
- If AI can't detect a room: guidance + retake — "We couldn't detect a room. Tips: include walls, better lighting"
- Errors logged with photo for team review — helps improve the system over time

### Claude's Discretion
- Render labeling approach (style name only vs style + description)
- Dimension editing flow timing (before or only in configurator)
- Retry logic (automatic retry count, silent vs visible)
- Abstract animation design and motion style
- Step indicator visual design

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ai-pipeline*
*Context gathered: 2026-02-04*
