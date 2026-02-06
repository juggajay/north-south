# Sarah's Perfect Kitchen — Complete UX Redesign Plan (v2)

> The goal: Sarah, a non-tech-savvy mum from western Sydney, opens this app
> and 20 minutes later feels like she just worked with a high-end kitchen
> designer. She has a design she's proud of, a price range she expected, and
> she can't wait to show her husband.

---

## Core Principle

**Sarah is the client. The AI is the designer.**

She never sees an empty canvas. She never encounters jargon. She never has to
"figure it out." The AI does the design work. Sarah makes decisions by
reacting — yes, no, change this, I prefer that.

Every screen has:
- ONE clear purpose
- ONE primary action
- ZERO jargon
- The AI companion present, guiding (not selling)
- Minimum 44x44px touch targets on all interactive elements
- `aria-live` announcements where content updates dynamically
- Full keyboard navigability

---

## The Complete Flow

### SCREEN 0: Landing (Pre-Auth)

Sarah opens the app for the first time. She has NOT logged in.

```
+--------------------------------+
|                                |
|   [looping video/animation    |
|    of a kitchen transforming   |
|    — before -> after, subtle,  |
|    beautiful, 5 seconds]       |
|                                |
|   (if prefers-reduced-motion:  |
|    show static before/after    |
|    image instead)              |
|                                |
+--------------------------------+
|                                |
|   See what your kitchen        |
|   could become.                |
|                                |
|   Custom kitchens from $8,000. |
|   Cabinets and doors --        |
|   benchtop, installation       |
|   quoted separately.           |
|                                |
|   1,000+ kitchens designed     |
|   across Australia.            |
|                                |
|  +----------------------------+|
|  |   Create Free Account      ||
|  +----------------------------+|
|                                |
|  Try with a sample kitchen >   |
|                                |
+--------------------------------+
```

**Key decisions:**
- NO auth wall. She sees value first.
- Price shown upfront as "$8,000" with clear scope: "Cabinets and doors — benchtop, installation quoted separately." No surprises later.
- Social proof: "1,000+ kitchens designed across Australia" (or similar credible number).
- "Create Free Account" (not "Get Started") makes the action and cost (free) explicit.
- "Try with a sample kitchen" lets her explore the full flow with a demo kitchen before committing.
- Landing page video respects `prefers-reduced-motion` — users with that preference see a static before/after image instead of animation.

**Demo mode:**
- Uses 100% CACHED, pre-generated responses. Zero live AI calls. Cost: $0.00.
- Demo walks through the FULL flow including simulated photo capture + wall detection steps (not skipped). The photo is a pre-loaded typical kitchen. Wall detection shows pre-computed results. Discovery answers are pre-selected but editable.
- At the end: "Love it? Do this with your own kitchen — create a free account."
- When Sarah upgrades from demo to real account, her discovery answers (style preferences, priorities, specific requests) carry forward so she doesn't repeat herself. Only the photo + wall detection need to be redone with her real space.

---

### SCREEN 1: Sign Up / Login

```
+--------------------------------+
|                                |
|   North South                  |
|                                |
|  +----------------------------+|
|  | [G] Continue with Google   ||
|  +----------------------------+|
|                                |
|  +----------------------------+|
|  | [] Continue with Apple    ||
|  +----------------------------+|
|                                |
|  -------- or --------          |
|                                |
|  Email                         |
|  +----------------------------+|
|  | sarah@email.com            ||
|  +----------------------------+|
|                                |
|  Password                      |
|  +----------------------------+|
|  | ********                   ||
|  +----------------------------+|
|                                |
|  +----------------------------+|
|  |   Sign Up                  ||
|  +----------------------------+|
|                                |
|  Already have an account?      |
|  Log in >                      |
|                                |
|  We'll never share your        |
|  details. No spam, ever.       |
|                                |
+--------------------------------+
```

**Key decisions:**
- PRIMARY: Google Sign-In and Apple Sign-In (one-tap social login). These are the large, prominent buttons at top. Most users will use one of these.
- SECONDARY: Email + password below a divider. Available but not emphasized.
- Privacy line at bottom: "We'll never share your details. No spam, ever." Builds trust.
- After first signup, goes to AI Introduction (Screen 2). Ask "What should I call you?" as part of signup or first screen.
- After subsequent logins, goes to Dashboard (Screen 12).
- FUTURE CONSIDERATION: Delay auth until quote submission (Screen 10) — let users go through the entire flow as a guest, only requiring an account to save and submit. This removes friction but requires careful state management. Flag for Phase 2 evaluation.

---

### SCREEN 2: AI Introduction (First Time Only)

This replaces the 3-screen onboarding. It's ONE screen — the AI's first
message. Like meeting a professional for the first time.

