# Design Page Redesign — Full-Screen Mobile-First Flow

## Problem

The current configurator uses a 60/40 vertical split — 3D viewport on top, wizard controls crammed into the bottom 40vh. On mobile this feels cramped and far from premium. Step indicators, scrollable content, sticky price bar, and navigation buttons all compete for limited space.

## Design Principles

- **Mobile-first.** Every decision optimized for phone screens.
- **One screen, one task.** Each step owns the full viewport.
- **3D is on-demand.** Preview available via floating button, not always visible.
- **Generous spacing.** Whitespace is a feature, not wasted space.
- **Future-proof.** If real-time 3D updates prove necessary, the overlay can become a persistent mini-viewport without rearchitecting.

## Overall Page Structure

Each wizard step is a full-screen page. No 60/40 split.

```
+-----------------------------+
|  <- Back    Step 1/4    [*] |   Minimal top bar
|                             |   [*] = overflow menu
|                             |
|   [ Step Content ]          |   Full screen, breathable
|   Generous padding          |   Large touch targets
|   No scroll unless needed   |
|                             |
|                             |
+-----------------------------+
|  $2,450        [Next ->]    |   Sticky bottom bar
|  Est. total     Preview 3D  |   Price always visible
+-----------------------------+
```

### Key structural changes from current:
- No 60/40 split. Controls own the viewport.
- Step indicator simplified from breadcrumb to "Step 1/4" label in the top bar.
- Price + navigation merge into one sticky bottom bar (currently two separate elements).
- "Preview 3D" button in the bottom bar — always accessible, never in the way.
- Back button replaces left nav arrow — standard mobile pattern.

### Top bar overflow menu [*]
Undo/Redo, SaveIndicator, and VersionHistory move into a top-right overflow menu (three-dot icon). Tapping it reveals:
- Undo / Redo buttons (with keyboard shortcuts preserved for desktop)
- Save status ("Saved 2s ago")
- "Version History" link (opens the existing bottom sheet)

These are power-user features that don't need persistent screen space. Auto-save continues running in the background regardless of menu visibility.

### Step navigation
The "Step 1/4" label in the top bar is **tappable** — opens a small dropdown showing all 4 steps. Previously visited steps are tappable to jump directly. Unvisited steps are grayed out and disabled. This preserves the free-revisitation behavior from the current breadcrumb without taking permanent screen space.

### Validation gates
The bottom bar's Next button enforces step validation before allowing progression:
- **Step 1 (Dimensions):** width >= 1200 AND height >= 1800 AND depth > 0
- **Step 2 (Layout):** At least one module placed in any slot
- **Step 3 (Finishes):** Material selected (finishes.material !== '')
- **Step 4 (Review):** Always valid (read-only)

When validation fails, the Next button is disabled with reduced opacity. No error toasts — the missing fields get a subtle highlight (red border or label color) so users can see what's needed.

---

## Step 1: Dimensions

Full-screen dimension controls with generous spacing.

```
+-----------------------------+
|  <- Back    Step 1/4    [*] |
|                             |
|  Set Your Dimensions        |
|  AI suggests: 2400 x 560   |   Helper text (if available)
|                             |
|  WIDTH                      |
|  ---------*---------- 2400  |   Large slider track
|  1200mm            3600mm   |   with big drag handle
|                             |
|                             |
|  HEIGHT                     |
|  -------------*----- 2100   |
|  1800mm            2400mm   |
|                             |
|                             |
|  DEPTH                      |
|  +-----+ +-----+ +-----+   |   Pill/chip selector
|  | 400 | | 500 | | 560 |   |   instead of dropdown
|  +-----+ +-----+ +-----+   |
|  +-----+ +-----+           |
|  | 600 | | 650 |           |
|  +-----+ +-----+           |
|                             |
+-----------------------------+
|  $2,450        [Next ->]    |
|  Est. total     Preview 3D  |
+-----------------------------+
```

### Details:
- **Sliders get 80-100px vertical spacing** between each control.
- **Depth becomes tappable chips** instead of a dropdown. Only 5 options (400, 500, 560, 600, 650mm) — no reason to hide them. One tap, done.
- **Large slider handles** (44px+ touch target) for tactile feel.
- **Live value display** next to the slider track updates as user drags.
- **AI estimate helper text** shown below the heading if an aiEstimate prop was passed. Shows the AI-suggested dimensions so users have a reference point.
- **No scroll needed** — everything fits in one viewport with comfortable spacing.

