# Roadmap — North South Carpentry Platform

## Milestone 1: MVP Launch

**Definition of Done:** Complete mobile app allowing customers to photograph space, configure joinery, submit for quote, and track orders through production.

**Target:** Months 1-4

---

### Phase 01: Foundation Setup
**Status:** Complete ✓
**Completed:** 2026-02-04
**Requirements:** ARCH-001 → ARCH-006, BACK-001 → BACK-004, AUTH-001 → AUTH-004, Database Schema

**Deliverables:**
- Next.js 14 project with App Router configured for static export
- Capacitor 8 integration with iOS/Android projects scaffolded
- Convex backend deployed with full database schema
- Authentication working (email/password, magic link)
- PWA manifest and service worker
- CI/CD pipeline for all three targets

**Must-Haves:**
- [x] `npm run build` produces deployable artifacts for web, iOS, Android
- [x] User can register, login, logout
- [x] Convex database seeded with product data (materials, hardware, modules)
- [x] Type-safe queries working frontend ↔ backend
- [x] App installable as PWA

**Plans:** 3 plans
Plans:
- [x] 01-01-PLAN.md — Project setup, Convex backend, schema, seed data, CI/CD
- [x] 01-02-PLAN.md — Auth UI (login/register forms, logout button) [gap closure]
- [x] 01-03-PLAN.md — PWA manifest and icons [gap closure]

---

### Phase 02: Mobile UI Shell
**Status:** Complete ✓
**Completed:** 2026-02-04
**Requirements:** NAV-001 → NAV-004, CAM-001 → CAM-005, CHAT-001 → CHAT-004

**Deliverables:**
- Bottom tab navigation (Home, Design, Orders, Chat)
- Camera capture interface with guidance overlay
- Gallery selection integration
- Image quality validation (reject blurry/dark with guidance)
- AI chat integration with Gemini 2.0 Flash
- Bottom sheet component system
- Thumb zone layout patterns established

**Must-Haves:**
- [x] Four-tab navigation functional on all platforms
- [x] Camera opens as primary entry point
- [x] User can capture photo or select from gallery
- [x] Poor quality photos rejected with helpful message
- [x] Chat responds with product knowledge
- [x] All modals use bottom sheet pattern (camera uses full-screen by design)
- [x] Touch targets meet 44x44px minimum

**Plans:** 6 plans
Plans:
- [x] 02-01-PLAN.md — Image quality detection (TDD: blur/brightness validation)
- [x] 02-02-PLAN.md — Tab navigation badges and empty states
- [x] 02-03-PLAN.md — Chat backend with Gemini integration
- [x] 02-04-PLAN.md — Camera capture interface with guidance overlay
- [x] 02-05-PLAN.md — Chat UI and conversation management
- [x] 02-06-PLAN.md — Human verification of complete mobile shell

---

### Phase 03: AI Pipeline
**Status:** Complete ✓
**Completed:** 2026-02-04
**Requirements:** PROC-001 → PROC-003, AI-001 → AI-007, DIM-001 → DIM-004

**Goal:** Transform user photos into styled renders with dimension estimates, showing joinery in their actual space with animated processing feedback.

**Deliverables:**
- Processing screen with animated progress stages
- Claude Vision integration for space analysis
- Dimension estimation with confidence tiers
- Nano Banana Pro/Gemini integration for render generation
- Swipeable render carousel
- Error handling with retry options

**Must-Haves:**
- [x] Photo uploads trigger processing pipeline
- [x] Progress stages display: Analyzing → Measuring → Styling → Creating
- [x] 3 styled renders generated within 30 seconds
- [x] Renders show user's actual space transformed
- [x] Dimension estimate displayed with confidence %
- [x] Materials in renders match Polytec finishes
- [x] Failed processing shows clear error + retry option

**Plans:** 6 plans
Plans:
- [x] 03-01-PLAN.md — Pipeline types and TanStack Query setup
- [x] 03-02-PLAN.md — Claude Vision space analysis integration
- [x] 03-03-PLAN.md — Dimension estimation and render generation
- [x] 03-04-PLAN.md — Processing screen with animated progress
- [x] 03-05-PLAN.md — Render carousel and pipeline integration
- [x] 03-06-PLAN.md — Human verification of complete AI pipeline

---

### Phase 04: 3D Configurator Core
**Status:** Complete ✓
**Completed:** 2026-02-04
**Requirements:** CFG-001 → CFG-005, DIM-UI-001 → DIM-UI-005, SLOT-001 → SLOT-007, MOD-B01 → MOD-B07, MOD-O01 → MOD-O05, TOUCH-001 → TOUCH-005, CFG-F01 → CFG-F05