```
+--------------------------------+
|                                |
|                                |
|         +------+               |
|         | NS   |               |
|         +------+               |
|                                |
|   "Hi Sarah -- I'm your       |
|   digital design assistant     |
|   from North South, powered    |
|   by smart technology and      |
|   backed by our team of        |
|   experienced joiners.         |
|                                |
|   I'll guide you through       |
|   designing your perfect       |
|   kitchen, step by step.       |
|   You don't need to know       |
|   anything about cabinetry     |
|   -- that's my job.            |
|                                |
|   It takes about 15-20         |
|   minutes, and you can save    |
|   and come back anytime.       |
|                                |
|   Ready?"                      |
|                                |
|  +----------------------------+|
|  |   Let's Go                 ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

**Key decisions:**
- Uses her displayName (collected during signup via "What should I call you?"). Feels personal.
- AI disclosure (Australian Consumer Law): "digital design assistant from North South, powered by smart technology and backed by our team of experienced joiners." Honest without being off-putting.
- Explicitly says "You don't need to know anything about cabinetry." This is permission. She relaxes.
- Sets accurate time expectation: "about 15-20 minutes, and you can save and come back anytime." Not "a few minutes" (misleading).
- One button. No choices. Just "Let's Go."
- Skippable for returning users — if she's been through the flow before and starts a new design, skip straight to Photo Capture (Screen 3).

---

### SCREEN 3: Photo Capture

Before the camera opens, she sees a helper screen.

```
+--------------------------------+
|                                |
|  What we need:                 |
|                                |
|  +----------------------------+|
|  | [example photo -- a normal ||
|  |  kitchen, slightly messy,  ||
|  |  showing full wall]        ||
|  |                            ||
|  | alt: "Example kitchen      ||
|  | photo showing a typical    ||
|  | L-shaped kitchen with      ||
|  | appliances and benchtops"  ||
|  +----------------------------+|
|                                |
|  Stand back so we can see      |
|  the full area. Don't worry    |
|  about mess -- we just need    |
|  to see the walls and space.   |
|                                |
|  We'll ask to use your camera  |
|  -- we only use it for this    |
|  photo, nothing else.          |
|                                |
|  +----------------------------+|
|  |   Open Camera              ||
|  +----------------------------+|
|                                |
|  or upload a photo >           |
|                                |
|  Skip for now -- I'll enter    |
|  my measurements instead >     |
|                                |
+--------------------------------+
```

**Key decisions:**
- Example photo is a REAL kitchen — not perfectly styled. Slightly messy. This tells Sarah "your kitchen is fine as it is."
- "Don't worry about mess" — explicit reassurance.
- Camera permission pre-empted: "We'll ask to use your camera — we only use it for this photo, nothing else." Reduces permission-dialog anxiety.
- "Skip for now" option leads to Manual Entry path (see below).
- Upload option for people who already have a photo.
- Multi-photo support: After first photo, AI may ask "Can you get a photo of the other wall too?" for large or complex kitchens.
- Photos compressed client-side before upload: JPEG at 0.7 quality. Reduces upload time and storage cost.

**Manual Entry path (if "Skip for now" tapped):**

```
+--------------------------------+
|                                |
| NS  "No worries -- let's do   |
|      it manually. What shape   |
|      is your kitchen?"         |
|                                |
|  +------+ +------+ +------+   |
|  |  ___ | | |__  | | |__|  |  |
|  | |    | | |    | | |  |  |  |
|  |Strght| | L    | | U    |  |
|  +------+ +------+ +------+   |
|  +------+                      |
|  | ==== |                      |
|  | ==== |                      |
|  |Galley|                      |
|  +------+                      |
|                                |
+--------------------------------+
```

After shape selection, show dimension entry with prominent +/- steppers (increment 0.1m). Pre-filled with common defaults (e.g. 3.0m for long wall). This feeds directly into Screen 4b (dimension confirmation).

**Camera view:**

```
+--------------------------------+
|                                |
|                                |
|   [live camera with subtle     |
|    guide overlay -- soft       |
|    rectangle showing ideal     |
|    framing area, not strict]   |
|                                |
|                                |
|                                |
+--------------------------------+
| NS  "Try to fit the whole     |
|      wall in the frame"        |
|                                |
|          ( O )                 |
|                                |
| gallery              flash    |
+--------------------------------+
```

- Subtle framing guide, not a rigid box.
- AI message at bottom is contextual guidance.
- Big shutter button (minimum 44x44px).
- After capture: quick preview with "Use this" / "Retake" options.

---

### SCREEN 4: Wall Detection (AI-Led) — SIMPLIFIED

**This is split into two sub-screens. NO photo overlay. NO coloured regions on the photo.**

#### SCREEN 4a: Wall Confirmation

The AI analyses the photo and returns a TEXT description. Sarah confirms the shape.

```
+--------------------------------+
| <- Back                        |
|                                |
| NS  "I can see two walls       |
|      forming an L-shape.       |
|      About 2.4m and 1.8m."    |
|                                |
|  +----------------------------+|
|  |                            ||
|  |  [ ] Wall A: Long wall     ||
|  |      ~ 2.4m               ||
|  |                            ||
|  |  [ ] Wall B: Side wall     ||
|  |      ~ 1.8m               ||
|  |                            ||
|  +----------------------------+|
|                                |
|  "These are rough estimates    |
|   -- we'll do an exact         |
|   measure before anything      |
|   is built."                   |
|                                |
|  +----------------------------+|
|  |   Yes, that looks right    ||
|  +----------------------------+|
|                                |
|  Not quite right? >            |
|                                |
+--------------------------------+
```

**Key decisions:**
- AI returns plain TEXT, not an overlay on the photo. No coloured regions. No complex computer vision UI.
- Simple checklist: each detected wall with label + estimated dimension.
- Walls labelled in plain language: "Long wall", "Side wall", "Window wall" — not Wall 1, Wall 2.
- Strong reassurance: "These are rough estimates — we'll do an exact measure before anything is built."
- Primary path: "Yes, that looks right" → goes to Screen 4b for dimension fine-tuning.
- "Not quite right?" fallback → lets Sarah tap corners on the photo to indicate walls (secondary path, rarely needed).
- Dimensions always in METRES. Never millimetres.

#### SCREEN 4b: Dimension Confirmation

A clean 2D schematic (NOT the photo) with +/- steppers for each wall.

```
+--------------------------------+
| <- Back                        |
|                                |
| NS  "Let's check the           |
|      measurements. Adjust if   |
|      you know better -- but    |
|      don't worry, we'll        |
|      measure properly later."  |
|                                |
|  +----------------------------+|
|  |                            ||
|  |  +-------- 2.4m --------+ ||
|  |  |                       | ||
|  |  |                       | ||
|  |  |   [2D schematic of    | ||
|  |  |    L-shape layout,    | ||
|  |  |    clean line drawing] | ||
|  |  |                       | ||
|  |  +-----+                 | ||
|  |        |   1.8m          | ||
|  |        |                 | ||
|  |        +-----------------+ ||
|  |                            ||
|  +----------------------------+|
|                                |
|  Wall A: Long wall             |
|  [-]  2.4m  [+]               |
|                                |
|  Wall B: Side wall             |
|  [-]  1.8m  [+]               |
|                                |
|  +----------------------------+|
|  |   Looks Good              ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

**Key decisions:**
- Clean 2D schematic diagram showing the room shape — NOT the photo. This is easier to read and less confusing than overlaying dimensions on a photo.
- Prominent +/- steppers (increment 0.1m) for each wall dimension. Large touch targets.
- The schematic updates as dimensions change.
- "Looks Good" proceeds to Discovery.

---

### SCREEN 5: Discovery — The Conversation (3 Questions)

Compressed from 5 questions to 3. Budget question moved to AFTER the design reveal (Screen 7). One question at a time. No forms.

The AI has context: it has her photo, her walls, and the room analysis. It adapts its questions based on what it can already see.

**Progress indicator visible throughout:**
Thin progress bar with grouped labels: "Your Space -> Your Style -> Your Design -> Your Quote"
Also: "Question 1 of 3" text.

**Back navigation available on all discovery screens.**

#### Question 1: Purpose

May be auto-detected from photo. If so, confirm with single tap.

```
+--------------------------------+
| <- Back           Q1 of 3     |
| [====----------- ] Your Style |
|                                |
| NS  "Looks like this is a     |
|      kitchen -- is that        |
|      right?"                   |
|                                |
|  +----------------------------+|
|  |  [x] Yes, it's a kitchen  ||
|  +----------------------------+|
|                                |
|  Or are you looking at:        |
|                                |
|  +------------+ +------------+ |
|  | [photo]    | | [photo]    | |
|  | Pantry     | | Laundry    | |
|  | & Storage  | |            | |
|  +------------+ +------------+ |
|  +------------+ +------------+ |
|  | [photo]    | | [photo]    | |
|  | Bathroom   | | Something  | |
|  | Vanity     | | Else       | |
|  +------------+ +------------+ |
|                                |
|  chat: Ask anything...         |
+--------------------------------+
```

Cards are LARGE with real photos. Not icons. All photos have descriptive alt text.
If auto-detected, the "Yes" confirmation is the primary action — one tap and move on.
"Something Else" opens the chat for free-text input.
"Not sure yet" / skip always available.

#### Question 2: Style A/B Pairs

Instead of asking her to pick "Coastal" or "Shaker" — show PAIRS of real kitchens and ask which she prefers. Like a vision test. MAX 2 rounds.

```
+--------------------------------+
| <- Back           Q2 of 3     |
| [========------- ] Your Style |
|                                |
| NS  "Which of these feels      |
|      more like you?"           |
|                                |
| +-------------++--------------+|
| |             ||              ||
| | [Kitchen A  || [Kitchen B   ||
| |  white,     ||  dark timber,||
| |  minimal,   ||  warm,       ||
| |  bright]    ||  textured]   ||
| |             ||              ||
| | "Light      || "Warm        ||
| |  & airy"    ||  & rich"     ||
| +-------------++--------------+|
|                                |
|  Can't decide? That's fine >   |
|                                |
+--------------------------------+
```