---

## Step 2: Layout (Module Selection)

Full-screen module picker with inline slot diagram replacing the 3D model.

```
+-----------------------------+
|  <- Back    Step 2/4    [*] |
|                             |
|  Choose Your Modules        |
|                             |
|  +------------------------+ |
|  |  Slot Diagram           | |   Simple 2D schematic
|  |  OVERHEAD               | |   of the cabinet face
|  |  +---+---+---+---+     | |   Dynamic slot count
|  |  | 1 | 2 | 3 | 4 |     | |   based on width
|  |  +---+---+---+---+     | |   (width / 600mm)
|  |  BASE                   | |
|  |  +---+---+---+---+     | |   Two rows: overhead
|  |  | 5 | 6 |[7]| 8 |     | |   and base
|  |  +---+---+---+---+     | |   [7] = active slot
|  +------------------------+ |
|                             |
|  Slot 7 (base):        [x] |   [x] = remove module
|                             |
|  +-----------+ +----------+ |
|  |  [photo]  | |  [photo] | |   Shows 7 BASE module
|  |  Standard | |  Sink    | |   types for base slots,
|  |  +$120    | |  +$180   | |   5 OVERHEAD types for
|  +-----------+ +----------+ |   overhead slots
|  +-----------+ +----------+ |
|  |  [photo]  | |  [photo] | |
|  |  Drawers  | |  Pantry  | |
|  |  +$90     | |  +$210   | |
|  +-----------+ +----------+ |
|         (scroll)            |
+-----------------------------+
|  $2,450        [Next ->]    |
|  Est. total     Preview 3D  |
+-----------------------------+
```

### Details:
- **Flat 2D slot diagram** replaces the 3D model as the visual anchor. Lightweight, clear, shows which slot is active.
- **Dynamic slot count.** The diagram renders slots based on cabinet width (width / 600mm), not a hardcoded layout. Two rows: overhead slots on top, base slots on bottom.
- **No bottom sheet.** Module options are inline on the page beneath the diagram. No modal layers, no drag-to-dismiss.
- **Slot diagram highlights active slot** with colored border/fill. Checkmarks on configured slots for progress feedback.
- **Module type filtering.** Tapping a base slot shows 7 base module types (standard, sink-base, drawer-stack, pull-out-pantry, corner-base, appliance-tower, open-shelving). Tapping an overhead slot shows 5 overhead types (standard-overhead, glass-door, open-shelf, rangehood-space, lift-up-door).
- **Remove module button** — when a slot already has a module assigned, a clear/remove [x] button appears next to the slot label. Tapping it clears the slot back to empty.
- **Module cards get more padding** — larger photos, clear price deltas, generous gutters.
- **Slot diagram pins to top** of content area. Only module cards scroll if there are more than 4.
- **Default state:** First base slot is auto-selected when entering Step 2 so users see module cards immediately (no blank "tap a slot" state).
- **Future-proofing:** Slot diagram can be swapped for a small 3D mini-viewport in this same position if real-time updates prove necessary.

---

## Step 3: Finishes (Materials, Hardware, Door Profiles)

Full-screen material selection that feels like browsing a premium catalogue.

```
+-----------------------------+
|  <- Back    Step 3/4    [*] |
|                             |
|  Choose Your Finishes       |
|                             |
|  +--------+--------+------+ |
|  |Material| Hard   | Door | |   Full-width segmented
|  | ====== | ware   | Prof | |   control tabs
|  +--------+--------+------+ |
|                             |
|  Woodmatt                   |   Category label
|                             |
|  +------+ +------+ +------+|
|  |      | |      | |      ||   3-col swatch grid
|  |      | | [chk]| |      ||   ~100px squares
|  | Oak  | |Walnt | |Maple ||   Selected = check
|  | +$0  | |+$40  | | +$0  ||   + border highlight
|  +------+ +------+ +------+|
|                             |
|  Satin                      |
|  +------+ +------+ +------+|
|  |      | |      | |      ||
|  |White | |Charc | |Navy  ||
|  | +$60 | |+$60  | |+$80  ||
|  +------+ +------+ +------+|
|         (scroll)            |
+-----------------------------+
|  $2,450        [Next ->]    |
|  Est. total     Preview 3D  |
+-----------------------------+
```