**Goal:** Interactive 3D cabinet configurator with 4-step wizard, slot-based module placement, touch gestures, undo/redo, auto-save, sharing, and LOD performance.

**Deliverables:**
- Three.js / React Three Fiber 3D viewport
- 4-step wizard layout (Dimensions → Layout → Finishes → Review)
- Step 1: Dimension controls with sliders
- Step 2: Slot-based module placement with bottom sheets
- All 12 module types modeled and functional
- Touch gesture system (rotate, zoom, pan, tap, swipe)
- Undo/redo history (20 states)
- Save design to cloud
- Share via deep link
- Before/after comparison slider
- LOD system for performance

**Must-Haves:**
- [x] 3D viewport renders at 30+ FPS on target devices
- [x] Wizard steps navigable via Next/Back buttons
- [x] AI-estimated dimensions pre-populate Step 1
- [x] User can tap any slot, select module type via bottom sheet
- [x] All 7 base + 5 overhead module types selectable
- [x] Interior options (shelves, dividers) configurable
- [x] Add-ons (LED, bins) selectable per module
- [x] Undo button visible and functional
- [x] Design saves to Convex, retrievable on return
- [x] Share link opens saved design

**Plans:** 10 plans
Plans:
- [x] 04-01-PLAN.md — R3F ecosystem install, TypeScript types, Zustand stores, Canvas3D wrapper
- [x] 04-02-PLAN.md — Version history schema, auto-save hook with debounce
- [x] 04-03-PLAN.md — 3D cabinet model, camera controls, touch gestures
- [x] 04-04-PLAN.md — Wizard shell, step indicator, navigation, Step 1 dimensions
- [x] 04-05-PLAN.md — Slot system, module picker bottom sheet, Step 2 layout
- [x] 04-06-PLAN.md — All 12 module 3D components, animated doors, interior options
- [x] 04-07-PLAN.md — Material picker, real-time preview, Step 3 finishes, Step 4 review
- [x] 04-08-PLAN.md — Undo/redo UI, auto-save integration, shareable design links
- [x] 04-09-PLAN.md — Version history UI, before/after slider, LOD system
- [x] 04-10-PLAN.md — Full integration and human verification

---

### Phase 05: Finishes & Pricing
**Status:** Complete ✓
**Completed:** 2026-02-04
**Requirements:** FIN-001 → FIN-005, REV-001 → REV-004, PRICE-001 → PRICE-006, PRICE-D01 → PRICE-D04

**Goal:** Replace placeholder pricing with database-driven component pricing, show live totals throughout wizard, display price breakdown with variance disclaimers.

**Deliverables:**
- Database pricing migrated to cents (integer arithmetic)
- Centralized usePricing hook for calculations
- Live sticky price bar throughout wizard
- Price display on all finish options
- Step 4: Review screen with real price breakdown
- ±5% hardware variance disclaimer
- Site measure disclaimer

**Must-Haves:**
- [x] User can select from all Polytec materials
- [x] User can select hardware options
- [x] User can select door profile
- [x] 3D viewport updates materials in real-time
- [x] Price breakdown shows: Cabinets · Material · Hardware · Door Profile
- [x] Total price updates live as user configures
- [x] All prices pulled from database (admin-editable)
- [x] ±5% supplier variance disclaimer visible

**Plans:** 4 plans
Plans:
- [x] 05-01-PLAN.md — Migrate seed data to cents, create modules query API
- [x] 05-02-PLAN.md — usePricing hook and pricing display components
- [x] 05-03-PLAN.md — Wire pricing to wizard UI (StepReview, MaterialPicker, sticky bar)
- [x] 05-04-PLAN.md — Human verification of complete pricing system

---

### Phase 06: Quote Submission Flow
**Status:** Complete ✓
**Completed:** 2026-02-05
**Requirements:** SUBMIT-001 → SUBMIT-005, QUEUE-001 → QUEUE-005, QUOTE-001 → QUOTE-004, PAY-001 → PAY-004

**Goal:** Customer can submit configured design for a quote, team reviews submissions in internal dashboard, manages workflow from New to Quoted.

**Deliverables:**
- Pre-submit options screen (site measure, installation quote)
- Submission form (name, email)
- Internal submission queue dashboard
- Configuration data display for team review
- Status tracking system
- Manual quote workflow documentation

