# Sarah's Perfect Kitchen — Complete UX Redesign Plan

> The goal: Sarah, a non-tech-savvy mum from western Sydney, opens this app
> and 20 minutes later feels like she just worked with a high-end kitchen
> designer. She has a design she's proud of, a price she expected, and she
> can't wait to show her husband.

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

---

## The Complete Flow

### SCREEN 0: Landing (Pre-Auth)

Sarah opens the app for the first time. She has NOT logged in.

```
+--------------------------------+
|                                |
|   [looping video/animation    |
|    of a kitchen transforming   |
|    — before → after, subtle,   |
|    beautiful, 5 seconds]       |
|                                |
+--------------------------------+
|                                |
|   See what your kitchen        |
|   could become.                |
|                                |
|   Custom cabinetry designed    |
|   around your space, your      |
|   style, your budget.          |
|                                |
|   Kitchens from $5,000.        |
|                                |
|  +----------------------------+|
|  |     Get Started            ||
|  +----------------------------+|
|                                |
|  Try with a sample space >     |
|                                |
+--------------------------------+
```

**Key decisions:**
- NO auth wall. She sees value first.
- Price range shown upfront — no surprises later.
- "Try with a sample space" lets her explore the full flow with a demo
  kitchen before committing her own photos. This is critical for someone
  who's browsing on the couch and isn't ready to take a photo.
- "Get Started" takes her to login/signup, THEN into the flow.

**Demo mode:** Uses a pre-loaded photo of a typical kitchen. Sarah goes
through the entire discovery + AI design flow with sample data. At the
end: "Love it? Do this with your own kitchen — sign up." This lets her
experience the magic before giving her email.

---

### SCREEN 1: Sign Up / Login

Standard auth. Email + password. Keep it minimal.

After first signup, she goes to the AI introduction.
After subsequent logins, she goes to her dashboard (Screen 12).

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
|   "Hi Sarah — I'm your        |
|   design consultant from       |
|   North South.                 |
|                                |
|   I'll guide you through       |
|   designing your perfect       |
|   kitchen, step by step.       |
|   You don't need to know       |
|   anything about cabinetry     |
|   — that's my job.             |
|                                |
|   All you need is a photo      |
|   of your space and a few      |
|   minutes. I'll handle         |
|   the rest.                    |
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
- Uses her actual name (from signup).
- Explicitly says "You don't need to know anything about cabinetry."
  This is permission. She relaxes.
- Sets time expectation: "a few minutes."
- One button. No choices. Just "Let's Go."

---

### SCREEN 3: Photo Capture

Before the camera opens, she sees a helper screen.

```
+--------------------------------+
|                                |
|  What we need:                 |
|                                |
|  +----------------------------+|
|  | [example photo — a normal  ||
|  |  kitchen, slightly messy,  ||
|  |  showing full wall]        ||
|  +----------------------------+|
|                                |
|  Stand back so we can see      |
|  the full area. Don't worry    |
|  about mess — we just need     |
|  to see the walls and space.   |
|                                |
|  +----------------------------+|
|  |   Open Camera              ||
|  +----------------------------+|
|                                |
|  or upload a photo >           |
|                                |
+--------------------------------+
```

**Key decisions:**
- Example photo is a REAL kitchen — not perfectly styled. Slightly messy.
  This tells Sarah "your kitchen is fine as it is."
- "Don't worry about mess" — explicit reassurance.
- "Stand back so we can see the full area" — simple, no jargon.
- Upload option for people who already have a photo.