**Key decisions:**
- MAX 2 rounds of A/B pairs. Not 3. Keeps it fast.
- Every photo has alt text AND visible text labels ("Light & airy" / "Warm & rich"). Accessible to screen readers and clear for everyone.
- On screens <380px wide: show ONE image at a time with swipe (not side-by-side). Prevents tiny, useless thumbnails on small phones.
- Tap-to-expand on any photo for a closer look.
- After 2 rounds, show a summary confirmation:

```
+--------------------------------+
|                                |
| NS  "Based on your choices,    |
|      I'm thinking light, warm  |
|      tones with a classic      |
|      feel."                    |
|                                |
|  +----------------------------+|
|  |   That's right             ||
|  +----------------------------+|
|                                |
|  Not quite -- let me explain > |
|                                |
+--------------------------------+
```

- "Not quite" opens chat for her to clarify in her own words.
- "Can't decide?" at any point: "That's fine — I'll show you a few different directions."

#### Question 3: Priorities + Anything Else (Merged)

Priorities (multi-select) and "anything else?" combined into one screen with suggestion chips.

```
+--------------------------------+
| <- Back           Q3 of 3     |
| [============--- ] Your Style |
|                                |
| NS  "What matters most to      |
|      you? Pick as many as      |
|      you like."                |
|                                |
|  [ ] Lots of storage           |
|  [ ] Clean, minimal look       |
|  [ ] Easy to keep clean        |
|  [ ] Best value for money      |
|  [ ] Wow factor                |
|                                |
|  Anything specific you want?   |
|                                |
|  [Wine rack] [Soft-close]      |
|  [Pet bowls] [Recycling bin]   |
|  [Spice drawer] [Appliance     |
|   cupboard]                    |
|                                |
|  +----------------------------+|
|  | Type here or skip...       ||
|  +----------------------------+|
|                                |
|  +----------------------------+|
|  |   That's Everything        ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

**Key decisions:**
- Multi-select priorities in plain language. No "aesthetic" or "functionality."
- Suggestion chips for common specific requests — she can tap or type her own.
- Free text field for anything else: "I've always wanted a wine rack" or "I need a spot for the dog bowls."
- "Not sure yet" / skip always available.
- BUDGET is NOT asked here. It moves to Screen 7 (after the design reveal).

---

### SCREEN 6: AI Creates the Design

```
+--------------------------------+
|                                |
|  +----------------------------+|
|  |                            ||
|  | [Sarah's photo, gently    ||
|  |  visible in background,   ||
|  |  softly blurred]          ||
|  |                            ||
|  +----------------------------+|
|                                |
| NS  "Creating a picture of    |
|      your new kitchen...       |
|      this usually takes about  |
|      30 seconds."              |
|                                |
|  =====------------ 40%        |
|  (respects reduced-motion:     |
|   static bar, no animation)    |
|                                |
|  Done:  Understanding your     |
|         space                  |
|  Done:  Matching your style    |
|  Now:   Designing your layout  |
|  Next:  Creating your kitchen  |
|         picture                |
|                                |
+--------------------------------+
```

**Key decisions:**
- Time estimate shown: "this usually takes about 30 seconds." Manages expectations.
- Her photo is visible — she sees HER space being worked on.
- Progress steps use plain language (no jargon):
  - "Understanding your space" (not "Analysing room geometry")
  - "Matching your style" (not "Processing style vectors")
  - "Designing your layout" (not "Generating module configuration")
  - "Creating your kitchen picture" (not "Rendering")
- Progress animation respects `prefers-reduced-motion` — show a static progress bar with percentage, no pulsing/spinning.
- `aria-live="polite"` on progress step updates for screen readers.

**If >45 seconds:**
```
| NS  "Taking a bit longer than  |
|      usual -- I'll let you      |
|      know when it's ready.      |
|      Feel free to leave and     |
|      come back."                |
|                                 |
|  [Notify me when ready]         |
```

**Backend architecture (Convex scheduled function pattern):**
1. Client creates a `generationJob` record in Convex (`status: "pending"`).
2. A Convex action picks up the job, calls AI services, writes results back.
3. Client subscribes to the job via `useQuery` — when `status` changes to `"completed"`, results appear automatically.
4. This works even if Sarah backgrounds the app or closes it entirely. The job runs server-side.
5. NOT client-side state. NOT polling. Convex reactive queries handle it.

**What the AI actually does behind the scenes:**
1. Analyses the photo + walls + dimensions (Claude Sonnet).
2. Using her style preferences + priorities:
   - Produces HIGH-LEVEL INTENT: "4 base cabinets: drawers, sink, drawers, corner carousel. 3 wall cabinets."
   - Layout engine converts intent to valid CabinetConfig (see Technical Architecture).
   - Picks appropriate door style, materials, hardware from catalog.
3. Pre-generates 2-3 design directions during processing (not sequential generate-wait-evaluate). The primary direction is presented; alternatives available on request.
4. Generates rendered images via Gemini pipeline with enhanced prompts.
5. Calculates a price RANGE estimate via pricing engine.
6. Packages everything into a presentable design brief.

**State persists.** If she backgrounds the app (kid calling), it continues server-side. When she comes back, if it's done, results appear immediately.

---

### SCREEN 7: Design Presentation — The Big Reveal

The AI presents its design the way a designer would present to a client.
Not a dump of renders — a guided presentation.

```
+--------------------------------+
|                                |
|   [confetti animation          |
|    -- subtle, brief,           |
|    skipped if reduced-motion]  |
|                                |
| NS  "Here's what I've put      |
|      together for your          |
|      kitchen, Sarah."           |
|                                |
|  +----------------------------+|
|  |                            ||
|  | [beautiful render of her   ||
|  |  kitchen with new          ||
|  |  cabinetry -- in her       ||
|  |  actual space]             ||
|  |                            ||
|  | alt: "AI-generated image   ||
|  | of L-shaped kitchen with   ||
|  | light oak doors, brass     ||
|  | handles, and a corner      ||
|  | carousel"                  ||
|  |                            ||
|  +----------------------------+|
|                                |
|     [<]   * o o   [>]          |
|                                |
+--------------------------------+
| NS  "Light oak doors with      |
|      brass handles. I've put   |
|      drawers near the cooktop, |
|      and used the corner for   |
|      a carousel so nothing's   |
|      wasted."                  |
|                                |
|  Estimated: $10,000 - $13,000  |
|  This covers cabinets and      |
|  doors. Benchtop, installation,|
|  and plumbing quoted           |
|  separately.                   |
|                                |
|  [Share]  [Save]               |
|                                |
|  +----------------------------+|
|  | Customize This Design ->   ||
|  +----------------------------+|
|  Try a different direction >   |
+--------------------------------+
```

**Key decisions:**
- Confetti/celebration animation on first reveal. Brief, tasteful. Respects `prefers-reduced-motion` (skipped entirely if set).
- The AI EXPLAINS the design in plain language. Not "4x base modules, 2x overhead, shaker profile" — instead: "drawers near the cooktop, carousel in the corner."
- **Price shown as RANGE** immediately: "$10,000 - $13,000" (not a single point estimate).
- **Explicit inclusion/exclusion:** "This covers cabinets and doors. Benchtop, installation, and plumbing are quoted separately." Meets Australian Consumer Law requirements.
- Multiple render views via swipe with VISIBLE prev/next buttons (`[<]` and `[>]`) on ALL screen sizes. Not hidden on mobile. Not swipe-only.
- All render images have AI-generated alt text descriptions for accessibility.
- `aria-live="polite"` on the price display.

**Budget question — asked HERE, not in discovery:**
```
+--------------------------------+
|                                |
| NS  "I've designed this with   |
|      mid-range materials at    |
|      around $10,000-$13,000.   |
|      Does that range work      |
|      for you?"                 |
|                                |
|  +----------------------------+|
|  |  That works for me         ||
|  +----------------------------+|
|  +----------------------------+|
|  |  I'd like to spend less    ||
|  +----------------------------+|
|  +----------------------------+|
|  |  I'm happy to spend more   ||
|  |  for better quality         ||
|  +----------------------------+|
|  +----------------------------+|
|  |  Not sure yet              ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

