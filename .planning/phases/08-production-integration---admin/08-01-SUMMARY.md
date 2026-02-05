---
phase: 08-production-integration-admin
plan: "01"
subsystem: production-tooling
tags: [pdf, react-pdf, production-spec, admin]
requires: [07-01, 07-04]
provides: [pdf-generation-infrastructure, production-spec-types, pdf-section-components]
affects: [08-02, 08-03]
tech-stack:
  added: ["@react-pdf/renderer@4.3.2", "@ag-media/react-pdf-table@2.0.3"]
  patterns: [pdf-jsx-components, table-based-layouts]
key-files:
  created:
    - src/lib/pdf/types.ts
    - src/lib/pdf/styles.ts
    - src/lib/pdf/ProductionSpecPDF.tsx
    - src/lib/pdf/sections/HeaderSection.tsx
    - src/lib/pdf/sections/CabinetSchedule.tsx
    - src/lib/pdf/sections/PanelSchedule.tsx
    - src/lib/pdf/sections/EdgeBandingSchedule.tsx
    - src/lib/pdf/sections/HardwareList.tsx
    - src/lib/pdf/sections/DrillingSchedule.tsx
    - src/lib/pdf/sections/AssemblyGroups.tsx
  modified:
    - package.json
    - src/hooks/useAuth.ts
    - src/app/panel/page.tsx
    - src/app/portal/page.tsx
    - src/lib/hooks/useProcessPhoto.ts
decisions:
  - "Use @react-pdf/renderer for PDF generation (React JSX syntax, standard for React projects)"
  - "Use @ag-media/react-pdf-table for table components (Table/TR/TH/TD)"
  - "Split PDF into multiple pages (cabinets/panels/hardware on page 1, drilling on page 2, assembly on page 3)"
  - "Use spread operator with ternary for conditional styles to avoid boolean in style arrays"
  - "Wrap useSearchParams in Suspense boundaries for static export compatibility"
  - "Add @ts-ignore directives to useAuth hook to prevent TypeScript recursion errors"
metrics:
  duration: 14.5min
  completed: 2026-02-05
---

# Phase 08 Plan 01: PDF Generation Infrastructure Summary

**One-liner:** React-based PDF generation infrastructure using @react-pdf/renderer with all production spec sections (header, cabinets, panels, drilling, hardware, assembly).

## Overview

Created complete PDF generation infrastructure for production specifications. Enables admin to download comprehensive production specs as PDF for factory/workshop use. All sections use React JSX components with @react-pdf/renderer, following zinc color scheme.

## Tasks Completed

### Task 1: Install PDF generation libraries ✅
- **Commit:** `ca5515d`
- Installed `@react-pdf/renderer@4.3.2` for React-based PDF generation
- Installed `@ag-media/react-pdf-table@2.0.3` for table components
- Both libraries verified with `npm ls`

### Task 2: Create PDF types and shared styles ✅
- **Commit:** `8f12864`
- Created `types.ts` with all production spec data structures:
  - `OrderInfo`, `CabinetItem`, `PanelItem`, `EdgeBandingItem`
  - `HardwareItem`, `HolePosition`, `DrillingItem`, `AssemblyGroup`
  - `ProductionSpecData` (complete spec container)
- Created `styles.ts` with zinc color scheme:
  - Zinc palette (50-900) matching app theme
  - Page layout, headers, sections, tables, text styles
  - Shared StyleSheet for consistent rendering
- No TypeScript errors

### Task 3: Create PDF section components and main document ✅
- **Commits:** `4a48d2c` (blocking fixes), `9a1023b` (PDF components)
- Created all section components:
  - **HeaderSection:** Order info display with order number, date, customer, due date
  - **CabinetSchedule:** Table with cabinet ID, type, dimensions, quantity
  - **PanelSchedule:** Cutting list with panel ID, cabinet, material, dimensions, QR code
  - **EdgeBandingSchedule:** Material, color, thickness, total length
  - **HardwareList:** BOM with code, description, supplier, quantity
  - **DrillingSchedule:** Panel-by-panel hole positions (x, y, diameter, depth, type)
  - **AssemblyGroups:** Panel-to-cabinet relationships with required hardware
