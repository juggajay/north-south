# Requirements — North South Carpentry Platform

## Requirements Legend

- **[v1]** — Must ship in MVP
- **[v2]** — Planned for post-launch
- **[out]** — Explicitly out of scope
- **Phase: X** — Maps to roadmap phase

---

## 1. Platform Architecture

### 1.1 Mobile-First Foundation [v1] — Phase: 01

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| ARCH-001 | Single codebase deploys to Web, iOS, Android | `npm run build` produces artifacts for all three targets |
| ARCH-002 | Capacitor 8 native wrapper | Camera, push notifications, haptics work on native |
| ARCH-003 | Next.js 14 App Router with static export | `output: 'export'` in next.config, no SSR dependencies |
| ARCH-004 | PWA manifest and service worker | App installable from mobile browser |
| ARCH-005 | Performance: FCP < 1.5s, TTI < 3s | Lighthouse scores on mid-range Android device |
| ARCH-006 | 3D viewport: 30+ FPS on target devices | Performance testing on iPhone 12, Pixel 6 |

### 1.2 Backend Infrastructure [v1] — Phase: 01

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| BACK-001 | Convex real-time database | Schema deployed, queries returning data |
| BACK-002 | Convex serverless functions | AI processing, PDF generation working |
| BACK-003 | Convex file storage | Photo uploads stored and retrievable |
| BACK-004 | Type-safe end-to-end | TypeScript types shared frontend ↔ backend |

### 1.3 Authentication [v1] — Phase: 01

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| AUTH-001 | Email/password authentication | User can register, login, logout |
| AUTH-002 | Magic link authentication | User can login via email link |
| AUTH-003 | Session persistence | User stays logged in across app restarts |
| AUTH-004 | Guest mode for browsing | User can use configurator before signing up |

---

## 2. User Interface

### 2.1 Mobile Navigation [v1] — Phase: 02

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NAV-001 | Bottom tab navigation (4 tabs) | Home, Design, Orders, Chat tabs visible and functional |
| NAV-002 | Thumb zone optimisation | Primary actions in bottom 1/3 of screen |
| NAV-003 | Touch targets: 44x44px minimum | All interactive elements meet size requirement |
| NAV-004 | Bottom sheet pattern for modals | All overlays slide up from bottom, swipe to dismiss |

### 2.2 Camera Entry [v1] — Phase: 02

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| CAM-001 | Full-screen camera interface | Camera opens as primary entry point |
| CAM-002 | Guidance overlay | Tips displayed: "Stand back", "Include floor/ceiling", "Good lighting" |
| CAM-003 | Capture button in thumb zone | [📷 Capture] button easily reachable |
| CAM-004 | Gallery selection option | [🖼️ Gallery] button to select existing photo |
| CAM-005 | Image quality validation | Reject blurry/dark photos with specific guidance |

### 2.3 Processing State [v1] — Phase: 03

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| PROC-001 | Animated progress indicators | Smooth animations during 30s processing |
| PROC-002 | Stage-based messaging | "Analyzing...", "Measuring...", "Matching...", "Creating..." |
| PROC-003 | Graceful error handling | Clear message if processing fails, retry option |

---

## 3. AI Features

### 3.1 Photo-to-Render Pipeline [v1] — Phase: 03

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| AI-001 | Claude Vision space analysis | Extracts dimensions, features, style from photo |
| AI-002 | Depth Anything V2 dimension estimation | Returns estimated W×D×H with confidence % |
| AI-003 | Style classification | Matches space to 3 appropriate design styles |
| AI-004 | Nano Banana Pro render generation | 3 photorealistic renders generated |
| AI-005 | Total pipeline < 30 seconds | End-to-end from upload to renders displayed |
| AI-006 | Renders preserve original context | Walls, floor, ceiling, adjacent features visible |
| AI-007 | Renders show accurate materials | Polytec finishes represented realistically |

### 3.2 Dimension Estimation Tiers [v1] — Phase: 03

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| DIM-001 | Basic tier: Single photo, ±15% accuracy | Estimate returned with confidence indicator |
| DIM-002 | Standard tier: Photo + reference object, ±10% | Credit card detection improves accuracy |
| DIM-003 | Enhanced tier: Multiple photos, ±5% | Front + side photos combined |
| DIM-004 | Precision tier: LiDAR scan, ±2% | iPhone Pro/iPad LiDAR data imported |

