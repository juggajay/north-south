# Phase 04: 3D Configurator Core - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive 3D cabinet configurator with a 4-step wizard (Dimensions → Layout → Finishes → Review). Users configure joinery through slot-based module placement, with touch gestures for 3D viewport control. Includes undo/redo, cloud save, deep-link sharing, and before/after comparison. Builds on AI-generated renders from Phase 03.

</domain>

<decisions>
## Implementation Decisions

### Wizard Navigation
- Next/Back buttons for step navigation (no swipe between steps)
- Unlocking progression: later steps unlock once visited, then freely revisitable
- Strict validation before proceeding: all required fields must be set before Next enables
- Step indicator placement: Claude's discretion based on layout best practices

### Module Selection UX
- Module picker UI: Claude's discretion for optimal UX
- Module display: Photo/render thumbnails for each module type (real product imagery)
- Interior configuration flow: Claude's discretion for optimal UX
- Empty slot appearance in 3D view: Claude's discretion for best visual approach

### 3D Viewport Interaction
- Default camera: Slight angle (3/4 view) — shows depth and side, more dynamic than straight-on
- Cabinet doors: Tap to toggle open/close individual cabinet doors
- Rotation limits: Claude's discretion based on practical viewing needs
- Reset camera: Subtle button that appears after user has moved camera

### Save/Share Behavior
- Save timing: Auto-save continuously (every change syncs automatically)
- Authentication: Login required to use configurator
- Shared link behavior: Claude's discretion based on common patterns
- Versioning: Full version history — users can see and restore previous versions of designs

### Claude's Discretion
- Step indicator placement (top vs near buttons)
- Module picker presentation (bottom sheet grid vs list vs full-screen)
- Interior configuration flow (second sheet vs expand vs re-tap)
- Empty slot visual treatment (wireframe vs ghost vs highlight)
- Rotation limits (full 360° vs front hemisphere)
- Shared link permissions (view-only vs auto-duplicate)

</decisions>

<specifics>
## Specific Ideas

No specific product references mentioned. Open to standard patterns with these constraints:
- Explicit button navigation preferred over gesture-based (more controlled)
- Real product photos over abstract icons (builds trust, matches catalog)
- Tap interactions over long-press (more discoverable)
- Continuous auto-save (no lost work)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-3d-configurator-core*
*Context gathered: 2026-02-04*
