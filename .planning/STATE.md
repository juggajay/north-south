# State — North South Carpentry Platform

## Current Position

**Milestone:** 1 (MVP Launch)
**Phase:** 08 (Production Integration & Admin) - IN PROGRESS
**Plan:** 01 of 6 complete
**Status:** PDF generation infrastructure complete
**Last Updated:** 2026-02-05

**Progress:** 87.5% (7/8 phases complete, 08-01 of 08-06 done)
```
███████████████████████████░░░ 87.5%
```

**Latest Completion:** 08-01 - PDF Generation Infrastructure (2026-02-05)

---

## Session Continuity

**Last session:** 2026-02-05 18:14 UTC
**Stopped at:** Completed 08-01-PLAN.md
**Resume file:** None
**Next:** 08-02 - PDF Generation API & Download

---

## Key Decisions Made

### Architecture Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Mobile wrapper | Capacitor 8 | Single codebase to iOS + Android + Web | 2026-02-03 |
| Frontend framework | Next.js 14 (App Router) | SSR for SEO, static export for Capacitor | 2026-02-03 |
| Backend | Convex | Real-time, serverless, type-safe, built-in file storage | 2026-02-03 |
| 3D engine | Three.js / React Three Fiber | WebGL, React integration | 2026-02-03 |
| Output mode | Static export (`output: 'export'`) | Required for Capacitor | 2026-02-03 |

### AI Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Chat model | Gemini 2.0 Flash | Fast, production-stable model | 2026-02-03 |
| Gemini model version | 2.0 Flash over 3.0 preview | Production stability over preview features | 2026-02-04 |
| Chat history context | Last 20 messages | Balance context quality with token usage | 2026-02-04 |
| Vision analysis | Claude Vision API | Space analysis, style extraction | 2026-02-03 |
| Dimension estimation | Depth Anything V2 | Monocular depth, good accuracy | 2026-02-03 |
| Render generation | Nano Banana Pro | Fast photorealistic renders | 2026-02-03 |

### UX Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Entry point | Camera-first | Photo capture is THE primary action | 2026-02-03 |
| Navigation | Bottom tabs (4) | Home, Design, Orders, Chat | 2026-02-03 |
| Modals | Bottom sheets | Thumb-friendly, swipe to dismiss | 2026-02-03 |
| Configurator flow | 4-step wizard | Dimensions → Layout → Finishes → Review | 2026-02-03 |
| Module placement | Slot-based | Pre-defined slots, tap to configure | 2026-02-03 |
| Target devices | iPhone 12+, mid-range Android 2021+ | Performance baseline | 2026-02-03 |

### Pricing Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Pricing model | Component-based | Every selectable item has price | 2026-02-03 |
| Materials | Flat price per material | Simple, clear | 2026-02-03 |
| Door profiles | Price per door | Scales with configuration | 2026-02-03 |
| Hardware | Price per item, ±5% variance | Reflects supplier uncertainty | 2026-02-03 |
| Price display | Total + category breakdown | Transparent, justifies premium | 2026-02-03 |
| Price timing | Exact prices with disclaimer | "Final price confirmed after site measure" | 2026-02-03 |
| Price storage | Integer cents | Prevents JavaScript floating-point errors | 2026-02-04 |
| Currency formatting | Intl.NumberFormat (en-AU, AUD) | Locale-aware, consistent formatting | 2026-02-04 |
| Pricing hook pattern | usePricing with Zustand selectors | Reactive, performance-optimized | 2026-02-04 |

### Quote & Payment Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Quote flow | Manual review before sending | Quality control, customization | 2026-02-03 |
| Submission fields | Name + email only | Low friction | 2026-02-03 |
| Pre-submit options | Site measure (y/n), Install quote (y/n) | Captures customer needs | 2026-02-03 |
| Payment method | Bank transfer (manual) | MVP simplicity, automate later | 2026-02-03 |
| Payment timing | Deposit after quote accepted | Before work begins | 2026-02-03 |
| Site measure pricing | Added to quote by team | Flexibility per job | 2026-02-03 |
| Installation pricing | Added to quote by team | Flexibility per job | 2026-02-03 |

### Customer Experience Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Customer portal sections | All 7 sections | Order status, photos, docs, guides, QR lookup, chat, referrals | 2026-02-03 |
| Notification channel | Email only (MVP) | SMS/push later | 2026-02-03 |
| Notification triggers | 6 key milestones | Order confirmed, Production started, QC complete, Ready to ship, Delivered, Post-install | 2026-02-03 |
| Email template framework | React Email | Type-safe JSX templates, automatic HTML + plaintext generation | 2026-02-05 |
| Email tone | Professional + tradesperson authenticity | "Cheers" not "Best regards" per CONTEXT.md | 2026-02-05 |
| Email delivery | Convex scheduler (non-blocking) | Status updates succeed even if email fails | 2026-02-05 |
| Post-install timing | 7 days after delivered | Gives customer time to install and evaluate | 2026-02-05 |
| QR labels link to | Panel info + assembly context + video placeholder | Maximum helpfulness | 2026-02-03 |
| Timeline pattern | Vertical stepper (not horizontal) | Better for mobile, fits portal context | 2026-02-05 |
| Portal sections | Collapsible Documents + Photos | Reduces scroll, keeps timeline prominent | 2026-02-05 |
| Document access | Download-only (no preview) | Simpler, browser handles download | 2026-02-05 |
| Photo display | Lightbox with framer-motion | Standard gallery pattern, good touch UX | 2026-02-05 |
| Referral placement | Orders tab (not portal detail) | More visible, users check Orders tab frequently | 2026-02-05 |