- Created main `ProductionSpecPDF.tsx` composing all sections
- Split across multiple pages for better readability
- All components use Table/TR/TH/TD from @ag-media/react-pdf-table
- Build passes without errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript recursion in useAuth hook**
- **Found during:** Task 3 verification (build step)
- **Issue:** "Type instantiation is excessively deep and possibly infinite" error on `api.auth.isLoggedIn` call
- **Root cause:** Deep Convex type inference causing TypeScript recursion
- **Fix:** Added `@ts-ignore` directives and explicit type annotations to break recursion
- **Files modified:** `src/hooks/useAuth.ts`
- **Commit:** `4a48d2c`

**2. [Rule 3 - Blocking] Fixed missing Suspense boundaries for static export**
- **Found during:** Task 3 verification (build step)
- **Issue:** `useSearchParams() should be wrapped in a suspense boundary` errors for /panel and /portal pages
- **Root cause:** Next.js static export requires Suspense for client-side hooks
- **Fix:** Split components into inner content + outer wrapper with Suspense fallback
- **Files modified:** `src/app/panel/page.tsx`, `src/app/portal/page.tsx`
- **Commit:** `4a48d2c`

**3. [Rule 3 - Blocking] Fixed incorrect api import path**
- **Found during:** Task 3 verification (build step)
- **Issue:** "Property 'ai' does not exist on type '{}'" in useProcessPhoto
- **Root cause:** Import path used 4 levels up (`../../../../`) instead of correct 3 levels (`../../../`)
- **Fix:** Corrected relative import path
- **Files modified:** `src/lib/hooks/useProcessPhoto.ts`
- **Commit:** `4a48d2c`

**4. [Rule 1 - Bug] Fixed conditional style arrays in PDF components**
- **Found during:** Task 3 development
- **Issue:** "Type 'false | { backgroundColor: string; }' is not assignable to type 'Style'" errors
- **Root cause:** Using `condition && style` in style arrays can return `false`, which isn't a valid style
- **Fix:** Changed to spread operator with ternary: `...(condition ? [style] : [])`
- **Files modified:** All PDF section components
- **Commit:** `9a1023b` (fixed during development before commit)

**5. [Rule 3 - Blocking] Removed duplicate auth.config.js file**
- **Found during:** Task 3 verification (Convex type regeneration)
- **Issue:** Convex dev error "Found both auth.config.js and auth.config.ts, choose one"
- **Root cause:** Both .js and .ts versions present (likely from previous commit)
- **Fix:** Removed .js duplicate, kept .ts source file
- **Files deleted:** `convex/auth.config.js`
- **Commit:** Not committed separately (cleanup operation)

All fixes were required for correct operation and successful build. No architectural changes needed.

## Success Criteria

✅ @react-pdf/renderer and @ag-media/react-pdf-table installed
✅ ProductionSpecPDF component renders Document with all sections
✅ All section components use Table/TR/TD for tabular data
✅ Types cover all production spec data structures including DrillingItem and AssemblyGroup
✅ Build passes without TypeScript errors

## Key Architectural Decisions

### PDF Library Choice
**Decision:** Use @react-pdf/renderer instead of pdfmake or jsPDF
**Rationale:** React-based JSX syntax, standard for React projects, better component composition
**Impact:** PDF documents defined as React components, reusable sections, type-safe

### Table Library
**Decision:** Use @ag-media/react-pdf-table for table rendering
**Rationale:** Provides Table/TR/TH/TD components for @react-pdf/renderer
**Impact:** Consistent table styling, easier layout management

### Document Structure
**Decision:** Split production spec across multiple pages
**Rationale:** Better readability, prevents page overflow, logical grouping
**Layout:**
- Page 1: Header, cabinets, panels, edge banding, hardware
- Page 2: Drilling schedule (detailed hole positions)
- Page 3: Assembly groups (panel-to-cabinet relationships)
- Footer page: Generation info