This reframes budget as REFINEMENT, not limitation. She's seen the design first, now she reacts to the price. Much less confronting than asking budget upfront.

If she says "spend less": AI adjusts material selections and re-prices. "I can bring it down to $8,000-$10,000 by switching to laminate doors — still looks great."
If she says "spend more": AI upgrades materials. "For $14,000-$17,000 I can use solid timber doors and premium hardware."

**Share button:**
- Generates a single WhatsApp-optimized IMAGE containing: render + price range + one-line summary. Not a link that requires login.
- ALSO generates a shareable web link (no auth required) to a read-only design view. Uses `shareTokens` table for expiring, public-access URLs.
- Share options: WhatsApp, iMessage, email, save to photos, copy link.

**Other actions:**
- "Customize This Design" (not "Make It Mine" — clearer language) → goes to Fine-Tuning (Screen 8).
- "Try a different direction" → opens chat: "Tell me what you'd like to change" (not a full regeneration from scratch). AI can adjust style, materials, or layout based on her feedback.

---

### SCREEN 8: Fine-Tuning — Two-Mode Approach

**This replaces the old 4-step configurator.** Instead of empty steps that Sarah fills in, she sees HER complete design and taps to change things.

#### Browse Mode (Default)

Read-only view of the design. This is what she sees first.

```
+--------------------------------+
| <- Back             3D View    |
+--------------------------------+
|                                |
|  +----------------------------+|
|  |  [Top-down 2D floor plan  ||
|  |   of her kitchen --       ||
|  |   each cabinet is a       ||
|  |   labeled rectangle]      ||
|  |                           ||
|  |  +-------+-------+       ||
|  |  |Drawers| Sink  |       ||
|  |  +-------+-------+--+    ||
|  |                  |Corner| ||
|  |         +--------+Caro- | ||
|  |         | Oven   |ousel | ||
|  |         +--------+------+ ||
|  |         |Pantry  |       ||
|  |         +--------+       ||
|  |                           ||
|  +----------------------------+|
|                                |
|  Doors: Light oak, classic     |
|         framed                 |
|  Handles: Brass bar            |
|  Wall cabinets: 3 (2 standard, |
|    1 open shelf)               |
|                                |
+--------------------------------+
| NS  "Happy with everything?   |
|      Tap Done. Want to change  |
|      something? Tap Edit."     |
+-------------------------------+
|  $10,000-$13,000   [Done ->]  |
|                 [Change smth]  |
+-------------------------------+
```