### 3.3 Style Extraction [v2] — Phase: future

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| STYLE-001 | Pinterest URL analysis | Extract images from board, analyse patterns |
| STYLE-002 | Multi-image pattern recognition | Identify consistent preferences across images |
| STYLE-003 | Natural language summary | "You're drawn to slimline shaker in warm whites..." |
| STYLE-004 | Configurator pre-population | Preferences auto-loaded into configurator |

### 3.4 AI Chat [v1] — Phase: 02

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| CHAT-001 | Gemini 3.0 Flash integration | Chat responds with product knowledge |
| CHAT-002 | Initial qualification flow | Confirms what user wants before configuring |
| CHAT-003 | Product knowledge context | Reads from specs to answer questions accurately |
| CHAT-004 | Handoff to configurator | Guides user to photo capture / configurator |

---

## 4. 3D Configurator

### 4.1 Configurator Layout [v1] — Phase: 04

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| CFG-001 | Stepped wizard (4 steps) | Dimensions → Layout → Finishes → Review |
| CFG-002 | 3D viewport: upper 60% of screen | Real-time WebGL rendering |
| CFG-003 | Controls: lower 40% of screen | Step-specific inputs |
| CFG-004 | Sticky progress tracker | Step indicator always visible |
| CFG-005 | Sticky bottom bar | Live price + primary CTA always visible |
| CFG-006 | Swipe navigation between steps | Left/right swipe advances/returns |

### 4.2 Step 1: Dimensions [v1] — Phase: 04

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| DIM-UI-001 | Width slider with stepper | 1200-3600mm in 100mm increments |
| DIM-UI-002 | Depth selector | 400, 500, 560, 600, 650mm options |
| DIM-UI-003 | Height slider with stepper | 1800-2400mm in 100mm increments |
| DIM-UI-004 | AI estimate pre-populated | Dimensions from photo analysis shown as default |
| DIM-UI-005 | 3D viewport updates in real-time | Cabinet frame resizes as sliders move |

### 4.3 Step 2: Layout (Slot-Based) [v1] — Phase: 04

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| SLOT-001 | Pre-defined slots shown in 3D | Visual indicators for available positions |
| SLOT-002 | Tap slot → bottom sheet | Module selection panel slides up |
| SLOT-003 | Module type selection | Radio buttons or visual grid for type |
| SLOT-004 | Module width selection | Available widths for selected type |
| SLOT-005 | Interior fittings section | Shelf count, drawer dividers, etc. |
| SLOT-006 | Add-ons section | LED strips, pull-out bins, etc. |
| SLOT-007 | [Apply Changes] in thumb zone | Confirms selection, closes sheet |

### 4.4 Module Types [v1] — Phase: 04

**Base Cabinets (7 types):**

| ID | Type | Description | Interior Options |
|----|------|-------------|------------------|
| MOD-B01 | Standard | Single door + 1 shelf | Add shelves, pull-out |
| MOD-B02 | Sink Base | Open for plumbing | None |
| MOD-B03 | Drawer Stack | 4 equal drawers | Dividers, cutlery insert |
| MOD-B04 | Pull-out Pantry | Wire baskets on runners | Basket count (4-6) |
| MOD-B05 | Corner Base | L-shaped access | Lazy Susan, pull-out |
| MOD-B06 | Appliance Tower | Open cavity | Shelf above/below |
| MOD-B07 | Open Shelving | No door, 2-3 shelves | Shelf count |

**Overhead Cabinets (5 types):**

| ID | Type | Description | Interior Options |
|----|------|-------------|------------------|
| MOD-O01 | Standard | 2 doors + 2 shelves | Add shelves |
| MOD-O02 | Glass Door | Glass inserts | Add shelves, LED ready |
| MOD-O03 | Open Shelf | No door, display | Shelf count |
| MOD-O04 | Rangehood Space | Open cavity | None |
| MOD-O05 | Lift-up Door | Single flip-up | Blum Aventos system |

