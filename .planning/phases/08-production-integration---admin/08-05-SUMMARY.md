---
phase: 08-production-integration-admin
plan: 05
subsystem: admin
tags: [pdf, csv, qr, react-pdf-renderer, papaparse, qrcode-react, admin-ui]

# Dependency graph
requires:
  - phase: 08-01
    provides: PDF generation infrastructure (ProductionSpecPDF, types, sections)
  - phase: 08-02
    provides: CSV generation utilities (generatePanelCSV, generateHardwareCSV)
  - phase: 08-03
    provides: Admin OrderCard component and orders page
provides:
  - Order-to-spec data transformer (transformOrderToSpec)
  - SpecDownloader component with PDF/CSV/QR download buttons
  - QR labels print page at /admin/qr-labels
  - PDF-CSV type adapter (convertToPDFFormat)
  - Admin can download production specs directly from orders
affects: [08-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dynamic import with ssr:false for @react-pdf/renderer
    - Query param-based routes for static export compatibility
    - Type adapters to bridge incompatible library structures
    - serverExternalPackages config for SSR-incompatible packages

key-files:
  created:
    - src/lib/pdf/transformOrderToSpec.ts
    - src/components/admin/SpecDownloader.tsx
    - src/app/admin/qr-labels/page.tsx
  modified:
    - src/components/admin/OrderCard.tsx
    - next.config.ts

key-decisions:
  - "Use type adapter pattern to bridge CSV and PDF library structures"
  - "Use static route with query params for QR labels instead of dynamic [id] route"
  - "Configure serverExternalPackages for @react-pdf/renderer in Next.js 16"

patterns-established:
  - "SSR-incompatible packages: dynamic import + ssr:false + serverExternalPackages"
  - "Admin printable pages: static route + query param + Suspense wrapper"

# Metrics
duration: 11min
completed: 2026-02-05
---

# Phase 08 Plan 05: Production Spec Downloads Summary

**Admin downloads production PDFs and CSVs via SpecDownloader with QR label printing, using type adapters to bridge incompatible library structures**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-05T07:19:11Z
- **Completed:** 2026-02-05T07:30:24Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Transformer converts order data to production spec format for both PDF and CSV
- SpecDownloader component provides one-click downloads (PDF, Panel CSV, Hardware CSV, QR Labels)
- QR labels page generates printable panel labels with QR codes
- Type adapter bridges CSV and PDF library structure mismatches
- Static export build passes with proper SSR externalization

## Task Commits

Each task was committed atomically:

1. **Task 1: Create order-to-spec data transformer** - `83b60d0` (feat)
   - Transform order data to ProductionSpecData format
   - Generate cabinets from design slots
   - Calculate panel cut list with edge banding
   - Generate hardware BOM from cabinet types

2. **Task 2: Create SpecDownloader component** - `6bcf4a7` (feat)
   - Dynamic import PDFDownloadLink with ssr: false
   - Dynamic import ProductionSpecPDF to avoid SSR
   - PDF, Panel CSV, Hardware CSV, QR Labels buttons
   - Type converter function (convertToPDFFormat)

3. **Task 3: Integrate SpecDownloader and create QR labels page** - `306e396` (feat)
   - Add SpecDownloader to OrderCard as collapsible section
   - QR labels page at /admin/qr-labels with query params
   - Static route pattern for export compatibility
   - serverExternalPackages config for @react-pdf/renderer

## Files Created/Modified
- `src/lib/pdf/transformOrderToSpec.ts` - Transforms order data to spec format, bridges CSV and PDF types
- `src/components/admin/SpecDownloader.tsx` - Download buttons for PDF, CSV, QR labels
- `src/app/admin/qr-labels/page.tsx` - Printable QR label sheet with Suspense wrapper
- `src/components/admin/OrderCard.tsx` - Added Production Specs collapsible section
- `next.config.ts` - Added serverExternalPackages for @react-pdf/renderer

## Decisions Made

**1. Type adapter pattern for incompatible libraries**
- **Context:** PDF library (08-01) expects `panelId`, `cabinetId`, `type`, `qrCode` structure
- **Context:** CSV library (08-02) expects `id`, `cabinetRef`, `name` structure
- **Decision:** Create transformOrderToSpec → CSV format, then convertToPDFFormat adapter
- **Rationale:** Avoids rewriting either library, maintains backward compatibility

**2. Static route with query params for QR labels**
- **Context:** Dynamic routes `/admin/orders/[id]/qr-labels` require generateStaticParams
- **Context:** Client components can't export generateStaticParams
- **Decision:** Use `/admin/qr-labels?id=xxx` pattern like Phase 07 portal
- **Rationale:** Static export compatible, matches established pattern

**3. serverExternalPackages for Next.js 16 Turbopack**
- **Context:** @react-pdf/renderer fails SSR with "ModuleId not found" error
- **Context:** webpack config doesn't work in Next.js 16 (Turbopack default)
- **Decision:** Use `serverExternalPackages: ["@react-pdf/renderer"]` in next.config
- **Rationale:** Turbopack-native way to externalize SSR-incompatible packages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Type structure mismatch between CSV and PDF libraries**
- **Found during:** Task 2 (SpecDownloader component creation)
- **Issue:** PDF library expects different panel structure than CSV exports
- **Fix:** Created ProductionSpecData for CSV format, added convertToPDFFormat adapter function
- **Files modified:** src/lib/pdf/transformOrderToSpec.ts
- **Verification:** Build passes, type checking succeeds
- **Committed in:** 6bcf4a7 (Task 2 commit)

**2. [Rule 3 - Blocking] Next.js 16 Turbopack SSR externalization**
- **Found during:** Task 3 (Build verification)
- **Issue:** @react-pdf/renderer fails SSR with "ModuleId not found for @react-pdf/renderer"
- **Fix:** Added `serverExternalPackages: ["@react-pdf/renderer"]` to next.config.ts
- **Files modified:** next.config.ts
- **Verification:** Build passes without SSR errors
- **Committed in:** 306e396 (Task 3 commit)

**3. [Rule 3 - Blocking] Dynamic route incompatible with static export**
- **Found during:** Task 3 (Build verification)
- **Issue:** Dynamic route `/admin/orders/[id]/qr-labels` requires generateStaticParams
- **Fix:** Changed to static route `/admin/qr-labels` with query param `?id=xxx`
- **Files modified:** src/app/admin/qr-labels/page.tsx, src/components/admin/SpecDownloader.tsx
- **Verification:** Build passes, route statically exported
- **Committed in:** 306e396 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All deviations necessary for build success and library compatibility. No scope creep. Followed Phase 07 pattern for static routes.

## Issues Encountered

**Turbopack webpack config incompatibility:**
- Attempted to use webpack externals config for @react-pdf/renderer
- Next.js 16 uses Turbopack by default, webpack config triggers error
- Solution: Used serverExternalPackages (Turbopack-native config)

**generateStaticParams with "use client":**
- Client components cannot export generateStaticParams
- Dynamic routes require it for static export
- Solution: Switched to static route with query params (matches Phase 07 portal pattern)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 08-06:**
- Production spec downloads fully functional
- PDF/CSV generation verified via build
- QR labels print page working with static export
- Type adapter pattern established for future library integrations

**No blockers.**

---
*Phase: 08-production-integration-admin*
*Completed: 2026-02-05*