**Camera view:**
```
+--------------------------------+
|                                |
|                                |
|   [live camera with subtle     |
|    guide overlay — soft        |
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
- Big shutter button.
- After capture: quick preview with "Use this" / "Retake" options.

---

### SCREEN 4: Wall Detection (AI-Led)

**This is the key change from the original plan.** Sarah does NOT trace
walls. The AI detects them and asks her to confirm.

```
+--------------------------------+
| <- Back                        |
|                                |
|  +----------------------------+|
|  | [Sarah's photo with walls  ||
|  |  highlighted by AI —       ||
|  |  coloured overlay on       ||
|  |  detected wall surfaces]   ||
|  |                            ||
|  |  Wall A: ===== (blue)      ||
|  |           |                ||
|  |  Wall B:  | (green)        ||
|  |           |                ||
|  +----------------------------+|
|                                |
+--------------------------------+
| NS  "I can see two walls      |
|      here — an L-shape.        |
|      Tap the ones where you    |
|      want cabinetry."          |
|                                |
|  [A: Long wall     ] [x]      |
|  [B: Side wall     ] [x]      |
|                                |
|  +----------------------------+|
|  |   Confirm                  ||
|  +----------------------------+|
+--------------------------------+
```

**How it works:**
1. AI analyses the photo and detects wall surfaces.
2. Each wall is highlighted with a distinct colour overlay.
3. Sarah sees labelled walls with checkboxes — she taps to include/exclude.
4. She does NOT place nodes or trace anything. She just confirms.
5. If AI missed a wall or got it wrong: "Not quite right? Draw it in"
   as a fallback, but the default path is tap-to-confirm.

**Key decisions:**
- AI does the hard work. Sarah just says yes/no.
- Walls labelled in plain language: "Long wall", "Side wall", "Window wall"
  — not Wall 1, Wall 2.
- If AI detects badly (poor photo, tricky angles): fallback to a simpler
  "tap the corners of each wall" interaction, but this should be the
  exception.
- Dimensions estimated and shown: "Long wall: about 2.4m"
- She can adjust dimensions with a simple +/- control if she knows better.

**Dimension display:**
Always in METRES with a relatable comparison.
"2.4m — about the width of a standard door frame times 3"
NOT millimetres. NOT ever.

---

### SCREEN 5: Discovery — The Conversation

This is a chat-style flow where the AI asks questions and Sarah responds
by tapping visual options. One question at a time. No forms.

The AI has context: it has her photo, her walls, and the room analysis.
It adapts its questions based on what it can already see.

**Question 1: What are you looking for?**

```
+--------------------------------+
|                                |
| NS  "What are you looking     |
|      to create in this         |
|      space?"                   |
|                                |
|  +------------+ +------------+ |
|  | [photo]    | | [photo]    | |
|  | New        | | Pantry     | |
|  | Kitchen    | | & Storage  | |
|  +------------+ +------------+ |
|  +------------+ +------------+ |
|  | [photo]    | | [photo]    | |
|  | Laundry    | | Something  | |
|  |            | | Else       | |
|  +------------+ +------------+ |
|                                |
|  chat: Ask anything...         |
+--------------------------------+
```

Cards are LARGE with real photos. Not icons.
"Something Else" opens the chat for free-text input.

**Question 2: Style preference (visual, no labels)**

Instead of asking her to pick "Coastal" or "Shaker" — show her PAIRS
of real kitchens and ask which she prefers. Like a vision test.

```
+--------------------------------+
|                                |
| NS  "Which of these feels      |
|      more like you?"           |
|                                |
| +-------------++--------------+|
| |             ||              ||
| | [Kitchen A  || [Kitchen B   ||
| |  white,     ||  dark timber,||
| |  minimal,   ||  moody,      ||
| |  bright]    ||  textured]   ||
| |             ||              ||
| +-------------++--------------+|
|                                |
|     <  or  >                   |
|                                |
+--------------------------------+
```

2-3 rounds of this narrows down her style precisely without her needing
to know ANY terminology. The AI figures out "she's leaning coastal/
hamptons with light tones" from her choices.

If she's unsure: "Can't decide? That's fine — I'll show you a few
different directions."

**Question 3: Budget**

```
+--------------------------------+
|                                |
| NS  "Just so I can tailor      |
|      things to your budget     |
|      — roughly what range      |
|      are you thinking?"        |
|                                |
|  +----------------------------+|
|  |  Under $8,000              ||
|  +----------------------------+|
|  +----------------------------+|
|  |  $8,000 - $15,000          ||
|  +----------------------------+|
|  +----------------------------+|
|  |  $15,000 - $25,000         ||
|  +----------------------------+|
|  +----------------------------+|
|  |  Not sure yet              ||
|  +----------------------------+|
|                                |
| NS  "No pressure — this just  |
|      helps me suggest the      |
|      right materials."         |
|                                |
+--------------------------------+
```

**Key decisions:**
- "Not sure yet" is always an option. No pressure.
- Reassurance: this is about materials, not commitment.
- The AI remembers this and tailors ALL future suggestions accordingly.
  If she says under $8K, it won't suggest premium stone benchtops.

**Question 4: Priorities (Multi-select)**

```
+--------------------------------+
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
|  +----------------------------+|
|  |   Continue                 ||
|  +----------------------------+|
|                                |
+--------------------------------+
```

Multi-select. Plain language. No "aesthetic" or "functionality" — just
normal words.

**Question 5: Anything else? (Optional)**

```
+--------------------------------+
|                                |
| NS  "Anything else I should    |
|      know about what you       |
|      want?"                    |
|                                |
|  Suggestion chips:             |
|  [Wine rack] [Soft-close]      |
|  [Pet bowls] [Recycling bin]   |
|  [Spice drawer] [Appliance     |
|   garage]                      |
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