### 4.5 Step 3: Finishes [v1] — Phase: 05

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FIN-001 | Swipeable cards layout | Material → Hardware → Profile sections |
| FIN-002 | Material selection with swatches | Visual color swatches, texture preview |
| FIN-003 | Hardware selection | Standard vs Premium tier indication |
| FIN-004 | Door profile selection | Visual examples of each profile |
| FIN-005 | 3D viewport updates materials live | Selected finish renders immediately |

### 4.6 Step 4: Review [v1] — Phase: 05

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REV-001 | Price breakdown displayed | Cabinets · Material · Hardware · Add-ons |
| REV-002 | Configuration summary | All selections listed |
| REV-003 | Edit links per section | Can jump back to any step |
| REV-004 | [Book Measure] CTA | Primary action visible in thumb zone |

### 4.7 Configurator Features [v1] — Phase: 04, 05

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| CFG-F01 | Undo/redo history | Last 20 states, visible undo button, shake-to-undo |
| CFG-F02 | Save design to cloud | Design synced to Convex, retrievable |
| CFG-F03 | Share via deep link | Shareable URL opens saved design |
| CFG-F04 | Before/after slider on renders | Swipeable comparison view |
| CFG-F05 | LOD system for performance | Geometry simplifies when zoomed out |

### 4.8 Touch Interactions [v1] — Phase: 04

| ID | Gesture | Action |
|----|---------|--------|
| TOUCH-001 | Single finger drag | Rotate view |
| TOUCH-002 | Pinch | Zoom in/out |
| TOUCH-003 | Two finger drag | Pan view |
| TOUCH-004 | Tap on slot | Select module |
| TOUCH-005 | Swipe left/right | Navigate wizard steps |

---

## 5. Pricing Engine

### 5.1 Component-Based Pricing [v1] — Phase: 05

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| PRICE-001 | Modules priced by type + width | Each combination has database price |
| PRICE-002 | Materials have flat prices | Single price per material selection |
| PRICE-003 | Door profiles priced per door | Price multiplied by door count |
| PRICE-004 | Hardware priced per item | Each hardware component in database |
| PRICE-005 | Add-ons have individual prices | LED: $45, Scribe filler: $35, etc. |
| PRICE-006 | ±5% supplier variance disclaimer | Displayed on all prices |

### 5.2 Price Display [v1] — Phase: 05

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| PRICE-D01 | Live total in sticky bar | Updates as user configures |
| PRICE-D02 | Category breakdown | Cabinets · Material · Hardware · Add-ons |
| PRICE-D03 | Exact prices shown | With disclaimer about site measure adjustment |
| PRICE-D04 | All prices from database | Editable by admin without code changes |

---

## 6. Quote & Submission Flow

### 6.1 Pre-Submit Options [v1] — Phase: 06

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| SUBMIT-001 | Site measure selection | "Professional site measure" or "Use my measurements" |
| SUBMIT-002 | Installation quote request | "Would you like an installation quote?" Yes/No |
| SUBMIT-003 | Name field (required) | Text input, validated |
| SUBMIT-004 | Email field (required) | Email input, validated |
| SUBMIT-005 | Submit button | Sends to internal queue |

### 6.2 Internal Queue [v1] — Phase: 06

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| QUEUE-001 | Submission appears in dashboard | Internal team sees new submissions |
| QUEUE-002 | Full configuration data visible | All selections, dimensions, preferences |
| QUEUE-003 | Customer contact info shown | Name, email, phone if provided |
| QUEUE-004 | Site measure/install flags | Clear indication of what was requested |
| QUEUE-005 | Status tracking | New → Quoted → Approved → In Production... |

### 6.3 Manual Quote Process [v1] — Phase: 06

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| QUOTE-001 | Team reviews submission | Can see all configuration details |
| QUOTE-002 | Team creates quote externally | Using existing invoicing tools |
| QUOTE-003 | Quote emailed to customer | Manual email with comprehensive details |
| QUOTE-004 | Quote validity: team determines | Team sets expiry per quote |

---

## 7. Payment & Orders

### 7.1 Payment Flow [v1] — Phase: 06

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| PAY-001 | Payment details in quote | Bank transfer details included |
| PAY-002 | Deposit required before work | Customer pays offline |
| PAY-003 | Order status: manual update | Team updates when deposit received |
| PAY-004 | Balance due before delivery | Final payment before dispatch |

### 7.2 Order Status [v1] — Phase: 07