### Production Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Export formats | PDF + CSV (MVP), JSON (v2) | Human-readable + spreadsheet now, automation later | 2026-02-03 |
| Production spec contents | All sections | Header, cabinet, panel, edge, drilling, hardware, assembly, QR | 2026-02-03 |
| CSV library | react-papaparse | Handles edge cases (commas, quotes, newlines) automatically | 2026-02-05 |
| QR library | qrcode.react | Better error correction options than alternatives | 2026-02-05 |
| QR error correction | Level M (15%) | Minimum for production labels, handles wear/damage | 2026-02-05 |
| QR code size | 96px default | ~25mm at print resolution, scannable from 30cm | 2026-02-05 |
| Label print layout | 4 columns on A4 | Optimal for standard paper, ~40-50 labels per page | 2026-02-05 |
| PDF library | @react-pdf/renderer | React JSX syntax, standard for React projects | 2026-02-05 |
| PDF table library | @ag-media/react-pdf-table | Provides Table/TR/TH/TD for @react-pdf/renderer | 2026-02-05 |
| PDF page structure | Multi-page split | Cabinets/panels/hardware page 1, drilling page 2, assembly page 3 | 2026-02-05 |
| PDF style management | Centralized StyleSheet | Single source of truth, zinc color scheme consistency | 2026-02-05 |