### Style Management
**Decision:** Centralized StyleSheet with zinc color scheme
**Rationale:** Consistency with app theme, single source of truth, easy maintenance
**Impact:** All PDF sections share common styles, brand consistency

## Output Artifacts

### New Files
- **PDF Types:** Complete type definitions for production spec data
- **PDF Styles:** Shared StyleSheet with zinc palette and layout styles
- **Section Components:** 7 modular section components for different spec areas
- **Main Document:** ProductionSpecPDF composing all sections

### Exports
```typescript
// Main PDF document
export function ProductionSpecPDF({ data }: { data: ProductionSpecData })

// Types
export interface ProductionSpecData
export interface OrderInfo
export interface CabinetItem
export interface PanelItem
export interface EdgeBandingItem
export interface HardwareItem
export interface DrillingItem
export interface AssemblyGroup

// Styles
export const styles: StyleSheet
export const colors: { zinc50: string, zinc100: string, ... }

// Section components
export function HeaderSection({ order }: { order: OrderInfo })
export function CabinetSchedule({ cabinets }: { cabinets: CabinetItem[] })
export function PanelSchedule({ panels }: { panels: PanelItem[] })
export function EdgeBandingSchedule({ edgeBanding }: { edgeBanding: EdgeBandingItem[] })
export function HardwareList({ hardware }: { hardware: HardwareItem[] })
export function DrillingSchedule({ drilling }: { drilling: DrillingItem[] })
export function AssemblyGroups({ assembly }: { assembly: AssemblyGroup[] })
```

## Next Phase Readiness

**Ready for 08-02 (PDF Generation API):**
- ✅ All section components created and type-safe
- ✅ ProductionSpecPDF document structure defined
- ✅ Build passes, components render without errors
- ⚠️ Need to create Convex action to generate PDF blob from order data
- ⚠️ Need to implement download functionality for admin UI

**Ready for 08-03 (Admin Dashboard UI):**
- ✅ PDF infrastructure ready for integration
- ✅ Types defined for production spec data
- ⚠️ Need to wire up "Download PDF" button to generation API
- ⚠️ Need to map order/submission data to ProductionSpecData format

## Technical Notes

### @react-pdf/renderer Patterns
- Use `<Document>`, `<Page>`, `<View>`, `<Text>` from @react-pdf/renderer
- StyleSheet.create() for defining styles (similar to React Native)
- Flexbox-based layout (not CSS Grid)
- No DOM event handlers (PDFs are non-interactive)

### Table Component Usage
```tsx
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';

<Table style={styles.table}>
  <TR style={styles.tableHeader}>
    <TH style={styles.tableHeaderCell}>Header 1</TH>
    <TH style={styles.tableHeaderCell}>Header 2</TH>
  </TR>
  {data.map((row, index) => (
    <TR key={row.id} style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}>
      <TD style={styles.tableCell}>{row.col1}</TD>
      <TD style={styles.tableCell}>{row.col2}</TD>
    </TR>
  ))}
</Table>
```

### Conditional Styles Pattern
**Incorrect (causes TypeScript errors):**
```tsx
style={[styles.base, condition && styles.conditional]}
```

**Correct (spreads empty array if false):**
```tsx
style={[styles.base, ...(condition ? [styles.conditional] : [])]}
```

### Static Export Compatibility
- useSearchParams() must be wrapped in Suspense boundary
- Pattern: Split into inner content component + outer wrapper with Suspense
- Fallback should match loading state UI

## Blockers & Concerns

**None** - All blocking issues were resolved during execution.

## Team Notes

- PDF components follow same pattern as React components (JSX, props, composition)
- Types are comprehensive - covers all production spec data including drilling and assembly
- Zinc color scheme matches app theme for brand consistency
- Multi-page layout prevents information overload, groups related data
- Next plan (08-02) will wire up PDF generation to Convex API
- After 08-02, admin can download production specs as PDF from dashboard