| ID | Status | Description |
|----|--------|-------------|
| ORD-001 | Quote Sent | Customer has received quote |
| ORD-002 | Deposit Paid | Payment received, production scheduled |
| ORD-003 | In Production | Manufacturing in progress |
| ORD-004 | QC Complete | Quality check passed |
| ORD-005 | Ready to Ship | Packed, awaiting dispatch |
| ORD-006 | Shipped | In transit |
| ORD-007 | Delivered | Customer has received order |
| ORD-008 | Complete | Project finished |

---

## 8. Customer Portal

### 8.1 Portal Sections [v1] — Phase: 07

| ID | Section | Requirement |
|----|---------|-------------|
| PORT-001 | Order Status | Current stage, estimated dates, timeline view |
| PORT-002 | Production Photos | Photos uploaded by team during manufacturing |
| PORT-003 | Documents | Quote, invoice, specs accessible |
| PORT-004 | Installation Guides | How-to content, video placeholders |
| PORT-005 | QR Panel Lookup | Scan panel → see where it goes, assembly context |
| PORT-006 | Chat/Support | AI chat access, contact form |
| PORT-007 | Referral Program | Share link, track referral status |

---

## 9. Production Integration

### 9.1 Production Spec Export [v1] — Phase: 08

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| PROD-001 | PDF export | Human-readable production spec |
| PROD-002 | CSV export | Spreadsheet for panel schedules |
| PROD-003 | Project header | Order ID, customer, address, due date |
| PROD-004 | Cabinet schedule | ID, type, dimensions, config |
| PROD-005 | Panel schedule | ID, dimensions, material, grain |
| PROD-006 | Edge banding schedule | Panel ID, edges to band, tape code |
| PROD-007 | Drilling schedule | Panel ID, hole positions |
| PROD-008 | Hardware list | Code, description, quantity |
| PROD-009 | Assembly groups | Which panels form each cabinet |
| PROD-010 | QR label data | Panel ID, cabinet ref, dimensions |

### 9.2 QR Labels [v1] — Phase: 08

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| QR-001 | Panel info page | Dimensions, material, edge banding |
| QR-002 | Assembly context | Where panel fits, assembly instructions |
| QR-003 | Video tutorial placeholder | Field ready for future video content |

### 9.3 Pytha Automation [v2] — Phase: future

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| PYTHA-001 | JSON export format | Structured data for automation |
| PYTHA-002 | Parametric templates | Standard products in Pytha format |
| PYTHA-003 | Alphacam integration | Auto-import, auto-toolpath |

---

## 10. Notification System

### 10.1 Email Notifications [v1] — Phase: 07

| ID | Trigger | Content |
|----|---------|---------|
| NOTIF-001 | Order Confirmed | Thank you, timeline, next steps |
| NOTIF-002 | Production Started | "Your panels are being cut today!" |
| NOTIF-003 | QC Complete | Photos attached, quality confirmation |
| NOTIF-004 | Ready to Ship | Dispatch details, tracking info |
| NOTIF-005 | Delivered | Confirmation, installation guide links |
| NOTIF-006 | Post-Install (7 days) | Follow-up survey, referral program, review request |

---

## 11. Internal Dashboard

### 11.1 Dashboard Features [v1] — Phase: 08

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| DASH-001 | Submission queue | New quotes to process |
| DASH-002 | Order management | Update status, add notes |
| DASH-003 | Photo upload | Add production progress photos |
| DASH-004 | Production spec download | PDF + CSV for factory |
| DASH-005 | Customer communication log | Track emails sent |
| DASH-006 | Notification trigger | Manual trigger for status emails |

---

## 12. Database Schema

### 12.1 Core Tables [v1] — Phase: 01

| Table | Key Fields | Purpose |
|-------|------------|---------|
| users | id, email, name, phone, address | Customer accounts |
| designs | userId, productType, config, status, renders | Saved configurations |
| orders | designId, status, depositPaid, balanceDue, timeline | Order lifecycle |
| submissions | designId, name, email, siteMeasure, installQuote, status | Quote requests |
| cabinets | orderId, type, dimensions, config | Cabinet breakdown |
| panels | cabinetId, partType, dimensions, material, edges | Panel schedule |
| hardware | orderId, code, description, quantity | Hardware BOM |
| notifications | orderId, type, sentAt, status | Notification log |
| productionPhotos | orderId, url, uploadedAt, milestone | Progress photos |