**Must-Haves:**
- [x] User can choose site measure: yes/no
- [x] User can request installation quote: yes/no
- [x] User enters name (required) and email (required)
- [x] Submit sends data to Convex
- [x] Submission appears in internal dashboard
- [x] Team can view full configuration details
- [x] Team can update submission status
- [x] Workflow documented for manual quote creation

**Plans:** 4 plans
Plans:
- [x] 06-01-PLAN.md — Schema update (internalNotes field) and API enhancements
- [x] 06-02-PLAN.md — Customer submission flow (options, review, confirmation)
- [x] 06-03-PLAN.md — Internal team dashboard at /admin/submissions
- [x] 06-04-PLAN.md — Human verification of complete submission system

---

### Phase 07: Customer Portal & Notifications
**Status:** Complete ✓
**Completed:** 2026-02-05
**Requirements:** ORD-001 → ORD-008, PORT-001 → PORT-007, NOTIF-001 → NOTIF-006

**Goal:** Post-purchase customer experience with order tracking, document access, QR panel lookup, and proactive email notifications at key milestones.

**Deliverables:**
- Order status display with timeline
- Production photos gallery
- Documents section (quote, invoice)
- Installation guides section (placeholder for videos)
- QR panel lookup interface (public, no login)
- Chat/support access
- Referral program tracking
- Email notification system (6 triggers via Resend)

**Must-Haves:**
- [x] Customer can see current order status
- [x] Timeline shows completed + upcoming milestones
- [x] Production photos uploaded by team appear in portal
- [x] Documents downloadable
- [x] QR scan shows panel info (public access)
- [x] Chat accessible from portal
- [x] Referral link generated
- [x] Emails sent at: Order confirmed, Production started, QC complete, Ready to ship, Delivered, Post-install

**Plans:** 5 plans
Plans:
- [x] 07-01-PLAN.md — Backend foundation (Resend component, orders/documents/panels/referrals APIs)
- [x] 07-02-PLAN.md — Email templates and notification triggers
- [x] 07-03-PLAN.md — Customer portal UI (timeline, documents, photos, referrals)
- [x] 07-04-PLAN.md — QR panel lookup (public route)
- [x] 07-05-PLAN.md — Human verification of complete portal system

---

### Phase 08: Production Integration & Admin
**Status:** Not Started
**Requirements:** PROD-001 → PROD-010, QR-001 → QR-003, DASH-001 → DASH-006

**Deliverables:**
- Production spec PDF export
- Production spec CSV export
- QR label data generation
- QR scan → panel info page
- Admin dashboard: submission queue
- Admin dashboard: order management
- Admin dashboard: photo upload
- Admin dashboard: production spec download
- Admin dashboard: notification triggers

**Must-Haves:**
- [ ] PDF spec includes: header, cabinet schedule, panel schedule, edge banding, drilling, hardware, assembly groups
- [ ] CSV spec importable to spreadsheet
- [ ] QR labels link to panel info page
- [ ] Panel info shows dimensions, material, edges, assembly context
- [ ] Admin can view/manage all submissions
- [ ] Admin can update order status
- [ ] Admin can upload production photos
- [ ] Admin can download production specs
- [ ] Admin can trigger notification emails

---

## Phase Checklist

| Phase | Name | Status | Requirements Covered |
|-------|------|--------|---------------------|
| 01 | Foundation Setup | Complete ✓ | ARCH-*, BACK-*, AUTH-* |
| 02 | Mobile UI Shell | Complete ✓ | NAV-*, CAM-*, CHAT-* |
| 03 | AI Pipeline | Complete ✓ | PROC-*, AI-*, DIM-* |
| 04 | 3D Configurator Core | Complete ✓ | CFG-*, SLOT-*, MOD-*, TOUCH-* |
| 05 | Finishes & Pricing | Complete ✓ | FIN-*, REV-*, PRICE-* |
| 06 | Quote Submission | Complete ✓ | SUBMIT-*, QUEUE-*, QUOTE-*, PAY-* |
| 07 | Portal & Notifications | Complete ✓ | ORD-*, PORT-*, NOTIF-* |
| 08 | Production & Admin | Not Started | PROD-*, QR-*, DASH-* |

---

## Milestone 2: Post-Launch Enhancements (Future)

**Planned Phases:**
- Phase 09: Style Extraction (Pinterest analysis, preference pre-population)
- Phase 10: Payment Automation (Stripe integration)
- Phase 11: Pytha Automation (JSON export, parametric templates)
- Phase 12: AR Preview (ARKit/ARCore integration)
- Phase 13: Additional Products (AcoustiSlat, Federation Mudroom, Home Office)
- Phase 14: Trade Portal (B2B accounts, builder pricing)