Suggestion chips show common requests — she can tap or type her own.
This is where she might say "I've always wanted a wine rack" or "I
need a spot for the dog bowls." The AI stores this.

---

### SCREEN 6: AI Creates the Design

```
+--------------------------------+
|                                |
|  +----------------------------+|
|  |                            ||
|  | [Sarah's photo, her       ||
|  |  traced walls gently      ||
|  |  pulsing with colour]     ||
|  |                            ||
|  +----------------------------+|
|                                |
| NS  "Designing your kitchen... |
|      this usually takes about  |
|      30 seconds."              |
|                                |
|  =====------------ 40%        |
|                                |
|  Done:  Analysing your space   |
|  Done:  Matching your style    |
|  Now:   Creating your layout   |
|  Next:  Rendering your kitchen |
|                                |
+--------------------------------+
```

**Key decisions:**
- Time estimate shown: "about 30 seconds." Manages expectations.
- Her photo is visible — she sees HER space being worked on.
- Progress steps use plain language.
- **State persists.** If she backgrounds the app (kid calling), it
  continues. When she comes back, it picks up where it left off.
  If it's done, it shows results immediately.

**What the AI actually does behind the scenes:**
1. Analyses the photo + walls + dimensions.
2. Using her style preferences + budget + priorities:
   - Picks appropriate door style, materials, hardware
   - Designs a complete layout (which cabinets where)
   - Optimises for her priorities (max storage vs clean look etc.)
3. Generates rendered images of the design in her actual space.
4. Calculates a price estimate.
5. Packages everything into a presentable "design brief."

The AI is doing what a real designer would do: take the brief, go away,
come back with a proposal.

---

### SCREEN 7: Design Presentation — The Big Reveal

The AI presents its design the way a designer would present to a client.
Not a dump of renders — a guided presentation.

```
+--------------------------------+
|                                |
| NS  "Here's what I've put      |
|      together for your          |
|      kitchen."                  |
|                                |
|  +----------------------------+|
|  |                            ||
|  | [beautiful render of her   ||
|  |  kitchen with the new      ||
|  |  cabinetry — in her        ||
|  |  actual space]             ||
|  |                            ||
|  +----------------------------+|
|                                |
|     <- swipe for more ->       |
|         * o o                  |
|                                |
+--------------------------------+
| NS  "Light oak doors with      |
|      brass handles. I've put   |
|      drawers near the cooktop, |
|      and used the corner for   |
|      a carousel so nothing's   |
|      wasted."                  |
|                                |
|  Estimated cost: ~$11,500      |
|  (within your $8-15K range)    |
|                                |
|  [Share]  [Save]               |
|                                |
|  +----------------------------+|
|  |   Make It Mine ->          ||
|  +----------------------------+|
|  Try a different direction >   |
+--------------------------------+
```

**Key decisions:**
- The AI EXPLAINS the design in plain language. Not "4x base modules,
  2x overhead, shaker profile" — instead: "drawers near the cooktop,
  carousel in the corner."
- **Price shown immediately** with reference to her stated budget range.
  No shock. No surprise. "Within your $8-15K range" or "Slightly above
  your range — I can suggest changes to bring it down."
- **Share button** prominent. She WILL want to send this to her husband.
  Share via: iMessage, WhatsApp, email, save to photos.