### 12.2 Product Definition Tables [v1] — Phase: 01

| Table | Key Fields | Purpose |
|-------|------------|---------|
| styles | id, name, description, thumbnail, defaults | Curated style options |
| materials | id, code, name, collection, colorHex, texture, priceTier | Polytec materials |
| hardware | id, code, name, type, unitPrice | Blum hardware |
| doorProfiles | id, name, description, priceMultiplier | Edge profiles |
| products | id, name, description, basePrice, constraints | Product types |
| modules | id, type, name, widths, interiorOptions, addons, pricePerMm | Cabinet modules |
| addons | id, name, appliesTo, price | Add-on catalog |

---

## 13. Material & Hardware Reference

### 13.1 Polytec Materials [v1]

| Code | Name | Collection |
|------|------|------------|
| POL-NOWM | Natural Oak Woodmatt | Woodmatt |
| POL-PRWM | Prime Oak Woodmatt | Woodmatt |
| POL-COWM | Coastal Oak Woodmatt | Woodmatt |
| POL-WOWM | White Oak Woodmatt | Woodmatt |
| POL-BLWM | Blackbutt Woodmatt | Woodmatt |
| POL-WHST | White Satin | Melamine |
| POL-SHGR | Shadow Grey | Melamine |
| POL-MNTK | Midnight | Melamine |

### 13.2 Blum Hardware [v1]

| Code | Description |
|------|-------------|
| BLUM-CLIP-110 | Clip Top Blumotion 110° hinge |
| BLUM-CLIP-155 | Clip Top Blumotion 155° hinge (corner) |
| BLUM-TANDEM-450 | Tandembox Antaro 450mm runner pair |
| BLUM-TANDEM-500 | Tandembox Antaro 500mm runner pair |
| BLUM-TANDEM-550 | Tandembox Antaro 550mm runner pair |
| BLUM-LEGRA-500 | Legrabox 500mm runner pair (premium) |
| BLUM-SPACE-600 | Space Tower 600mm pull-out pantry |
| BLUM-AVENTOS-HK | Aventos HK-S lift system |

### 13.3 Add-ons Catalog [v1]

| Add-on | Applies To | Price |
|--------|------------|-------|
| LED Strip Lighting | Any cabinet | $45 |
| Scribe Filler | End cabinets | $35 |
| Wine Rack Insert | 300mm+ width | $120 |
| Pull-out Bin System | Base 450mm+ | $180 |
| Drawer Dividers | Drawer stack | $25/drawer |
| Cutlery Insert | Top drawer | $65 |

---

## 14. Non-Functional Requirements

### 14.1 Performance [v1]

| ID | Requirement | Target |
|----|-------------|--------|
| PERF-001 | First Contentful Paint | < 1.5 seconds |
| PERF-002 | Time to Interactive | < 3 seconds |
| PERF-003 | 3D Frame Rate | > 30 FPS |
| PERF-004 | Photo-to-Render Pipeline | < 30 seconds |
| PERF-005 | iOS App Size | < 50MB |
| PERF-006 | Android App Size | < 40MB |

### 14.2 Target Devices [v1]

| Platform | Minimum |
|----------|---------|
| iOS | iPhone 12 and later |
| Android | Mid-range 2021+ (Pixel 6, Galaxy A52 equivalent) |

### 14.3 Accessibility [v1]

| ID | Requirement |
|----|-------------|
| A11Y-001 | Touch targets minimum 44x44px |
| A11Y-002 | Color contrast WCAG AA |
| A11Y-003 | Screen reader compatible |

---

## Requirements Summary

| Category | v1 Count | v2 Count |
|----------|----------|----------|
| Architecture | 10 | 0 |
| UI/Navigation | 14 | 0 |
| AI Features | 11 | 4 |
| Configurator | 35 | 0 |
| Pricing | 10 | 0 |
| Quote/Submit | 11 | 0 |
| Payment/Orders | 12 | 0 |
| Portal | 7 | 0 |
| Production | 13 | 3 |
| Notifications | 6 | 0 |
| Dashboard | 6 | 0 |
| **TOTAL** | **135** | **7** |

All v1 requirements map to Phases 01-08 in ROADMAP.md.