### Details:
- **3-column grid instead of 4.** Larger swatches — material texture is actually visible and tappable without precision. ~100px square on a standard phone.
- **Segmented control tabs** instead of small text tabs. Full-width, chunky, obvious which is active.
- **Category headers scroll naturally** — "Woodmatt", "Satin", "Gloss". Users scan by group, not a flat wall of tiny squares.
- **Selected state is bold** — thick border + checkmark overlay. No ambiguity.
- **Hardware tab** keeps full-width list items (items need descriptions like "Brushed Brass Handle -- $45").
- **Door Profile tab** uses 2-column cards with profile images, same as current but with more padding.
- **Preview 3D is especially useful here** — "what does Walnut look like on my cabinet?"

### Loading states:
- **Skeleton grid** shown while materials/hardware/profiles load from Convex. Three rows of 3 pulsing placeholder rectangles matching swatch dimensions.
- **Error state** with retry button if data fetch fails. "Couldn't load materials. [Try again]" — not a silent empty state.
- Framer Motion AnimatePresence transitions between tabs preserved from current implementation.

---

## Step 4: Review & Submit

Clean checkout-style experience.

```
+-----------------------------+
|  <- Back    Step 4/4    [*] |
|                             |
|  Your Configuration         |
|                             |
|  +-------------------------+|
|  | Dimensions        [edit]||   Compact summary items
|  | 2400W x 600D x 2100H   ||   with edit shortcuts
|  +-------------------------+|
|  +-------------------------+|
|  | Modules           [edit]||
|  | 3 base + 2 overhead     ||
|  +-------------------------+|
|  +-------------------------+|
|  | Finishes          [edit]||
|  | Walnut . Brass . Shaker ||
|  +-------------------------+|
|                             |
|  ---------------------------+
|  Cabinetry        $1,800   |   Clean price breakdown
|  Hardware           $320   |   No box, just lines
|  Finish upgrade     $280   |
|  ---------------------------+
|  Estimated Total  $2,450   |   Bold total
|                             |
+-----------------------------+
|  $2,450  [Submit for Quote] |   CTA replaces "Next"
|           Preview 3D        |
+-----------------------------+
```

### Details:
- **Summary cards are compact single-line items** with `[edit]` links that jump back to the relevant step (goToStep(0), goToStep(1), goToStep(2)). No redundant detail boxes.
- **Price breakdown is a clean list** — line items in regular weight, total in bold. No box-in-a-box nesting. Feels financial and trustworthy.
- **"Submit for Quote" replaces "Next"** in the bottom bar. Primary CTA, full-width button.
- **No duplicate price display** — bottom bar total and breakdown total are the same element.

### Submission flow (after tapping "Submit for Quote"):
The submission is a **3-page full-screen flow**, each page its own screen with back navigation:

**Page 1 — Contact & Options:**
```
+-----------------------------+
|  <- Back     Submit Quote   |
|                             |
|  Your Details               |
|                             |
|  Name                       |
|  [_______________________]  |   Pre-filled from auth
|                             |
|  Email                      |
|  [_______________________]  |   Pre-filled from auth
|                             |
|  +-------------------------+|
|  | [ ] Site measure        ||   Toggle options
|  | [ ] Installation quote  ||
|  +-------------------------+|
|                             |
|  Notes (optional)           |
|  [_______________________]  |
|  [_______________________]  |
|                             |
+-----------------------------+
|           [Continue]        |
+-----------------------------+
```

**Page 2 — Final Review:** Shows complete config summary + form data. Confirm & Submit button.

**Page 3 — Confirmation:** Success message with submission ID. "Done" button returns to home or starts new design.

Form validation uses existing React Hook Form + Zod schema. Name and email are required. If user is authenticated, fields pre-populate from user data (existing getOrCreateUser behavior).

---

## 3D Preview Overlay

Triggered by the "Preview 3D" button. Feels instant and immersive.

