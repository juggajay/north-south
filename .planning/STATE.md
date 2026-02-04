# State — North South Carpentry Platform

## Current Position

**Milestone:** 1 (MVP Launch)
**Phase:** 04 (3D Configurator Core)
**Plan:** 01 of 07 complete
**Status:** In progress
**Last Updated:** 2026-02-04

**Progress:** [#---------] 14% (Phase 04: 1/7 plans complete)

**Last activity:** 2026-02-04 - Completed 04-01-PLAN.md (R3F Foundation)

---

## Session Continuity

**Last session:** 2026-02-04T08:00:45Z
**Stopped at:** Completed 04-01-PLAN.md
**Resume file:** None
**Next:** Continue Phase 04 (04-02: 3D Cabinet Primitives)

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
| QR labels link to | Panel info + assembly context + video placeholder | Maximum helpfulness | 2026-02-03 |

### Production Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Export formats | PDF + CSV (MVP), JSON (v2) | Human-readable + spreadsheet now, automation later | 2026-02-03 |
| Production spec contents | All sections | Header, cabinet, panel, edge, drilling, hardware, assembly, QR | 2026-02-03 |

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

**None** - Convex deployment provisioned (wooden-dog-672) and schema pushed successfully.

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

---

## Notes

- This is a mobile-first platform — 99% of usage expected on mobile
- Manual processes acceptable for MVP — automation comes in Milestone 2
- Pricing stored in database — can adjust after factory discussions without code changes
- All Polytec and Blum codes confirmed, pricing TBD
- Convex running in offline mode until deployment provisioned