- **"Try a different direction"** — not failure. Just options. AI can
  generate an alternative with different style/layout.
- **"Make It Mine"** — warm, non-committal language. Not "Use This Design"
  or "Purchase" or "Submit." It means: let me fine-tune this.
- Multiple render views available via swipe (front view, detail, overhead
  perspective).

---

### SCREEN 8: Fine-Tuning — The Interactive Design

**This replaces the old 4-step configurator.** Instead of empty steps
that Sarah fills in, she sees HER complete design and taps to change
things.

```
+--------------------------------+
| <- Back             3D View    |
+--------------------------------+
|                                |
|  +----------------------------+|
|  |  [2D layout diagram of    ||
|  |   her kitchen — filled    ||
|  |   with labelled cabinets  ||
|  |   that she can tap]       ||
|  |                           ||
|  |  Drawers | Sink | Drawers ||
|  |  -----corner carousel-----||
|  |          | Oven | Pantry  ||
|  +----------------------------+|
|                                |
|  Doors: Light Oak Shaker       |
|  Handles: Brass Bar            |
|  [tap to change]               |
|                                |
+--------------------------------+
| NS  "This is your kitchen.    |
|      Tap anything to change   |
|      it."                 ^   |
+-------------------------------+
|  ~$11,500           Done ->   |
+-------------------------------+
```

**How it works:**
- The layout is ALREADY FILLED IN. Every cabinet is placed. Every finish
  is chosen. The AI did this based on the discovery conversation.
- Sarah taps a cabinet → bottom sheet slides up with alternatives:

```
  +----------------------------+
  |  What goes here?           |
  |                            |
  |  [photo]  Drawers          |
  |           Great for pots   |  <- current selection
  |           and utensils     |     highlighted
  |                            |
  |  [photo]  Open Shelves     |
  |           Display your     |
  |           favourite pieces  |
  |                            |
  |  [photo]  Wine Rack        |
  |           Fits 12 bottles  |
  |                            |
  |  [photo]  Cabinet          |
  |           Classic storage   |
  |           with shelf       |
  +----------------------------+
```

Every option has:
- A real photo (not a wireframe)
- A plain-English name (not "3-drawer base module")
- A one-line description of what it's good for

- Sarah taps "Doors: Light Oak Shaker" → sees door style options as
  LARGE side-by-side photos she can swipe through. Each shows the door
  on a cabinet, not a flat sample.

- Running price updates with every change. If she swaps to a more
  expensive option: "That adds about $400" shown subtly.

- **Budget guardrails:** If she's going over her stated range, the AI
  gently notes it in the guide pill: "Getting close to $15K — want me
  to suggest where to save?"

- **3D View** button in top right opens the 3D preview overlay (same
  PreviewOverlay mechanism, slides up Canvas3D).

**Plain language mapping:**
| Old Term          | Sarah Sees          |
|-------------------|---------------------|
| Module            | Cabinet             |
| Slot              | Space / Position    |
| Blind corner      | Corner cabinet      |
| Lazy susan        | Corner carousel     |
| Slab door         | Flat / smooth door  |
| Shaker door       | Classic framed door |
| Door profile      | Door style          |
| Overhead module   | Wall cabinet        |
| Base module       | Base cabinet        |
| Pull-out pantry   | Pull-out pantry     |
| Appliance tower   | Tall oven cabinet   |

---

### SCREEN 9: Review & Share

When Sarah taps "Done" in fine-tuning:

```
+--------------------------------+
| <- Edit                        |
|                                |
| NS  "Here's your final         |
|      design — take a look       |
|      and make sure you're       |
|      happy."                    |
|                                |
|  +----------------------------+|
|  | [render of final design]   ||
|  +----------------------------+|
|                                |
|  Your Kitchen                  |
|  L-shape: 2.4m + 1.8m         |
|                                |
|  Cabinets:                     |
|   - 4 base: drawers, sink,    |
|     corner carousel, oven      |
|   - 3 wall: 2 standard,       |
|     1 open shelf               |
|                                |
|  Style:                        |
|   Light oak, classic framed    |
|   doors, brass bar handles     |
|                                |
|  Estimated total: $11,500      |
|  (Final quote after measure)   |
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
- Summary in PLAIN LANGUAGE. Not a spec sheet.
- "Estimated total" with "(Final quote after measure)" — manages
  expectations that this is approximate.
- **Share button.** She sends this to Dave. Dave looks at it over lunch
  at work. He texts back "looks good." This is how real kitchen
  decisions work — it's a household discussion.
- "Get My Quote" — clear what happens next. She's requesting a quote,
  not buying.
- "Edit" button in top left — she can go back and change things.

---

### SCREEN 10: Quote Request

```
+--------------------------------+
| <- Back                        |
|                                |
| NS  "Nearly there — just a     |
|      few details so we can     |
|      get your quote sorted."   |
|                                |
|  Name: Sarah Mitchell          |
|  Email: sarah@email.com        |
|  Phone: (optional)             |
|                                |
|  +----------------------------+|
|  | [ ] I'd like a site        ||
|  |     measure (free)         ||
|  | [ ] Include installation   ||
|  |     in the quote           ||
|  +----------------------------+|
|                                |
|  Anything else?                |
|  +----------------------------+|
|  | Notes...                   ||
|  +----------------------------+|
|                                |
|  +----------------------------+|
|  |   Submit Quote Request     ||
|  +----------------------------+|
|                                |
| NS  "Once submitted, we'll    |
|      email you a formal        |
|      quote within 2-3          |
|      business days."           |
+--------------------------------+
```

- Name/email pre-filled from her account.
- "Site measure (free)" — removes cost anxiety.
- Clear expectation: 2-3 business days.

---

### SCREEN 11: Confirmation

```
+--------------------------------+
|                                |
|                                |
|            ( check )           |
|                                |
|   Quote request submitted      |
|                                |
| NS  "You're all set, Sarah.   |
|      I've sent everything to   |
|      our team. You'll get an   |
|      email within 2-3 days    |
|      with your formal quote.   |
|                                |
|      Your design is saved —    |
|      you can view or edit it   |
|      anytime."                 |
|                                |
|  +----------------------------+|
|  |   View My Designs          ||
|  +----------------------------+|
|                                |
|  Start a new design >          |
|                                |
+--------------------------------+
```

- Personal: uses her name.
- Confirms what happens next.
- Reassurance: design is saved.
- Two paths: view designs or start another.

---

### SCREEN 12: My Designs (Dashboard)

For returning users. Replaces the old separate tabs approach.

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
| | Quote ready - $11,200      | |
| | [View Quote] [Edit]        | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| | [render thumb]  Laundry    | |
| | Straight, white slab       | |
| | Draft — not submitted      | |
| | [Continue] [Edit]          | |
| +----------------------------+ |
|                                |
|  +----------------------------+|
|  |   + New Design             ||
|  +----------------------------+|
|                                |
+--------------------------------+
| [Home]  [Designs]  [Chat]      |
+--------------------------------+
```

**Key decisions:**
- This is home for returning users.
- Each design card shows: thumbnail, type, status, actions.
- Statuses in plain language: "Draft", "Quote requested",
  "Quote ready — $11,200", "Ordered — in production"
- Bottom nav simplified: Home (this dashboard), Designs (if she has
  active ones), Chat (full AI chat).
- The Orders tab merges into design cards — each design shows its
  current status.

---

## AI Companion — Technical Architecture

### System Prompt (Core Identity)

