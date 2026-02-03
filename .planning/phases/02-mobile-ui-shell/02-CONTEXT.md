# Phase 02: Mobile UI Shell - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the primary mobile navigation and interaction layer: bottom tab navigation (Home, Design, Orders, Chat), camera capture interface with guidance overlay, gallery selection, image quality validation, AI chat integration with Gemini 3.0 Flash, and bottom sheet component system. Establishes thumb zone layout patterns for all future mobile interfaces.

</domain>

<decisions>
## Implementation Decisions

### Camera guidance & capture
- Corner brackets framing the shot with rotating tips at bottom ("Stand back to capture full wall")
- Press-and-hold shutter (hold 1 second, release to capture) — prevents accidental shots
- Auto-focus only, no tap-to-focus
- After capture: preview screen with "Use Photo" or "Retake" options

### Image rejection UX
- Quality check happens immediately after capture, on the preview screen
- Technical tone with tips: "Image sharpness: Low. Tip: Ensure good lighting and hold phone steady."
- Strict rejection — below threshold must retake, no option to proceed with borderline photos

### Chat personality & scope
- Product knowledge only: materials, hardware, pricing questions, joinery options
- Knowledgeable tradesperson personality: friendly expert who knows materials — "That Polytec finish is great for kitchens, handles moisture well"
- Strict boundary for off-topic: "I can only help with joinery and materials. What would you like to know about your project?"

### Tab behavior & states
- Home tab (empty): Brief welcome message explaining the app, then camera prompt
- Design tab (empty): Illustration + "No designs yet. Take a photo to start creating."
- Orders tab (empty): "No orders yet. Submit a design to get a quote."
- Badge indicators: Red dot on Chat for unread messages, number badge on Orders for updates

### Claude's Discretion
- What quality issues to detect (blur, lighting, framing) — determine what's technically feasible to detect reliably
- Chat proactivity level — determine appropriate level of suggesting related information

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

*Phase: 02-mobile-ui-shell*
*Context gathered: 2026-02-04*