### Implementation Decisions (Phase 01)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Convex boilerplate | Manual creation | Interactive CLI not available in non-TTY | 2026-02-03 |
| Auth magic links | @auth/core Resend | ResendOTP provider deprecated | 2026-02-03 |
| Tab routing | (tabs) route group | Clean URL structure, no /home | 2026-02-03 |
| Button variant | Added 'primary' | Brand styling distinct from shadcn default | 2026-02-03 |
| BottomSheet snaps | 25%/50%/85% | Good coverage for varied content | 2026-02-03 |
| PWA icon generation | Programmatic Node.js scripts | Reproducible, cross-platform, no external tools | 2026-02-04 |
| PWA icon color | Zinc-900 (#18181b) | Matches app theme | 2026-02-04 |
| PWA orientation | portrait-primary | Mobile-first app (99% mobile usage) | 2026-02-04 |
| Auth redirect pattern | useConvexAuth hook | Cleaner than Authenticated component wrapper | 2026-02-04 |
| Login/register UX | Single page with toggle | Reduces routes, smoother than separate pages | 2026-02-04 |
| Logout placement | Header, not bottom nav | Bottom nav for primary navigation only | 2026-02-04 |

### Implementation Decisions (Phase 02)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Blur detection threshold | Laplacian variance < 100 | Empirically tuned for typical mobile photos | 2026-02-04 |
| Brightness thresholds | <50 dark, >220 bright | Practical ranges for under/overexposure | 2026-02-04 |
| Image downscaling | 1024px max dimension | Performance optimization for large images | 2026-02-04 |
| Badge visibility | Hidden by default | Infrastructure ready, data sources wired in future phases | 2026-02-04 |
| Badge positioning | Absolute positioning relative to icon | Consistent placement without affecting touch targets | 2026-02-04 |
| Count badge cap | 99+ maximum | Prevents layout issues with large numbers | 2026-02-04 |
| Empty state pattern | Icon + heading + message + optional CTA | Clear guidance without overwhelming users | 2026-02-04 |
| Thumb zone minimum | 56px (min-h-14) for primary buttons | Comfortable reach in bottom screen area | 2026-02-04 |
| Press-and-hold duration | 1 second hold required | Prevents accidental captures while remaining responsive | 2026-02-04 |
| Quality validation enforcement | Strict rejection - no bypass | Poor photos lead to poor AI results; better to reject upfront | 2026-02-04 |
| Capture button size | 80x80px | Optimal thumb zone size for comfortable one-handed operation | 2026-02-04 |
| Tip rotation frequency | 4 seconds per tip | Enough time to read, short enough to see variety | 2026-02-04 |
| Corner bracket style | L-shaped brackets at 4 corners | Frames capture area without obscuring view, premium feel | 2026-02-04 |
| Gallery button placement | Bottom-left corner | Secondary action, easily accessible but not primary focus | 2026-02-04 |
| Stub Convex client | https://offline.convex.cloud | Enables Convex hooks during static export build without provider errors | 2026-02-04 |
| Chat page rendering | Dynamic import with ssr:false | Prevents SSR errors for Convex hooks in static export | 2026-02-04 |
| Conversation persistence | localStorage with conversationId | Simple persistence before auth integration | 2026-02-04 |
| Message animations | Framer Motion fadeIn + slideUp | Smooth visual feedback for new messages | 2026-02-04 |

### Implementation Decisions (Phase 03)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Query library | TanStack Query v5 | Industry standard, good retry logic, caching | 2026-02-04 |
| Retry policy | 5xx only, not 4xx | 4xx are client errors, shouldn't retry | 2026-02-04 |
| Retry backoff | Exponential 1s/2s/4s, max 30s | Prevents thundering herd, reasonable wait | 2026-02-04 |
| Query stale time | 5 minutes | Balance freshness with API call reduction | 2026-02-04 |
| Provider order | Convex (outer) -> Query (inner) | Query hooks may need auth context | 2026-02-04 |
| Vision model | Claude Sonnet 4.5 | Cost-effective for vision tasks, good quality | 2026-02-04 |
| Vision image size | 1568px max dimension | Claude's optimal size, avoids latency penalty | 2026-02-04 |
| AI response validation | Zod schemas | Type-safe structured response parsing | 2026-02-04 |
| API key security | Server-side Convex actions | Keeps ANTHROPIC_API_KEY secure | 2026-02-04 |
| Dimension tier MVP | Basic tier only (Claude Vision) | Depth Anything V2 deferred; tier system ready for future | 2026-02-04 |
| Style mapping | Aesthetic-based (fixed 3 per aesthetic) | Dynamic per-space matching deferred | 2026-02-04 |
| Render partial failures | Graceful handling | Return successful renders even if some fail | 2026-02-04 |
| Stage color progression | Blue->violet->pink->amber->emerald | Visual feedback through pipeline stages | 2026-02-04 |
| Room detection errors | Specific guidance tips | "Make sure walls visible, improve lighting, stand back" | 2026-02-04 |
| Processing flow | No cancel option | Committed flow - users can only retry or retake | 2026-02-04 |
| Swipe gestures | Spring-based with framer-motion | Feels natural, snappy feedback | 2026-02-04 |
| Pipeline orchestration | TanStack Query mutation | Consistent with existing query patterns, retry logic | 2026-02-04 |
| Convex API types | Manual addition | Blocking fix for unprovisionned deployment | 2026-02-04 |
| View state machine | camera/processing/renders | Clear flow states, easy to extend | 2026-02-04 |

### Implementation Decisions (Phase 04)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| R3F version | v9.0.4 (not v9.5.0) | React 19 compatibility | 2026-02-04 |
| Drei version | v10.7.7 (latest) | React 19 and R3F v9 support | 2026-02-04 |
| Undo/redo limit | 20 states | Balance memory with history depth | 2026-02-04 |
| Wizard progression | Strict validation gates | Prevents invalid configurations | 2026-02-04 |
| Canvas DPR | Adaptive 1-1.5 | Mobile performance optimization | 2026-02-04 |
| Canvas frameloop | demand | Render only when needed (battery saving) | 2026-02-04 |
| WebGL antialias | Disabled | Mobile performance optimization | 2026-02-04 |
| Step indicator clickability | Visited steps clickable | Unlocking progression pattern - free navigation once visited | 2026-02-04 |
| DimensionSync pattern | Inside Canvas context only | useThree() must be inside Canvas, store subscription triggers invalidate() | 2026-02-04 |
| Depth selector UI | Discrete button grid | 5 fixed options clearer than slider with snapping | 2026-02-04 |
| Step indicator placement | Top of wizard shell | Always-visible progress, natural reading order | 2026-02-04 |
| damp() import | THREE.MathUtils.damp | Proper TypeScript namespace access vs. three/src/math/MathUtils | 2026-02-04 |
| Camera rotation limits | Front hemisphere (-90° to +90° azimuth, 18° to 108° polar) | Prevent viewing cabinet back, practical viewing angles | 2026-02-04 |
| Reset button positioning | Top-right absolute via Html component | Non-intrusive, standard UI pattern for 3D controls | 2026-02-04 |
| Touch gesture config | ONE: ROTATE, TWO: DOLLY_PAN | Standard OrbitControls mobile pattern | 2026-02-04 |
| Slot width default | 600mm | Standard cabinet module size, divides evenly | 2026-02-04 |
| Slot calculation | Simple division by default width | MVP simplicity, sophisticated fitting later | 2026-02-04 |
| Empty slot visual | Wireframe with + icon | Clear boundaries, obvious tap target | 2026-02-04 |
| Module picker UI | Bottom sheet with grid | Thumb-friendly, follows mobile patterns | 2026-02-04 |
| Slot validation | At least one module required | Prevents empty configurations | 2026-02-04 |
| Door animation method | damp() in useFrame | Smooth 60fps animation without component re-renders | 2026-02-04 |
| Module height defaults | 800mm base, 600mm overhead, 2100mm tall | Standard Australian kitchen dimensions | 2026-02-04 |
| Carcass component sharing | Shared CabinetCarcass and OverheadCarcass | DRY principle, consistent 18mm panel thickness | 2026-02-04 |
| Interior options UI pattern | Type-specific controls in bottom sheet | Context-aware configuration per module type | 2026-02-04 |
| Material instance sharing | useMemo for Three.js materials | Prevents recreation per mesh, better performance | 2026-02-04 |
| Finish selection validation | Material required before Step 4 | Ensures complete configuration before review | 2026-02-04 |
| Placeholder pricing | $5000 base + $800/module | Simple estimate until Phase 05 real pricing | 2026-02-04 |
| UndoRedoButtons placement | Outside Canvas context | DimensionSync handles 3D invalidation, keeps UI header clean | 2026-02-04 |
| Auto-save debounce | 1000ms | Balances responsiveness with API efficiency | 2026-02-04 |
| Share page design | Read-only with "Save a Copy" | Prevents unauthorized edits, enables collaboration | 2026-02-04 |
| Duplicate mutation behavior | Doesn't copy renders | Fresh start for duplicated design | 2026-02-04 |
| Deep link format | /design/share/{designId} | Simple, clean shareable URL | 2026-02-04 |

### Implementation Decisions (Phase 05)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Module type matching | String pattern matching with fallback | Handles store-to-DB impedance mismatch | 2026-02-04 |
| Loading state strategy | Return zeros, show skeletons | Safe rendering during async data loading | 2026-02-04 |
| TypeScript query types | Explicit any annotations | Workaround for Convex generated type inference gaps | 2026-02-04 |

### Implementation Decisions (Phase 06)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Internal notes field | Optional field on submissions | Backward compatibility with existing data | 2026-02-04 |
| listAll limit | 100 most recent | Performance optimization for dashboard | 2026-02-04 |
| Status workflow | pending/in_review/quoted/ordered/rejected | 3-step workflow for team | 2026-02-04 |
| Field naming | internalNotes prefix | Clear distinction from customer notes | 2026-02-04 |
| Submission form fields | NO name/email fields | Auto-populated from useAuth() (logged-in account) | 2026-02-05 |
| Design ID for submission | From sessionStorage auto-save | No duplicate design creation | 2026-02-05 |
| Confirmation email | NO confirmation email sent | User only notified when quote ready | 2026-02-05 |
| Auto-redirect timing | 2.5 seconds to Orders tab | Smooth UX transition after confirmation | 2026-02-05 |
| Submission flow pattern | Overlay in wizard (replaces review) | Cancel returns to review screen | 2026-02-05 |
| Queue ordering | Ascending (FIFO, oldest first) | Standard workflow - work through in order received | 2026-02-04 |
| Detail view pattern | Expand/collapse inline | Faster than navigation to separate page | 2026-02-04 |
| Status action buttons | Context-aware transitions | Shows only valid next states from current status | 2026-02-04 |
| Internal notes styling | Amber background | Visual distinction from customer notes | 2026-02-04 |
| Admin auth | Unprotected for MVP | Role-based access control deferred to production | 2026-02-04 |

### Implementation Decisions (Phase 07)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Order number format | NS-YYYYMMDD-XXX | Human-readable with date and daily sequence | 2026-02-05 |
| Timeline tracking | Status-mapped object fields | Timestamp each milestone (confirmed, productionStart, qcComplete, etc.) | 2026-02-05 |
| Document versioning | Auto-increment per type | Version tracking for quotes and invoices | 2026-02-05 |
| Panel QR format | {orderId}-{panelId} | Simple, unique, easy to generate | 2026-02-05 |
| Panel QR lookup | Public (no auth) | Installers can scan without login | 2026-02-05 |
| Email masking | j***n@example.com pattern | Referral privacy (first/last char visible) | 2026-02-05 |
| Referral rewards | Manual for MVP | Automation deferred to post-MVP | 2026-02-05 |
| Material swatch colors | Gradient from material name | Placeholder until DB swatches (oak→amber, white→zinc) | 2026-02-05 |
| Static export dynamic routes | Server/client split pattern | generateStaticParams + dummy __placeholder__ param | 2026-02-05 |
| Dynamic params config | False for static export | Real routing handled client-side in Capacitor | 2026-02-05 |

### Implementation Decisions (Phase 08)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Order list pattern | Same as submissions | Consistency in admin UX (List → Card → Actions) | 2026-02-05 |
| Order card collapsible | Same as submissions | Consistent expand/collapse pattern | 2026-02-05 |
| Status workflow enforcement | UI-level validation | Only show valid next-status transitions | 2026-02-05 |
| Timeline display | All completed milestones | Shows production progress with timestamps | 2026-02-05 |
| Admin navigation | Bi-directional links | Easy movement between submissions ↔ orders | 2026-02-05 |
| PDF conditional styles | Spread with ternary | `...(condition ? [style] : [])` avoids boolean in style arrays | 2026-02-05 |
| useSearchParams wrapping | Suspense boundary | Required for static export compatibility | 2026-02-05 |
| useAuth type annotations | @ts-ignore with explicit types | Breaks TypeScript recursion in Convex deep inference | 2026-02-05 |
| Panel dimensions format | "W × H × D mm" | Clear, consistent display | 2026-02-05 |

### UX Quality Gaps - Approved Fixes

| Gap | Fix | Status |
|-----|-----|--------|
| No undo/redo | History stack (20 states), visible button, shake-to-undo | Approved |
| 3D performance unvalidated | Performance testing protocol, LOD system | Approved |
| Save/share not detailed | Cloud sync via Convex, deep link sharing, email save | Approved |
| Limited module library | Expand to 12+ types | Approved |
| No before/after slider | Swipeable comparison, Instagram Stories export | Approved |

---

## Blockers

**Active:**

1. **Convex bundler error on Windows** (Phase 05-01)
   - **Impact:** Cannot run Convex dev server or mutations locally
   - **Root cause:** Windows file system with git `core.ignorecase=true` causes bundler case-sensitivity conflicts
   - **Error:** "Two output files share the same path but have different contents"
   - **Workaround:** Code is correct, will work in production. Run mutations via:
     - Convex dashboard web UI
     - Production deployment (blissful-parrot-166)
     - After fixing git case sensitivity
   - **Blocks:** Database re-seed with cents-based pricing (05-01 Task 3)
   - **Status:** Code complete, deployment blocked

---

## Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| Convex account setup | Phase 01 | **Complete** (wooden-dog-672) |
| Apple Developer account | iOS deployment | Pending |
| Google Play Developer account | Android deployment | Pending |
| Vercel account | Web hosting | Pending |
| Claude API key | Vision analysis | **Complete** (set in Convex) |
| Gemini API key | Chat + Renders | **Complete** (set in Convex) |
| Depth Anything V2 access | Dimension estimation | Pending |
| Nano Banana Pro access | Render generation | Pending |
| Resend account | Transactional emails | Pending |
| PostHog account | Analytics | Pending |
| Polytec trade account | Material pricing | Existing |
| Blum distributor account | Hardware pricing | Existing |

---

## Open Questions

| Question | Context | Status |
|----------|---------|--------|
| Site measure pricing | How much to charge? | TBD by business |
| Installation pricing | How to calculate? | TBD by business |
| Actual component prices | Need from factory | TBD |
| Quote validity period | How long? | Team determines per quote |

---

## Phase 01 Deliverables

**Plan 01 - Project Setup & Convex Foundation (Completed 2026-02-03):**
- Next.js 14 with static export for Capacitor
- Capacitor 8 with iOS/Android native projects (8 plugins)
- Convex schema with 15 tables
- Product catalog seed data (materials, hardware, modules, add-ons)
- Authentication (email/password + magic links)
- Core API (designs, users, submissions)
- Tab navigation (Home, Design, Orders, Chat)
- UI components (Button with loading, Input with label/error, BottomSheet)
- CI/CD workflows (lint-test, deploy-preview)
- Test setup with Vitest
- **Summary:** `.planning/phases/01-foundation/01-01-SUMMARY.md`

**Plan 02 - Auth UI (Completed 2026-02-04):**
- LoginForm and RegisterForm components with validation
- Login page with mode switching
- LogoutButton in tab navigation
- **Summary:** `.planning/phases/01-foundation/01-02-SUMMARY.md`

**Plan 03 - PWA Manifest & Icons (Completed 2026-02-04):**
- PWA manifest with standalone display mode and portrait orientation
- Android home screen icons (192x192, 512x512) with maskable support
- iOS home screen icon (180x180 apple-touch-icon)
- Favicon.ico for browser compatibility
- Programmatic icon generation scripts
- **Summary:** `.planning/phases/01-foundation/01-03-SUMMARY.md`

---

## Phase 02 Deliverables

**Plan 01 - Image Quality Detection (Completed 2026-02-04):**
- Client-side blur detection via Laplacian variance (threshold: 100)
- Brightness detection via pixel averaging (thresholds: <50 dark, >220 bright)
- Combined validation with user-friendly error messages
- Canvas API-based image processing with downscaling to 1024px
- Helper functions: detectBlur, detectBrightness, validateImageQuality
- Full test coverage (14 tests) with Canvas API mocks
- **Summary:** `.planning/phases/02-mobile-ui-shell/02-01-SUMMARY.md`

**Plan 03 - Chat Backend (Completed 2026-02-04):**
- Chat tables (conversations, messages) in Convex schema with indexes
- Gemini 2.0 Flash integration with @google/genai SDK
- Tradesperson personality with strict product-knowledge boundaries
- Chat queries (getConversation, listConversations, getUnreadCount)
- Chat mutations (createConversation, markAsRead)
- sendMessage action with conversation history and error handling
- **Summary:** `.planning/phases/02-mobile-ui-shell/02-03-SUMMARY.md`

**Plan 04 - Camera Capture Interface (Completed 2026-02-04):**
- Capacitor Camera wrapper (capturePhoto, selectFromGallery, checkCameraPermission)
- CaptureButton with 1-second press-and-hold gesture and visual progress ring
- GuidanceOverlay with corner brackets and rotating tips (4-second cycle)
- PhotoPreview with automatic quality validation and strict rejection
- CameraCapture state machine orchestrating full capture flow
- Home page integration with camera open/close state management
- **Summary:** `.planning/phases/02-mobile-ui-shell/02-04-SUMMARY.md`

**Plan 05 - Chat UI Interface (Completed 2026-02-04):**
- ChatMessage and ChatInput components with Framer Motion animations
- ChatInterface with full chat UI, auto-scroll, and error handling
- Convex integration (useQuery for messages, useAction for sending, markAsRead mutation)
- Conversation persistence via localStorage
- Typing indicator during AI response
- Unread badge on Chat tab with real-time reactive updates
- Stub Convex client pattern for static export build compatibility
- **Summary:** `.planning/phases/02-mobile-ui-shell/02-05-SUMMARY.md`

**Plan 06 - Human Verification (Completed 2026-02-04):**
- All tab navigation verified working
- Camera capture flow verified (press-and-hold, brackets, tips)
- Image quality validation verified (blur/brightness rejection)
- Photo preview flow verified (Use Photo/Retake)
- Gallery selection verified with quality validation
- AI chat verified (Gemini responses, tradesperson personality)
- Chat persistence verified (localStorage)
- Unread badge system verified
- All empty states verified
- Touch targets verified (44x44px+ minimum)
- **Summary:** `.planning/phases/02-mobile-ui-shell/02-06-SUMMARY.md`

**Phase 02 Complete** - Mobile UI Shell ready for AI Pipeline integration in Phase 03.

---

## Phase 03 Deliverables

**Plan 01 - Query Infrastructure (Completed 2026-02-04):**
- TanStack Query v5 with production retry configuration
- AI pipeline TypeScript types (PipelineStage, SpaceAnalysis, Dimensions, StyleMatch, Render, etc.)
- QueryProvider integrated into app layout
- Retry only on 5xx errors, exponential backoff (1s, 2s, 4s, max 30s)
- 5-minute stale time for cached data
- **Summary:** `.planning/phases/03-ai-pipeline/03-01-SUMMARY.md`

**Plan 02 - Claude Vision API (Completed 2026-02-04):**
- Anthropic SDK v0.72.1 for Claude Vision API
- Claude Vision client (analyzeSpace) for space analysis
- Image preprocessing helpers (imageUriToBase64, resizeImageForVision)
- Server-side Convex action (analyzeSpaceAction) for secure API calls
- Zod schema validation for structured response parsing
- **Summary:** `.planning/phases/03-ai-pipeline/03-02-SUMMARY.md`

**Plan 03 - Dimension Estimation & Render Generation (Completed 2026-02-04):**
- Dimension estimation module (estimateDimensions, getDimensionTierLabel, formatDimensions)
- Basic tier for MVP (+/-15% accuracy, 85% confidence), tier system ready for Depth Anything V2
- Sanity constraints: 500-6000mm width, 300-2000mm depth, 2100-3500mm height
- Render generation client (getStylesForSpace, buildRenderPrompt, parseRenderResult)
- POLYTEC_STYLES mapping for all 5 aesthetics with 3 styles each
- generateRendersAction Convex action using Gemini 2.0 Flash
- Graceful partial failure handling for render generation
- **Summary:** `.planning/phases/03-ai-pipeline/03-03-SUMMARY.md`

**Plan 04 - Processing Flow UI (Completed 2026-02-04):**
- StepIndicator with 4 stages (Analyzing/Measuring/Styling/Creating) and animated checkmarks
- GeometricAnimation with stage-based color progression and layered motion effects
- ErrorFallback with generic errors and room detection-specific guidance
- ProcessingScreen full-screen overlay integrating all components
- No cancel option (committed flow per CONTEXT.md)
- **Summary:** `.planning/phases/03-ai-pipeline/03-04-SUMMARY.md`

**Plan 05 - Results UI Integration (Completed 2026-02-04):**
- RenderCarousel with spring-based swipe gestures and pagination dots
- useProcessPhoto hook orchestrating full AI pipeline with TanStack Query
- Home page integration with view state machine (camera/processing/renders)
- "Customize this" button stubbed for Phase 04 integration
- Manual ai module addition to Convex generated types (blocking issue fix)
- **Summary:** `.planning/phases/03-ai-pipeline/03-05-SUMMARY.md`

**Plan 06 - Human Verification (Infrastructure Complete 2026-02-04):**
- Convex deployment provisioned (wooden-dog-672)
- Schema pushed successfully with all tables and indexes
- Auth configuration fixed (proper default export format)
- API keys configured in Convex environment (ANTHROPIC_API_KEY, GEMINI_API_KEY)
- App runs and loads correctly at localhost:3000
- Manual pipeline testing pending (requires device with camera)
- **Summary:** `.planning/phases/03-ai-pipeline/03-06-SUMMARY.md`

**Phase 03 Complete** - Full AI Pipeline infrastructure ready. Manual verification of end-to-end flow recommended on mobile device before Phase 04 (3D Configurator).

---

## Phase 04 Deliverables

**Plan 01 - R3F Foundation (Completed 2026-02-04):**
- Three.js v0.182.0, React Three Fiber v9.0.4, Drei v10.7.7
- Zustand v5.0.11 with zundo temporal middleware (20-state undo/redo)
- TypeScript types for configurator (CabinetDimensions, ModuleType with 12 types, ModuleConfig, SlotConfig, FinishConfig, CabinetConfig, WizardStep, DesignVersion)
- useCabinetStore with temporal middleware for undo/redo
- useWizardStore with strict validation-based progression
- useHistoryStore exposing undo/redo functionality
- Canvas3D wrapper with adaptive DPR (1-1.5), demand frameloop, mobile optimizations
- Fixed Convex schema issues (designVersions table, .js/.ts conflicts)
- **Summary:** `.planning/phases/04-3d-configurator-core/04-01-SUMMARY.md`

**Plan 02 - Version History & Auto-save (Completed 2026-02-04):**
- designVersions table in Convex schema with indexes
- Version management functions (saveVersion, getDesignVersions, restoreVersion)
- useAutoSave hook with 1-second debounced Convex sync
- Auto-save triggered on every cabinet config change
- **Summary:** `.planning/phases/04-3d-configurator-core/04-02-SUMMARY.md`

**Plan 03 - 3D Model & Camera (Completed 2026-02-04):**
- CabinetFrame component with scaling wireframe box and smooth dimension transitions
- CameraController with OrbitControls, rotation limits, and reset button
- CabinetModel container composing frame and floor plane
- useCabinetGestures hook for future tap interactions
- Touch gestures: rotate (1 finger), zoom/pan (2 fingers)
- Test page with dimension sliders for real-time cabinet scaling
- **Summary:** `.planning/phases/04-3d-configurator-core/04-03-SUMMARY.md`

**Plan 04 - Wizard Shell & Step 1 (Completed 2026-02-04):**
- WizardShell with StepIndicator, StepNavigation, and step content routing
- StepIndicator with clickable visited steps (unlocking progression)
- StepNavigation with Next/Back buttons and validation gates
- StepDimensions with SliderControl (width/height) and DepthSelector (depth)
- DimensionSync component for 3D viewport updates inside Canvas context
- Touch-friendly controls with plus/minus steppers and 44px minimum touch targets
- Sticky price bar placeholder
- **Summary:** `.planning/phases/04-3d-configurator-core/04-04-SUMMARY.md`

**Plan 05 - Slot-based Module Placement (Completed 2026-02-04):**
- SlotSystem component for calculating slot positions from cabinet dimensions
- ModuleSlot component with empty/filled states and tap handling
- Empty slots: wireframe placeholder with + icon, hover feedback
- Filled slots: solid geometry with module type label
- ModulePicker bottom sheet with all 12 module types (7 base + 5 overhead)
- StepLayout component for Step 2 (Layout) in wizard
- Integrated slot tapping → picker → module placement flow
- Wizard validation: requires at least one module before Step 3
- Fixed import errors (react-modal-sheet, damp, event types)
- **Summary:** `.planning/phases/04-3d-configurator-core/04-05-SUMMARY.md`

**Plan 06 - Module Library & Interior Options (Completed 2026-02-04):**
- All 12 module type 3D components (7 base + 5 overhead)
- BaseModule: StandardBase, SinkBase, DrawerStack, PullOutPantry, CornerBase, ApplianceTower, OpenShelving
- OverheadModule: StandardOverhead, GlassDoor, OpenShelf, RangehoodSpace, LiftUpDoor
- Animated door components: CabinetDoor (Y-axis), CabinetDrawer (Z-axis), LiftUpDoorPanel (X-axis)
- ModuleFactory with renderModule function for type mapping
- InteriorOptions bottom sheet with type-specific controls
- Configurable: shelf count, drawer count, basket count, dividers
- Add-ons: LED strip, pull-out bin, drawer dividers
- **Summary:** `.planning/phases/04-3d-configurator-core/04-06-SUMMARY.md`

**Plan 07 - Finish Selection & Review (Completed 2026-02-04):**
- MaterialPicker with tabbed interface (material, hardware, door profile)
- Material swatches grid with category grouping (woodmatt, satin, gloss)
- Hardware options list with supplier info
- Door profile selection with images
- useMaterialPreview hook for shared material instances
- MaterialApplicator for real-time 3D material updates
- StepFinishes component for Step 3 with selection summary
- StepReview component for Step 4 with full configuration summary
- Price breakdown with placeholder pricing ($5000 base + $800/module)
- Variance disclaimer (±5%, site measure required)
- Complete 4-step wizard flow now functional
- **Summary:** `.planning/phases/04-3d-configurator-core/04-07-SUMMARY.md`

**Plan 08 - Undo/Redo & Shareable Links (Completed 2026-02-04):**
- UndoRedoButtons component with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- SaveIndicator component with real-time status (Saving.../Saved Xs ago)
- Design edit page with auto-save integration (1000ms debounce)
- Split layout: 3D viewport + wizard sidebar
- Shareable design page with read-only 3D preview
- Deep link format: /design/share/{designId}
- "Save a Copy" functionality for duplicating designs
- duplicate mutation in convex/designs.ts
- Navigation from share page to edit page after duplication
- **Summary:** `.planning/phases/04-3d-configurator-core/04-08-SUMMARY.md`

**Plan 09 - Version History, Before/After, LOD (Completed 2026-02-04):**
- VersionHistory panel with timeline list and restore functionality
- Store subscription pattern for 3D invalidation (no useThree requirement)
- Version count badge and empty state UI
- BeforeAfterSlider with swipeable drag interactions
- ClipPath-based image reveal for AI render comparison
- BeforeAfterToggle for simple mode switching
- LODWrapper using drei's Detailed component (distance-based switching)
- SimpleLOD for manual quality reduction
- useLODConfig hook with device capability detection (CPU, memory, mobile)
- FPSMonitor for real-time frame rate tracking
- usePerformanceDegradation for automatic quality adjustment
- **Summary:** `.planning/phases/04-3d-configurator-core/04-09-SUMMARY.md`

**Plan 10 - Final Integration & Human Verification (Completed 2026-02-04):**
- ConfiguratorPage integrating all Phase 04 components with auth enforcement
- Design tab entry point with dynamic import for SSR compatibility
- Human verification passed - all features confirmed working
- Auth flow verified (login required per CONTEXT.md)
- 4-step wizard navigation verified (Dimensions → Layout → Finishes → Review)
- Slot tapping and module placement verified
- Material/hardware/door profile selection verified
- Undo/redo and auto-save verified
- Session storage persistence for static export compatibility
- **Summary:** `.planning/phases/04-3d-configurator-core/04-10-SUMMARY.md`

**Phase 04 Complete** - Full 3D configurator operational with all features verified.

---

## Phase 05 Deliverables

**Plan 01 - Pricing Data Migration (Completed 2026-02-04):**
- Database seed data migrated to cents-based pricing
- All materials, hardware, doorProfiles, modules priced in integer cents
- Hardware variance field (5%) set for all hardware items
- convex/products/modules.ts query API (list, getByCode, listByCategory)
- clearSeed mutation for database resets
- **Summary:** `.planning/phases/05-finishes-pricing/05-01-SUMMARY.md`

**Plan 02 - Pricing Hook & Display Components (Completed 2026-02-04):**
- usePricing hook with Convex queries and Zustand config subscription
- Integer-based calculations (all in cents) with useMemo optimization
- Intl.NumberFormat for AUD currency formatting (en-AU locale)
- Hardware variance (±5%) calculated and displayed
- PriceDisplay component for single price with optional variance
- PriceBreakdown component with itemized costs and disclaimer
- PriceStickyBar component for wizard navigation
- Loading skeletons for async pricing data
- **Summary:** `.planning/phases/05-finishes-pricing/05-02-SUMMARY.md`

**Plan 03 - Wizard Pricing Integration (Completed 2026-02-04):**
- StepReview uses PriceBreakdown (replaces hardcoded $5000 + $800/module)
- MaterialPicker shows prices on material swatches
- MaterialPicker shows prices with ±5% on hardware options
- MaterialPicker shows price/door on door profiles
- PriceStickyBar integrated into WizardShell
- formatPrice helper used throughout for consistent AUD formatting
- **Summary:** `.planning/phases/05-finishes-pricing/05-03-SUMMARY.md`

**Plan 04 - Human Verification (Completed 2026-02-04):**
- Fixed Convex bundler conflict (removed duplicate .js files)
- Reseeded database with cents-based pricing
- Verified sticky price bar updates live
- Verified material/hardware/door profile prices displayed
- Verified price breakdown shows all categories
- Verified variance disclaimers visible
- User approved implementation
- **Summary:** `.planning/phases/05-finishes-pricing/05-04-SUMMARY.md`

**Phase 05 Complete** - Full pricing system operational with database-driven values.

---

## Phase 06 Deliverables

**Plan 01 - Backend Foundation for Team Workflows (Completed 2026-02-04):**
- Added internalNotes field to submissions schema for team-only context
- Created listAll query for team dashboard (all submissions with design data)
- Added updateInternalNotes mutation for managing team notes
- Extended updateStatus to support 3-step workflow (pending/in_review/quoted/ordered/rejected)
- **Summary:** `.planning/phases/06-quote-submission-flow/06-01-SUMMARY.md`

**Plan 02 - Customer-Facing Submission Flow (Completed 2026-02-05):**
- PreSubmitOptions component with site measure and installation toggles
- ReviewSummary component showing config, pricing, and selected options
- ConfirmationScreen with success message, no-email clarification, and auto-redirect
- SubmissionFlow orchestrator managing 3-step state machine (options -> review -> confirmation)
- StepReview integration with "Submit for Quote" button
- Auto-populates name/email from logged-in account (no form fields)
- Uses existing auto-saved designId from sessionStorage (no duplicate creation)
- React Hook Form + Zod validation for submission
- **Summary:** `.planning/phases/06-quote-submission-flow/06-02-SUMMARY.md`

**Plan 03 - Team Dashboard UI (Completed 2026-02-04):**
- StatusBadge component with semantic color coding for 5 status states
- SubmissionCard with expand/collapse functionality and context-aware status actions
- SubmissionDetail showing full config breakdown (dimensions, modules, finishes) with internal notes editing
- SubmissionQueue with real-time Convex subscriptions and FIFO ordering (oldest first)
- Admin page at /admin/submissions (unprotected for MVP)
- Fixed listAll query ordering bug (desc → asc for proper FIFO workflow)
- **Summary:** `.planning/phases/06-quote-submission-flow/06-03-SUMMARY.md`

**Plan 04 - Human Verification (Completed 2026-02-05):**
- Full customer submission flow verified via browser automation (Playwright)
- Fixed Orders page undefined variable (userEmail → userId)
- Added userId field to submissions schema with by_userId index
- Added listByUserId query for reliable submission retrieval
- Fixed Convex Auth email extraction (identity.email → identity.subject fallback)
- Updated SubmissionFlow to pass userId when creating submission
- Verified: submission creates, confirmation shows, redirects to Orders, submission displays
- **Summary:** `.planning/phases/06-quote-submission-flow/06-04-SUMMARY.md`

**Phase 06 Complete** - Full quote submission flow operational with verified customer and team workflows.

---

## Phase 07 Deliverables

**Plan 01 - Backend Foundation (Completed 2026-02-05):**
- Resend email component configured (@convex-dev/resend, @react-email/components, @react-email/render)
- Order management API with NS-YYYYMMDD-XXX order numbers and timeline tracking
- Document storage with auto-versioning (quotes, invoices) using Convex storage
- Panel QR lookup (public, no auth) for installer scanning
- Referral tracking with email masking (j***n@example.com pattern)
- convex/orders.ts: create, get, getBySubmission, listByUserId, updateStatus, getTimeline
- convex/documents.ts: upload, list, getDownloadUrl, generateUploadUrl
- convex/panels.ts: lookupByQrCode (public), createPanelQr
- convex/referrals.ts: create, getMyReferrals, getReferralLink, updateStatus
- convex/notifications.ts: Resend initialization, sendOrderEmail placeholder
- **Summary:** `.planning/phases/07-customer-portal-notifications/07-01-SUMMARY.md`

**Plan 02 - Email Notification Templates (Completed 2026-02-05):**
- Six email templates for order lifecycle (order_confirmed, production_started, qc_complete, ready_to_ship, delivered, post_install)
- Text-only emails with professional-yet-approachable tone
- @react-email/components for template structure with text fallbacks
- sendNotificationEmail action with template selection and rendering
- Portal URLs included in all emails for order tracking
- Post-install email includes referral link CTA for Google/social reviews
- **Summary:** `.planning/phases/07-customer-portal-notifications/07-02-SUMMARY.md`

**Plan 03 - Customer Portal UI (Completed 2026-02-05):**
- OrderTimeline component with vertical stepper (completed/active/future milestones)
- DocumentList component with download functionality for quotes and invoices
- ProductionGallery component with milestone-grouped photo display
- ReferralTracker component with masked emails and status badges
- Order detail page at /portal/[orderId] with expandable sections
- Enhanced Orders tab with active orders and submissions display
- Mobile-responsive layouts with thumb-friendly interactions
- **Summary:** `.planning/phases/07-customer-portal-notifications/07-03-SUMMARY.md`

**Plan 04 - QR Panel Lookup (Completed 2026-02-05):**
- Public /panel/[qrCode] route accessible without authentication
- PanelCard component with material swatch gradient and panel details
- PanelNotFound component with helpful messaging for invalid codes
- Mobile-optimized card layout (max-w-sm, centered, rounded-2xl)
- Server/client component split for static export compatibility
- generateStaticParams with dummy __placeholder__ for build-time generation
- Material color mapping algorithm (oak→amber, white→zinc, black→slate)
- Fixed blocking TypeScript and static export issues from previous plans
- **Summary:** `.planning/phases/07-customer-portal-notifications/07-04-SUMMARY.md`

---

## Phase 08 Deliverables

**Plan 01 - PDF Generation Infrastructure (Completed 2026-02-05):**
- @react-pdf/renderer@4.3.2 and @ag-media/react-pdf-table@2.0.3 installed
- Complete type system for production spec data (OrderInfo, CabinetItem, PanelItem, HardwareItem, DrillingItem, AssemblyGroup)
- Shared StyleSheet with zinc color scheme matching app theme
- Seven section components: HeaderSection, CabinetSchedule, PanelSchedule, EdgeBandingSchedule, HardwareList, DrillingSchedule, AssemblyGroups
- ProductionSpecPDF main document composing all sections with multi-page layout
- Fixed blocking TypeScript recursion errors in useAuth hook
- Fixed missing Suspense boundaries in /panel and /portal pages for static export
- Build passes without errors, all PDF components render correctly
- **Summary:** `.planning/phases/08-production-integration---admin/08-01-SUMMARY.md`

**Plan 02 - CSV Export & QR Label Generation (Completed 2026-02-05):**
- react-papaparse v4.4.0 for CSV generation with automatic character escaping
- qrcode.react v4.2.0 for QR code generation with error correction
- downloadPanelCSV function for panel schedule exports
- downloadHardwareCSV function for hardware BOM with automatic totals row
- QRLabelSheet component with 4-column A4 print layout
- QR codes with error correction level M (15% damage tolerance)
- Print optimization with @page CSS and color-adjust exact
- PanelItem, HardwareItem, PanelLabel TypeScript interfaces
- **Summary:** `.planning/phases/08-production-integration---admin/08-02-SUMMARY.md`

---

## Notes

- This is a mobile-first platform — 99% of usage expected on mobile
- Manual processes acceptable for MVP — automation comes in Milestone 2
- Pricing stored in database — can adjust after factory discussions without code changes
- All Polytec and Blum codes confirmed, pricing TBD
- Convex running in offline mode until deployment provisioned