**Key decisions:**
- Layout diagram is a TOP-DOWN FLOOR PLAN (bird's eye view), not a front elevation. This naturally handles L-shapes and U-shapes.
- Each cabinet is a labeled rectangle with minimum 44x44px touch target.
- Full ARIA labels on every cabinet rectangle: e.g. `aria-label="Base cabinet, drawers, position 1 of 4, 600mm wide"`.
- Price shown as range, updates on changes.
- `aria-live="polite"` on the price display.

**Accessible list-based alternative** (togglable, always available):
```
  Position 1: Drawers [Change]
  Position 2: Sink cabinet [Change]
  Position 3: Corner carousel [Change]
  Position 4: Oven cabinet [Change]
  Position 5: Pull-out pantry [Change]
  Wall 1: Standard cabinet [Change]
  Wall 2: Standard cabinet [Change]
  Wall 3: Open shelf [Change]
```
Fully accessible to switch/keyboard users. Each "Change" button opens the same selector as tapping the diagram.

#### Edit Mode

Taps "Change something" → sees categorized list:

```
+--------------------------------+
| <- Back to design              |
|                                |
| What would you like to change? |
|                                |
|  +----------------------------+|
|  | Layout                     ||
|  | Change what goes where     ||
|  +----------------------------+|
|  +----------------------------+|
|  | Door Style                 ||
|  | Change how the doors look  ||
|  +----------------------------+|
|  +----------------------------+|
|  | Handles                    ||
|  | Change the hardware        ||
|  +----------------------------+|
|  +----------------------------+|
|  | Extras                     ||
|  | Add wine racks, racks,     ||
|  | pull-outs, etc.            ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

Each category opens a FULL-SCREEN selector (not a bottom sheet — too cramped on mobile):

```
+--------------------------------+
| <- Back           Door Style   |
|                                |
|  +----------------------------+|
|  |                            ||
|  | [large photo of            ||
|  |  flat/smooth door          ||
|  |  on a cabinet]             ||
|  |                            ||
|  | Flat / smooth              ||
|  | Clean lines, modern look   ||
|  |                            ||
|  +----------------------------+|
|                                |
|  +----------------------------+|
|  |                            ||
|  | [large photo of            ||
|  |  classic framed door       ||
|  |  on a cabinet]  [CURRENT]  ||
|  |                            ||
|  | Classic framed             ||
|  | Timeless, works with       ||
|  | any style                  ||
|  |                            ||
|  +----------------------------+|
|                                |
|  +----------------------------+|
|  |                            ||
|  | [large photo of            ||
|  |  slim-framed door          ||
|  |  on a cabinet]             ||
|  |                            ||
|  | Slim framed                ||
|  | Modern take on a classic   ||
|  |                            ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

Every option has:
- A large, real photo (not a wireframe)
- A plain-English name (not "3-drawer base module")
- A one-line description of what it's good for
- Current selection clearly marked

After selection, returns to Browse mode. Design updates.

**Price behaviour:**
- Running price shown as RANGE, updates on changes.
- Price delta only shown if above a meaningful threshold. Phrased as "Still within your range" — NOT per-item "$400 more" (which creates micro-anxiety on every choice).
- **Budget guardrail:** If she's going over her stated range, the AI gently notes: "Getting close to the top of your range — want me to suggest where to save?"
- If she never stated a budget (chose "not sure"), no guardrail triggered.

**3D View** button in top right opens the 3D preview overlay (same PreviewOverlay mechanism, slides up Canvas3D). Available but never forced.

**When loading AI-generated layout:**
- Clear undo history (don't let undo go back to "before AI suggestion").
- Set AI suggestion as baseline.
- Add "Reset to original suggestion" button so she can always get back to the AI's starting point.

**Plain language mapping table:**

| Technical Term      | Sarah Sees              |
|---------------------|-------------------------|
| Module              | Cabinet                 |
| Slot                | Space / Position        |
| Blind corner        | Corner cabinet          |
| Lazy susan          | Corner carousel         |
| Slab door           | Flat / smooth door      |
| Shaker door         | Classic framed door     |
| Door profile        | Door style              |
| Overhead module     | Wall cabinet (upper)    |
| Base module         | Base cabinet (lower)    |
| Pull-out pantry     | Pull-out pantry (keep)  |
| Appliance tower     | Tall oven cabinet       |

---

### SCREEN 9: Review & Share

When Sarah taps "Done" in fine-tuning:

```
+--------------------------------+
| <- Edit                        |
|                                |
| NS  "Here's your final         |
|      design -- take a look      |
|      and make sure you're       |
|      happy."                    |
|                                |
|  +----------------------------+|
|  | [render of final design]   ||
|  | alt: "AI-generated view    ||
|  | of completed L-shaped      ||
|  | kitchen with light oak     ||
|  | classic framed doors..."   ||
|  +----------------------------+|
|                                |
|  Your Kitchen                  |
|  L-shape: 2.4m + 1.8m         |
|                                |
|  Lower cabinets:               |
|   - 4 total: drawers, sink    |
|     cabinet, corner carousel,  |
|     oven cabinet               |
|                                |
|  Wall cabinets (upper):        |
|   - 3 total: 2 standard,      |
|     1 open shelf               |
|                                |
|  Style:                        |
|   Light oak, classic framed    |
|   doors, brass bar handles     |
|                                |
|  Estimated: $10,000 - $13,000  |
|  Cabinets and doors only.      |
|  Final quote after site        |
|  measure -- we'll send someone |
|  to check measurements (free). |
|  The final price is usually    |
|  within 10% of this estimate.  |
|                                |
|  [Share with someone]          |
|                                |
|  +----------------------------+|
|  |   Get My Quote ->          ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

**Key decisions:**
- Summary in PLAIN LANGUAGE. "4 lower cabinets" not "4 base modules."
- Price as RANGE with clear inclusion note: "Cabinets and doors only."
- "Final quote after site measure" expanded into plain language: "We'll send someone to check measurements (free). The final price is usually within 10% of this estimate."
- **Share button** — same WhatsApp-optimized image + shareable web link as Screen 7.
- "Edit" button in top left — goes back to Screen 8 Browse mode.
- "Get My Quote" — clear what happens next. She's requesting a quote, not buying.

---

### SCREEN 10: Quote Request

```
+--------------------------------+
| <- Back                        |
|                                |
| NS  "Nearly there -- just a    |
|      few details so we can     |
|      get your quote sorted."   |
|                                |
|  Name: Sarah Mitchell          |
|  Email: sarah@email.com        |
|  Phone: (optional)             |
|                                |
|  +----------------------------+|
|  | Includes a no-obligation   ||
|  | site measure               ||
|  +----------------------------+|
|                                |
|  Anything else?                |
|  +----------------------------+|
|  | Notes...                   ||
|  +----------------------------+|
|                                |
|  +----------------------------+|
|  |   Request My Quote         ||
|  +----------------------------+|
|                                |
|  Talk to our team >            |
|  (phone or contact form link)  |
|                                |
| NS  "Once submitted, we'll    |
|      email you a formal        |
|      quote within 2-3          |
|      business days."           |
+--------------------------------+
```

**Key decisions:**
- Name/email pre-filled from her account.
- Phone optional — not everyone wants to give their number.
- "Request My Quote" (not "Submit Quote Request" — warmer, more personal).
- "Includes a no-obligation site measure" (not "Site measure (free)" with a checkbox — it's just included, less friction).
- "Talk to our team" link — phone number or contact form for people who want human contact. This is for Dave.
- Clear expectation: 2-3 business days.

**IMMEDIATE automated confirmation email sent on submission:**
- Render image included in email
- Design summary in plain language
- "What happens next" timeline
- Named person: "Hi Sarah, I'm James and I'll be preparing your quote"
- North South branding and contact details

---

### SCREEN 11: Confirmation

```
+--------------------------------+
|                                |
|  +----------------------------+|
|  | [render of her kitchen,   ||
|  |  prominently displayed]   ||
|  +----------------------------+|
|                                |
|   [subtle celebration          |
|    animation -- skipped if     |
|    prefers-reduced-motion]     |
|                                |
|   Quote request submitted      |
|                                |
| NS  "You're all set, Sarah.   |
|      I've sent everything to   |
|      our team. You'll get an   |
|      email shortly with the    |
|      details."                 |
|                                |
|  What happens next:            |
|                                |
|  1. Quote (2-3 business days)  |
|     |                          |
|  2. Site measure (we come to   |
|     you -- free)               |
|     |                          |
|  3. Approve your final design  |
|     |                          |
|  4. We build your kitchen      |
|     |                          |
|  5. Installation (4-6 weeks    |
|     from approval)             |
|                                |
|  +----------------------------+|
|  |   View My Designs          ||
|  +----------------------------+|
|                                |
|  Know someone renovating?      |
|  Share North South >           |
|                                |
|  Start a new design >          |
|                                |
+--------------------------------+
```

**Key decisions:**
- Render image shown prominently at top — this is the payoff, her kitchen.
- Personal: uses her name.
- Subtle celebration animation (confetti or check-mark bloom), respecting `prefers-reduced-motion`.
- **"What happens next" timeline** — shows the full journey from here to installed kitchen. Removes uncertainty about the process.
- **Referral prompt:** "Know someone renovating? Share North South" — natural word-of-mouth moment.
- "View My Designs" → Dashboard (Screen 12).
- "Start a new design" → new design flow.

---

### SCREEN 12: My Designs (Dashboard)

For returning users. This is home.

```
+--------------------------------+
| North South          [avatar]  |
+--------------------------------+
|                                |
| Good morning, Sarah            |
|                                |
| Your Designs                   |
|                                |
| +----------------------------+ |
| | [render thumb]  Kitchen    | |
| | L-shape, light oak         | |
| | Quote ready -- $11,200     | |
| | [View Quote] [Edit]        | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| | [render thumb]  Laundry    | |
| | Straight, white flat doors | |
| | Draft -- not submitted     | |
| | [Continue] [Edit]          | |
| +----------------------------+ |
|                                |
|  +----------------------------+|
|  |   + New Design             ||
|  +----------------------------+|
|                                |
|  Talk to our team >            |
|                                |
+--------------------------------+
| [Home]  [Chat]                 |
| (or [Home] [Designs] [Chat]   |
|  when designs exist)           |
+--------------------------------+
```

**Key decisions:**
- This is home for returning users. Uses her displayName ("Good morning, Sarah").
- Card-based designs with: thumbnail, type, status, actions.
- Statuses in plain language:
  - "Draft" — not submitted
  - "Quote requested" — waiting
  - "Quote ready — $11,200" — quote returned
  - "Ordered — in production" — active order
- **Price delta explanation:** If the formal quote differs from the app estimate, explain why: "The estimate was $10,000-$13,000. The final quote is $11,200 because [specific reason]."
- Tapping an active order card → opens full order detail view (not compressed into the card). Shows order status, timeline, next steps.
- "Talk to our team" accessible from dashboard — always available.
- Bottom nav simplified: Home | Chat (2 tabs during flow). Home | Designs | Chat (3 tabs when designs exist).

---

## AI Companion — Technical Architecture

### System Prompt (Core Identity)

Restructured with XML tags for clear section boundaries:

```xml
<identity>
You are the North South digital design assistant -- a calm, knowledgeable
guide who helps homeowners design custom cabinetry. You are powered by smart
technology and backed by a team of experienced joiners.
</identity>

<scope>
You help with: kitchen/laundry/bathroom cabinetry design, layout advice,
material selection, style guidance, pricing questions about North South
products.

You do NOT help with: plumbing, electrical, structural work, benchtops,
appliances, or non-North-South products. For these, say: "That's outside
my area -- I'd recommend chatting with our team or a licensed tradie for
that."
</scope>

<role>
You are a GUIDE in consultant mode during design generation/presentation
(you make recommendations backed by user preferences). You switch to
advisor mode during fine-tuning/chat (you answer questions and explain
trade-offs but don't push changes unless asked).
</role>

<output_format>
Guide messages: 1-2 sentences max. Plain text only. No markdown, no lists,
no headers.
Chat messages: As long as needed. Plain text, may use short lists for
comparisons.
Always return JSON: {"message": "...", "action": "optional_action_type"}
</output_format>

<tone>
Warm but concise. Confident. Conversational, not corporate.
Never condescending. Never use excessive praise ("Great choice!", "Love
it!", "Perfect!").
Match the user's communication style -- if they use technical terms, mirror
that level.
Use their name occasionally (not every message).
</tone>

<uncertainty>
When confidence is below 70%, say "I think" or "about" rather than stating
as fact.
For dimensions: always say "approximately" and add "we'll confirm with a
site measure."
When you genuinely don't know: "I'm not sure about that -- our team can
help."
</uncertainty>

<safety>
If user mentions exposed wiring, mold, structural damage, or safety
hazards: "That sounds like it needs a professional inspection before we
design anything. I'd recommend getting a licensed builder or inspector to
take a look first."
</safety>

<prohibited>
- Never use: module, slot, slab, profile, render, configure, pipeline
- Never use millimetres -- always metres
- Never mention AI, algorithms, machine learning, or models
- Never give unsolicited opinions in advisor mode
- Never validate choices with praise -- just confirm and move forward
- Never rush the user
</prohibited>

<jargon_map>
module -> cabinet, slot -> space/position, blind corner -> corner cabinet,
lazy susan -> corner carousel, slab door -> flat/smooth door,
shaker -> classic framed, door profile -> door style,
overhead -> wall cabinet (upper), base -> base cabinet (lower),
appliance tower -> tall oven cabinet, rendering -> creating your kitchen
picture
</jargon_map>

<deflection>
If asked "what model are you" or "are you AI": "I'm your design assistant
from North South, drawing on years of experience designing kitchens like
yours."
If asked about competitors: "I can only speak to what we offer at North
South."
</deflection>
```

### Guide Layer vs Chat Layer

```
GUIDE LAYER (the pill / inline messages):
- NO LLM CALLS. Pre-written copy with variable interpolation.
- Templates with string interpolation from session data.
- Example: "I can see ${wallCount} walls -- ${shapeDescription}. About
  ${dim1}m and ${dim2}m."
- ONLY call LLM for genuine edge cases (detection failure, unexpected input).
- Cost: $0.00 per guide message.

CHAT LAYER (the full bottom sheet):
- Claude Haiku (fast, cheap, sufficient for domain-constrained chat).
- Temperature: 0.4-0.5 (not 0.7 -- more consistent for domain-constrained
  assistant).
- Full context injection per call.
- Post-processing jargon filter: check every response against prohibited
  words list before displaying.
- Conversation history: keep last 10 messages verbatim, summarize older
  messages into ~200 token summary.
- Only active when user opens chat or asks a question.
```

### Context Injection (Per Step)

Each screen injects additional context into the AI's system prompt:

```
CURRENT_STEP: wall_detection
USER_PHOTO: [analysis summary -- room type, detected walls, lighting, etc.]
WALLS_SELECTED: [{label: "Long wall", length_m: 2.4}, {label: "Side wall",
  length_m: 1.8}]
USER_PREFERENCES: {purpose: "kitchen", style_signals: ["light", "warm",
  "classic"], budget: "8-15K", priorities: ["storage", "clean look"]}
DESIGN_STATE: {doors: "light-oak-shaker", hardware: "brass-bar", layout: [...]}
CONVERSATION_HISTORY: [last 10 messages + summary of older]
USER_NOTES: ["wants wine rack", "concerned about corner space", "husband
  prefers darker handles"]

GUIDE_BEHAVIOUR_THIS_STEP:
- Confirm detected walls and dimensions
- Ask user to select which walls they want cabinetry on
- If walls detected badly, offer manual fallback
- Do NOT discuss styles, materials, or layout yet
```

**Context injection strategy:**
- Product catalog: pre-transform to plain language BEFORE injection (no raw product codes in the prompt).
- Only inject relevant catalog items (filter by budget range, detected style preferences).
- Separate design-generation calls (needs catalog, no chat history) from chat calls (needs history, summary of design state).

### Memory Extraction

- Use Claude `tool_use`: define an `update_user_context` tool.
- After each discovery interaction, AI can call the tool to update preferences.
- Validate extracted data with Zod schema.
- Append-only for arrays (specificRequests, concerns) — never overwrite.
- Latest-wins for scalars (budget, purpose) — last value replaces previous.

### Model Selection

| Task                  | Model          | Reason                                |
|-----------------------|----------------|---------------------------------------|
| Photo analysis        | Claude Sonnet  | Comparable vision quality, 5x cheaper than Opus |
| Wall detection        | Claude Sonnet  | Structured output, good spatial reasoning |
| Layout generation     | Claude Sonnet  | Structured output for cabinet intent  |
| Chat companion        | Claude Haiku   | Fast, cheap, sufficient for constrained domain |
| Guide layer           | NO MODEL       | Templates with variable interpolation |
| Render generation     | Gemini         | Existing pipeline, enhanced prompts   |

### Cost Per Session (Estimated)

| Component                           | Cost       |
|-------------------------------------|------------|
| Photo analysis (Sonnet)             | ~$0.02     |
| Wall detection (Sonnet)             | ~$0.02     |
| Layout generation (Sonnet)          | ~$0.03     |
| Chat (Haiku, ~10 messages)          | ~$0.01     |
| Renders (Gemini, 3 images)          | ~$0.10-0.20|
| Context extraction (5 tool calls)   | ~$0.01     |
| **Total per session**               | **~$0.20-0.30** |
| Demo mode                           | **$0.00** (cached) |

---

## Technical Architecture

### Layout Engine (NEW — deterministic TypeScript)

**Location:** `src/lib/engine/layout-engine.ts`

The AI does NOT produce a full cabinet configuration. It produces HIGH-LEVEL INTENT:

```
"4 base cabinets: drawers, sink, drawers, corner carousel.
 3 wall cabinets: standard, standard, open shelf."
```

The layout engine converts this intent to a valid `CabinetConfig`:
- Module widths sum to wall length exactly (no gaps, no overflow).
- Corner pieces placed at wall junctions automatically.
- Constraint enforcement:
  - Sink needs plumbing wall position.
  - Rangehood above cooktop position.
  - Minimum widths per module type.
- X-position calculation for every slot.
- Gap filling with scribe fillers where needed.
- Validate against same rules as `useWizardStore` `canProceed`.

Built as a pure TypeScript function — no side effects, fully testable.

### Pricing Engine (NEW)

**Location:** `src/lib/engine/pricing-engine.ts`

- Sum module costs + material costs + hardware costs + door style costs from product catalog.
- Show as RANGE (+-15%): "low estimate — high estimate."
- Label clearly: "Cabinetry supply only" or "Including installation estimate" based on user's preference.
- Must have real product catalog data seeded before Phase 4.
- Pure TypeScript function — no side effects, fully testable.

### State Persistence

- **Keep** existing 1000ms debounced auto-save via `useAutoSave` hook (NOT every tap — would thrash the database).
- **ADD:** App backgrounding save via Capacitor `appStateChange` listener. When app goes to background, immediate save.
- **ADD:** Local-first layer with `localStorage` / `IndexedDB` for offline resilience. If Convex is unreachable, state saves locally and syncs when reconnected.
- **ADD:** Connection status indicator visible to user: "Saving..." / "Saved" / "Offline — saved locally."
- `designSessions` messages stored in SEPARATE `designSessionMessages` table (not embedded array) to avoid document bloat as conversations grow.

### Streaming

- **Guide layer:** No streaming needed (templates render instantly).
- **Chat layer:** Convex HTTP action returning `ReadableStream`, OR write partial tokens to a `streamingMessages` table with client subscription. Either approach works; HTTP action is simpler.
- **Processing:** Convex scheduled function pattern (job record with status subscription via `useQuery`).

### Convex Schema Additions

```typescript
// Design session -- one per active design flow
designSessions: defineTable({
  userId: v.id("users"),
  designId: v.optional(v.id("designs")),
  isDemo: v.boolean(),
  currentStep: v.string(), // validated union type of step names
  completedSteps: v.array(v.string()),
  photoUrl: v.optional(v.string()),
  photoAnalysis: v.optional(v.string()),
  walls: v.optional(v.array(v.object({
    label: v.string(),
    lengthM: v.number(),
    selected: v.boolean(),
  }))),
  userContext: v.object({
    purpose: v.optional(v.string()),
    styleSignals: v.optional(v.array(v.string())),
    budget: v.optional(v.string()),
    priorities: v.optional(v.array(v.string())),
    specificRequests: v.optional(v.array(v.string())),
    concerns: v.optional(v.array(v.string())),
    displayName: v.optional(v.string()),
  }),
  lastActiveAt: v.number(),
})

// Messages -- separate table to avoid document bloat
designSessionMessages: defineTable({
  sessionId: v.id("designSessions"),
  role: v.union(
    v.literal("assistant"),
    v.literal("user"),
    v.literal("system")
  ),
  content: v.string(),
  timestamp: v.number(),
  step: v.string(),
  layer: v.union(v.literal("guide"), v.literal("chat")),
}).index("by_session", ["sessionId", "timestamp"])

// AI generation jobs -- server-side processing
generationJobs: defineTable({
  sessionId: v.id("designSessions"),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
  ),
  progress: v.optional(v.string()),
  result: v.optional(v.any()),
  error: v.optional(v.string()),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_session", ["sessionId"])
 .index("by_status", ["status"])

// Shareable design links -- public access without auth
shareTokens: defineTable({
  designId: v.id("designs"),
  token: v.string(),
  expiresAt: v.number(),
}).index("by_token", ["token"])
```

---

## Accessibility Requirements

1. **WCAG 2.2 Level AA** compliance baseline for all screens.
2. **Remove `userScalable: false`** from viewport meta tag. Users must be able to zoom.
3. **All images:** descriptive alt text. AI-generated alt text for renders (e.g. "L-shaped kitchen with light oak classic framed doors, brass bar handles, and a corner carousel").
4. **All interactive elements:** 44x44px minimum touch targets (WCAG 2.5.8).
5. **All swipe/drag interactions:** visible button alternatives on ALL screen sizes. Never swipe-only.
6. **All colour-conveying UI:** non-colour alternative (patterns, text labels, icons). Never colour alone.
7. **`prefers-reduced-motion`** respected in ALL animated components:
   - Confetti/celebration → skipped entirely
   - Progress bars → static with percentage text
   - Video → static image
   - Transitions → instant or very brief
8. **`aria-live="polite"`** on: AI guide messages, price updates, progress step changes, save status indicator.
9. **Layout diagram:** full ARIA labels on every cabinet button (type, position, dimensions).
10. **Minimum text sizes:** 14px for interactive labels, 16px for body text. No `text-xs` for content.
11. **Minimum viewport:** 320px tested and supported. All layouts must work at 320px width.
12. **Skip links and landmark regions:** `<main>`, `<nav>`, `<aside>` used correctly. Skip-to-content link on every page.
13. **Keyboard navigation:** ALL flows completable via keyboard alone. Visible focus indicators.
14. **Screen reader:** Complete flow testable with VoiceOver (iOS) and TalkBack (Android). Regular testing required.

---

## Australian Consumer Law Compliance

- **AI disclosure:** "digital design assistant, powered by smart technology" — not hidden, present in AI Introduction screen.
- **Price estimates** clearly labeled as estimates: "Estimated: $10,000 - $13,000" with inclusion/exclusion clarity ("Cabinets and doors only. Benchtop, installation, and plumbing quoted separately.").
- **"No obligation"** language on quote requests: "Includes a no-obligation site measure."
- **No misleading claims** about what the app can do. AI stays within its scope.

---

## Navigation Architecture

### Tab Structure (Simplified)

Old: Home | Design | Orders | Chat (4 tabs)
New: Home | Chat (2 tabs during active flow, 3 when designs exist)

```
NEW STRUCTURE:
- / (home)
  - First time: Landing -> Auth -> Introduction -> Flow
  - Returning: Dashboard with design cards

- /design (active design session -- fullscreen, no tabs)
  - Photo capture (or manual entry)
  - Wall detection (4a: confirmation, 4b: dimensions)
  - Discovery (3 questions)
  - AI processing
  - Design presentation + budget question
  - Fine-tuning (browse/edit modes)
  - Review
  - Quote submission
  - Confirmation

- /chat (full AI chat -- always available)

- /share/:token (public read-only design view -- no auth required)

- /quote/:id (view a returned quote)
```

During the active design flow (camera through submission), the bottom tabs are HIDDEN. It's a fullscreen guided experience. The user navigates with back buttons and the AI's forward prompts.

---

## Interruption Recovery

Sarah WILL be interrupted. This is a non-negotiable design requirement.

**Rules:**
1. State saves via 1000ms debounced auto-save + immediate save on app background (Capacitor `appStateChange`). Local-first with `localStorage`/`IndexedDB` fallback.
2. If she backgrounds the app and comes back within 30 minutes:
   - Exact same screen, exact same state. No loading screen.
3. If she comes back after 30 minutes:
   - Dashboard shows her in-progress design with "Continue" button.
   - Tapping "Continue" opens the flow: "Welcome back, Sarah — you were choosing door styles. Want to pick up where you left off?"
4. If she comes back after days:
   - Dashboard shows design card with last-edited date.
   - "Continue" reopens the design with full context.
   - AI references where she was: "Last time you were looking at handles — your kitchen is nearly done."
5. AI processing (render generation) continues even if she leaves — Convex scheduled functions run server-side. When she returns, results are ready.
6. Connection status indicator always visible: "Saving..." / "Saved" / "Offline — saved locally."

---

## What Changes From Current Codebase

### Removed / Replaced
- StepDimensions (replaced by AI wall detection + dimension steppers)
- StepLayout (replaced by AI-generated layout + tap-to-change)
- StepFinishes (merged into fine-tuning screen)
- StepReview (replaced by design presentation + review screen)
- WizardShell 4-step navigation (replaced by linear guided flow)
- Home page photo pipeline (replaced by new camera + discovery flow)
- Separate Orders tab (merged into dashboard design cards)
- Old chat tab (replaced by AI companion chat)

### Kept / Modified
- Canvas3D + PreviewOverlay (kept — used in fine-tuning 3D preview)
- useCabinetStore (kept — still manages cabinet config state)
- SubmissionFlow (simplified — fewer pages, AI-guided)
- Convex schema (extended with designSessions, designSessionMessages, generationJobs, shareTokens)
- BottomNav (simplified to 2-3 tabs)
- TopBar/BottomBar (modified for fine-tuning screen)
- Product catalog/constants (kept — used by AI for design generation, pre-transformed to plain language)
- Auth flow (kept — enhanced with Google + Apple social login)

### New Components
- **LandingPage** — pre-auth value prop, social proof, demo entry
- **AIIntroduction** — first-time post-auth welcome with AI disclosure
- **PhotoHelper** — example photo + guidance + camera permission pre-empt
- **ManualEntry** — shape picker + dimension steppers (skip photo path)
- **WallConfirmation** — AI text-based wall detection, checkbox confirmation (4a)
- **DimensionConfirmation** — 2D schematic with +/- steppers (4b)
- **DiscoveryFlow** — 3-question conversational discovery with progress
- **DesignProcessing** — AI generating design, progress screen with job subscription
- **DesignPresentation** — the "big reveal" + budget question post-reveal
- **FineTuning** — two-mode browse/edit design editor with top-down floor plan
- **CategorySelector** — full-screen selector for Layout/Doors/Handles/Extras
- **DesignReview** — final review + share
- **QuoteRequest** — simplified submission with "Talk to our team" link
- **Confirmation** — timeline + referral + celebration
- **Dashboard** — returning user home with design cards + order detail
- **ShareView** — public read-only design view (no auth)
- **AIChatSheet** — bottom sheet full chat, available everywhere
- **AIGuidePill** — one-line contextual AI message bar (template-driven)
- **LayoutEngine** — AI intent to valid CabinetConfig (pure TypeScript)
- **PricingEngine** — catalog-based range pricing (pure TypeScript)

---

## Build Phases (Revised)

### Phase 1: Foundations (Layout Engine + Pricing + AI Testing)
- Layout engine: AI intent -> valid CabinetConfig (`src/lib/engine/layout-engine.ts`)
- Pricing engine: catalog-based, range output (`src/lib/engine/pricing-engine.ts`)
- AI testing harness: 50+ behavioral test cases covering system prompt compliance, jargon filtering, edge cases
- Product catalog seeded with real data (prices, materials, dimensions)
- Convex schema extensions (designSessions, designSessionMessages, generationJobs, shareTokens)
- Style presets mapping (style themes -> product catalog codes)
- Guide layer template system with variable interpolation

### Phase 2: Entry Flow + Share
- Landing page (pre-auth, value prop, social proof, `prefers-reduced-motion` video handling)
- Social login (Google + Apple) + email fallback + displayName collection
- AI Introduction screen with disclosure
- Share infrastructure (shareable web link via shareTokens, OG image generation, WhatsApp-optimized image generation)
- Demo mode with 100% cached responses (zero AI calls)
- "Talk to our team" contact link throughout

### Phase 3: Photo + Wall Detection + Discovery
- Photo helper + camera with guidance + permission pre-empt
- Manual entry path (skip photo -> shape picker + dimension steppers)
- Client-side photo compression (0.7 quality JPEG)
- Multi-photo support for large kitchens
- AI text-based wall detection (Claude Sonnet, no photo overlay)
- Wall confirmation UI (4a) + dimension adjustment UI (4b) with 2D schematic
- 3-question discovery flow with progress indicator and back navigation
- User context extraction via Claude `tool_use` + Zod validation

### Phase 4: AI Design Generation + Presentation
- Convex scheduled functions for generation jobs (server-side, survives app close)
- AI layout intent generation (Claude Sonnet structured output)
- Layout engine integration (intent -> valid CabinetConfig)
- Pre-generate 2-3 design directions during processing
- Render generation (existing Gemini pipeline, enhanced prompts)
- Processing screen with state persistence + >45s fallback
- Design presentation screen (the big reveal) with celebration animation
- Budget question post-reveal with AI-driven material adjustment
- Share functionality (WhatsApp image + web link)

### Phase 5: Fine-Tuning + Review
- Browse/Edit two-mode fine-tuning screen
- Full-screen category selectors (Layout, Doors, Handles, Extras) with large photos + plain language
- Top-down floor plan diagram (handles L/U/straight/galley shapes)
- List-based accessible alternative for keyboard/switch users
- Price range display with budget awareness and guardrails
- "Reset to original suggestion" button + cleared undo history on AI load
- 3D preview integration via PreviewOverlay
- Review screen with plain language summary + share

### Phase 6: Submission + Dashboard
- Simplified quote request flow with pre-filled fields
- "Talk to our team" link (phone/contact form)
- Immediate automated confirmation email with render, summary, timeline, named person
- "What happens next" timeline on confirmation screen
- Referral prompt on confirmation
- Dashboard for returning users with card-based designs
- Order detail view for active orders (not compressed into card)
- Interruption recovery (resume from dashboard with context)

### Phase 7: Accessibility + Polish
- WCAG 2.2 AA audit and fixes across all screens
- `prefers-reduced-motion` everywhere (video, confetti, progress bars, transitions)
- `aria-live` regions on all dynamic content (guide messages, prices, progress)
- Alt text on all images (AI-generated for renders)
- ARIA labels on all diagram elements
- 320px viewport testing and fixes
- Remove `userScalable: false` from viewport meta
- 44x44px touch target audit
- Skip links and landmark regions
- Keyboard navigation audit (all flows completable)
- Screen reader testing (VoiceOver + TalkBack)
- Offline-first state layer (localStorage/IndexedDB + sync queue)
- Connection status indicator
- Haptic feedback on key interactions (Capacitor)
- Transition animations between screens (respecting reduced motion)
- Confirmation email with render attachment

---

## Success Criteria (Updated)

Sarah says:

1. **"I designed my own kitchen"** — She feels ownership of the design. It's hers, not the computer's.
2. **"It was really easy"** — She never felt lost, confused, or overwhelmed. Every step was clear.
3. **"I know roughly what it costs"** — Price shown as a range, no shock, clear inclusions/exclusions. She knows what's included and what's separate.
4. **"I sent it to Dave"** — Share worked. Dave saw it on WhatsApp without downloading anything or creating an account. He could also open a web link to see the full design.
5. **"I can go back and change things"** — Nothing feels permanent. She can edit, undo, reset to the original suggestion.
6. **"Someone is helping me"** — The AI felt present, calm, and capable. She could ask questions in chat and get helpful answers.
7. **"I didn't need to know anything about kitchens"** — Zero jargon encountered. Every label, every description, every AI message used plain language.
8. **"I can talk to a real person if I need to"** — Human contact available throughout. "Talk to our team" link visible on submission, dashboard, and in chat.
9. **"It works on my phone"** — Accessible, fast, handles interruptions gracefully. Works offline. Resumes where she left off. Works on a small screen. Works with accessibility settings.
10. **"The quote was close to what the app said"** — Estimate accuracy within +-10%. Price range set realistic expectations. No sticker shock when the formal quote arrives.
