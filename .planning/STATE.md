# State — North South Carpentry Platform

## Current Position

**Milestone:** 1 (MVP Launch)
**Phase:** 01 (Foundation Setup)
**Plan:** 03 of 03 complete (gap closure plans)
**Status:** Phase Complete
**Last Updated:** 2026-02-04

**Progress:** [##########] 100% (Phase 01 Complete)

**Last activity:** 2026-02-04 - Completed 01-03-PLAN.md (PWA Manifest & Icons)

---

## Session Continuity

**Last session:** 2026-02-04T00:32:34Z
**Stopped at:** Completed 01-03-PLAN.md
**Resume file:** None (Phase 01 complete)

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
| Chat model | Gemini 3.0 Flash | Fast, initial qualification only | 2026-02-03 |
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

**Convex deployment not provisioned** - User needs to run `npx convex dev --once --configure=new` interactively to create a Convex deployment. This is required before the app can function with real data.

---

## Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| Convex account setup | Phase 01 | **Needs interactive setup** |
| Apple Developer account | iOS deployment | Pending |
| Google Play Developer account | Android deployment | Pending |
| Vercel account | Web hosting | Pending |
| Claude API key | Vision analysis | Pending |
| Gemini API key | Chat | Pending |
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

## Notes

- This is a mobile-first platform — 99% of usage expected on mobile
- Manual processes acceptable for MVP — automation comes in Milestone 2
- Pricing stored in database — can adjust after factory discussions without code changes
- All Polytec and Blum codes confirmed, pricing TBD
- Convex running in offline mode until deployment provisioned