```
+-----------------------------+
|                          X  |   Close button, top right
|                             |
|                             |
|                             |
|     [ Full-screen 3D        |   Canvas takes everything
|       viewport with         |   Pinch to zoom
|       orbit controls ]      |   Drag to rotate
|                             |
|                             |
|                             |
|                             |
|                             |
+-----------------------------+
|  Walnut . 2400W . 5 modules |   Thin summary strip
+-----------------------------+
```

### Details:
- **Slides up from bottom** with smooth spring animation. Not a hard cut.
- **Full viewport (100vh)** — no header competing for space.
- **Thin summary strip at bottom** — one line showing current config for context. No controls, no buttons.
- **Close via X button or swipe down.** Standard overlay pattern.
- **Model reflects current state** — materials, modules, dimensions all applied.

### Canvas lifecycle (important):
The Canvas3D component is **mounted once in ConfiguratorPage and kept alive** throughout the session. It is rendered off-screen (hidden via CSS or portal) when not visible, and moved into the preview overlay when opened. This avoids destroying/recreating the WebGL context on every preview open/close, which is expensive.

Implementation approach:
- Canvas3D renders in a persistent container with `visibility: hidden` / `position: fixed; left: -9999px` when not in preview mode.
- When "Preview 3D" is tapped, the canvas container is moved into the overlay via CSS (position: fixed, inset: 0, z-index: overlay).
- DimensionSync continues to run inside the Canvas regardless of visibility, so the 3D scene stays in sync with store updates.
- On overlay close, canvas moves back to its hidden container. No remount, no WebGL context loss.

### Future-proofing:
If real-time updates prove necessary, this component can become a persistent mini-viewport docked at the top of each step (~30vh) with step content scrolling below. Same component, different container. No rearchitecting.

---

## Migration Notes

### Components to refactor:
- `ConfiguratorPage.tsx` — Remove 60/40 split, make WizardShell full-screen, keep Canvas3D mounted but hidden
- `WizardShell.tsx` — New top bar (back + step label + overflow menu), merge price + nav into single bottom bar, add step dropdown for free navigation
- `StepDimensions.tsx` — Replace DepthSelector dropdown with chip/pill group (400/500/560/600/650mm), increase slider spacing, preserve AI estimate display
- `StepLayout.tsx` — Add 2D slot diagram component, inline module cards (remove ModulePicker bottom sheet), add remove-module button, auto-select first base slot on entry
- `StepFinishes.tsx` / `MaterialPicker.tsx` — 3-col grid, segmented tabs, category headers, add loading skeletons and error/retry states
- `StepReview.tsx` — Compact summary cards with edit links (goToStep), clean price list
- `PriceStickyBar.tsx` — Merge with StepNavigation into single bottom bar component, add validation-disabled state
- `SubmissionFlow.tsx` — 3 separate full-screen pages instead of content takeover, preserve React Hook Form + Zod validation

### New components:
- `SlotDiagram.tsx` — 2D schematic of cabinet slots for Step 2, dynamic slot count (width / 600mm), two rows (overhead + base), tappable slots with active/configured states
- `PreviewOverlay.tsx` — Full-screen 3D preview with slide-up animation, manages canvas container positioning
- `BottomBar.tsx` — Unified price + navigation + preview button, validation-aware Next button
- `TopBar.tsx` — Back button + step label (tappable dropdown) + overflow menu (undo/redo/save/history)

### Components to remove:
- `StepIndicator.tsx` (breadcrumb version) — replaced by tappable step label in TopBar
- `ModulePicker` bottom sheet — replaced by inline cards in StepLayout
- `StepNavigation.tsx` — merged into BottomBar
- `PriceStickyBar.tsx` — merged into BottomBar

### Existing functionality to preserve:
- Zustand stores (useCabinetStore, useWizardStore, useHistoryStore) — no changes needed
- Auto-save via useAutoSave hook — continues running in ConfiguratorPage
- Undo/Redo keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z) — preserved, buttons move to overflow menu
- Version history bottom sheet — opened from overflow menu instead of header
- Framer Motion tab transitions in MaterialPicker — preserved
- Step validation logic in useWizardStore.canProceedFromCurrentStep — preserved, wired to BottomBar
- visitedSteps tracking — preserved, wired to step dropdown in TopBar