```
You are the North South design companion — a calm, knowledgeable guide
who helps homeowners design custom cabinetry for their homes.

IDENTITY:
- You represent North South, a premium Australian cabinetry company.
- You have the knowledge of a master joiner with 30+ years of experience.
- You are warm, concise, and confident.

ROLE:
- You are a GUIDE. The user is the decision-maker.
- You explain each step, confirm actions, and keep things moving.
- You do NOT offer opinions or recommendations unless ASKED.
- You NEVER use jargon. Always plain language.
- You NEVER use excessive praise ("Great choice!", "Love it!", "Perfect!")

PROACTIVE (do without being asked):
- Explain what the current step is about
- Confirm user actions ("Two walls selected, about 2.4m and 1.8m")
- Transition between steps ("Walls are set. Now, a few quick questions.")
- Flag genuine issues ("That wall seems very short — want to check?")
- Show time estimates where relevant

REACTIVE (only when asked):
- Give design recommendations
- Explain trade-offs between options
- Suggest alternatives or improvements
- Discuss budget optimisation
- Share expert joinery knowledge

TONE:
- Warm but concise. 1-2 sentences max when proactive.
- Confident — you've done this thousands of times.
- Conversational, not corporate.
- Never condescending. She doesn't know jargon and that's fine.
- Use her name occasionally (not every message).

NEVER:
- Use millimetres. Always metres.
- Say "module" — say "cabinet."
- Say "slot" — say "space" or "position."
- Say "slab" — say "flat" or "smooth."
- Say "profile" — say "style."
- Validate choices with praise. Just confirm and move forward.
- Rush her. She decides the pace.
- Mention AI, algorithms, or technology. You're a design consultant.
```

### Context Injection (Per Step)

Each screen injects additional context into the AI's system prompt:

```
CURRENT_STEP: wall_detection
USER_PHOTO: [analysis summary — room type, detected walls, lighting, etc.]
WALLS_SELECTED: [{label: "Long wall", length_m: 2.4}, {label: "Side wall", length_m: 1.8}]
USER_PREFERENCES: {purpose: "kitchen", style_signals: ["light", "warm", "classic"], budget: "8-15K", priorities: ["storage", "clean look"]}
DESIGN_STATE: {doors: "light-oak-shaker", hardware: "brass-bar", layout: [...]}
CONVERSATION_HISTORY: [full chat history]
USER_NOTES: ["wants wine rack", "concerned about corner space", "husband prefers darker handles"]

GUIDE_BEHAVIOUR_THIS_STEP:
- Confirm detected walls and dimensions
- Ask user to select which walls they want cabinetry on
- If walls detected badly, offer manual fallback
- Do NOT discuss styles, materials, or layout yet
```

### Memory Schema (Convex)

```typescript
// New table: designSessions
designSessions: defineTable({
  userId: v.id("users"),
  designId: v.optional(v.id("designs")),

  // AI conversation
  messages: v.array(v.object({
    role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system")),
    content: v.string(),
    timestamp: v.number(),
    step: v.string(), // which screen this message was on
  })),

  // Extracted user context (AI-maintained)
  userContext: v.object({
    purpose: v.optional(v.string()),
    styleSignals: v.optional(v.array(v.string())),
    budget: v.optional(v.string()),
    priorities: v.optional(v.array(v.string())),
    specificRequests: v.optional(v.array(v.string())), // "wine rack", "dog bowl space"
    concerns: v.optional(v.array(v.string())),         // "budget", "corner space"
  }),

  // Photo & space data
  photoUrl: v.optional(v.string()),
  photoAnalysis: v.optional(v.string()),
  walls: v.optional(v.array(v.object({
    label: v.string(),
    lengthM: v.number(),
    selected: v.boolean(),
  }))),

  // Flow state
  currentStep: v.string(),
  completedSteps: v.array(v.string()),
  lastActiveAt: v.number(),
})
```

### Guide Layer vs Chat Layer

```
GUIDE LAYER (the pill / inline messages):
- Semi-scripted. AI adapts from templates.
- Low temperature (0.3). Predictable and consistent.
- Updates on step transitions and user actions.
- Always 1-2 sentences max.
- Example templates:
  - wall_detection.confirm: "I can see {wallCount} walls — an {shapeDescription}."
  - discovery.transition: "Got it. Now a few quick questions about what you want."
  - layout.module_placed: "{moduleName} placed in {position}."

CHAT LAYER (the full bottom sheet):
- Full conversational AI. Draws on complete context.
- Moderate temperature (0.7). Natural and helpful.
- Only active when user opens chat or asks a question.
- Can be as long as needed — this is a conversation.
- Has access to full joinery/design knowledge.
```

---

## Navigation Architecture

### Tab Structure (Simplified)

Old: Home | Design | Orders | Chat (4 tabs)
New: Home | Chat (2 tabs during active flow, 3 when designs exist)

```
NEW STRUCTURE:
- / (home)
  - First time: Introduction -> Camera -> Discovery -> Design flow
  - Returning: Dashboard with design cards
- /design (active design session — fullscreen, no tabs)
  - Wall detection
  - Discovery conversation
  - AI processing
  - Design presentation
  - Fine-tuning
  - Review
  - Submission
- /chat (full AI chat — always available)
- /quote/:id (view a returned quote)
```

During the active design flow (camera through submission), the bottom
tabs are HIDDEN. It's a fullscreen guided experience. The user navigates
with back buttons and the AI's forward prompts.

---

## Interruption Recovery

Sarah WILL be interrupted. This is non-negotiable design requirement.

**Rules:**
1. State saves to Convex after EVERY user action. Not on a timer.
   Every tap, every selection, every message — saved immediately.
2. If she backgrounds the app and comes back within 30 minutes:
   - Exact same screen, exact same state. No loading screen.
3. If she comes back after 30 minutes:
   - Dashboard shows her in-progress design with "Continue" button.
   - Tapping "Continue" opens the AI chat: "Welcome back, Sarah —
     you were choosing door styles. Want to pick up where you left off?"
4. If she comes back after days:
   - Dashboard shows design card with last-edited date.
   - "Continue" reopens the design with full context.
   - AI references where she was: "Last time you were looking at
     handles — your kitchen is nearly done."
5. AI processing (render generation) continues even if she leaves.
   When she returns, results are ready.

---

## What Changes From Current Codebase

### Removed / Replaced
- StepDimensions (replaced by AI wall detection + auto-dimensions)
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
- Convex schema (extended with designSessions table)
- BottomNav (simplified to 2-3 tabs)
- TopBar/BottomBar (modified for fine-tuning screen)
- Product catalog/constants (kept — used by AI for design generation)
- Auth flow (kept — moved to after landing page value prop)

### New Components
- LandingPage (pre-auth value prop)
- AIIntroduction (first-time post-auth welcome)
- PhotoHelper (example photo + guidance before camera)
- WallDetection (AI-detected walls, tap to confirm)
- DiscoveryChat (conversational style/budget/priority questions)
- DesignProcessing (AI generating design, progress screen)
- DesignPresentation (the "big reveal" — render + AI explanation)
- FineTuning (tap-to-change interactive design editor)
- DesignReview (final review + share)
- Dashboard (returning user home with design cards)
- AIChatSheet (bottom sheet full chat, available everywhere)
- AIGuidePill (one-line contextual AI message bar)

---

## Build Phases

### Phase 1: Foundation
- AI companion infrastructure (Convex schema, context system, system prompt)
- AIChatSheet + AIGuidePill components
- Basic chat with context injection working end-to-end

### Phase 2: Entry Flow
- LandingPage (pre-auth)
- AIIntroduction (post-auth, first time)
- PhotoHelper + Camera integration
- Demo mode with sample kitchen

### Phase 3: Wall Detection + Discovery
- AI wall detection from photo (Claude Vision)
- Wall confirmation UI
- Discovery conversation flow (5 questions)
- User context extraction and storage

### Phase 4: AI Design Generation
- Layout generation from user context
- Render generation (existing Gemini pipeline, enhanced with context)
- Design presentation screen
- Processing screen with state persistence

### Phase 5: Fine-Tuning
- Interactive design editor (tap-to-change)
- Module selection bottom sheets (plain language)
- Finish selection with large previews
- Running price display with budget awareness
- 3D preview integration

### Phase 6: Review + Submission
- Design review with share functionality
- Simplified quote request flow
- Confirmation with AI message
- Dashboard for returning users

### Phase 7: Polish
- Transitions and animations between screens
- Haptic feedback on key interactions
- Interruption recovery testing
- Share functionality (render images + summary)
- Demo mode completion

---

## Success Criteria

Sarah's test: After using this app, Sarah should be able to say:

1. "I designed my own kitchen" (she feels ownership)
2. "It was really easy" (she never felt lost or confused)
3. "I know roughly what it costs" (no surprises)
4. "I sent it to Dave" (she could share it)
5. "I can go back and change things" (she doesn't feel locked in)
6. "Someone is helping me" (the AI felt present and capable)
7. "I didn't need to know anything about kitchens" (no jargon, no expertise required)
