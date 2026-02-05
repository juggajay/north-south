# Phase 08: Production Integration & Admin - Research

**Researched:** 2026-02-05
**Domain:** PDF/CSV Export, QR Code Generation, Admin Dashboard
**Confidence:** HIGH

## Summary

Phase 08 implements production spec exports (PDF + CSV), QR label generation, and admin dashboard functionality. The research identifies the standard React stack for these features: @react-pdf/renderer for PDF generation, react-papaparse for CSV export, and qrcode.react for QR code generation.

The key architectural challenge is Next.js static export compatibility - all PDF/CSV generation must be client-side since there's no server-side rendering. The admin dashboard builds on existing Phase 06 patterns (SubmissionQueue, StatusBadge) but adds order management, photo upload, and notification triggers.

Existing infrastructure from Phase 07 provides a strong foundation: document storage (convex/documents.ts), production photos (convex/productionPhotos.ts), panels/QR codes (convex/panels.ts), and email notifications (convex/notifications/). The main work is building the UI and PDF generation logic.

**Primary recommendation:** Use @react-pdf/renderer with @ag-media/react-pdf-table for PDF specs, react-papaparse for CSV export, and qrcode.react for QR codes. All generation happens client-side with blob downloads.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | 4.3.x | PDF document generation | React-native JSX syntax, works browser + server, 860k weekly downloads |
| @ag-media/react-pdf-table | latest | Table components for PDF | Declarative Table/TR/TD components for @react-pdf/renderer |
| react-papaparse | latest | CSV generation & download | 500k+ weekly downloads, jsonToCSV + CSVDownloader |
| qrcode.react | 4.2.x | QR code generation | 1100+ dependents, SVG/Canvas output, React-native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| file-saver | latest | Blob download helper | If native download fails |
| lucide-react | (existing) | Icons | Already in project |
| sonner | (existing) | Toast notifications | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | jsPDF | jsPDF is lighter but no JSX syntax, harder to maintain complex layouts |
| @ag-media/react-pdf-table | Manual View/Text | Tables are complex; library handles column widths, borders |
| react-papaparse | Manual JSON.stringify | PapaParse handles edge cases (escaping, large files, streaming) |
| qrcode.react | react-qr-code | qrcode.react has more features (error correction levels, image embedding) |

**Installation:**
```bash
npm install @react-pdf/renderer @ag-media/react-pdf-table react-papaparse qrcode.react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    pdf/
      ProductionSpecPDF.tsx    # Main PDF document component
      sections/
        HeaderSection.tsx       # Project header
        CabinetSchedule.tsx     # Cabinet schedule table
        PanelSchedule.tsx       # Panel schedule table
        EdgeBandingSchedule.tsx # Edge banding table
        DrillingSchedule.tsx    # Drilling positions table
        HardwareList.tsx        # Hardware BOM table
        AssemblyGroups.tsx      # Assembly grouping
        QRLabelData.tsx         # QR code data section
      styles.ts                 # Shared PDF styles
    csv/
      generatePanelCSV.ts       # Panel schedule CSV generator
      generateHardwareCSV.ts    # Hardware list CSV generator
    qr/
      generatePanelQR.ts        # QR code data generator
  components/
    admin/
      OrderManagement.tsx       # Order list with status management
      OrderDetail.tsx           # Single order detail view
      PhotoUploader.tsx         # Production photo upload
      NotificationTrigger.tsx   # Manual email trigger
      SpecDownloader.tsx        # PDF/CSV download buttons
    portal/
      (existing from Phase 07)
  app/
    admin/
      submissions/page.tsx      # (existing)
      orders/page.tsx           # New: Order management
      orders/[id]/page.tsx      # New: Order detail
```

### Pattern 1: Client-Side PDF Generation with Dynamic Import
**What:** Generate PDFs in browser, bypass SSR issues
**When to use:** Any PDF generation in Next.js static export
**Example:**
```typescript
// Source: https://react-pdf.org/
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamic import prevents SSR issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export function SpecDownloader({ order }: { order: Order }) {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <PDFDownloadLink
      document={<ProductionSpecPDF order={order} />}
      fileName={`${order.orderNumber}-production-spec.pdf`}
    >
      {({ loading }) => (loading ? "Generating..." : "Download PDF")}
    </PDFDownloadLink>
  );
}
```

### Pattern 2: CSV Export with Blob Download
**What:** Generate CSV client-side and trigger download
**When to use:** Spreadsheet exports
**Example:**
```typescript
// Source: https://react-papaparse.js.org/
import { jsonToCSV } from "react-papaparse";

export function downloadPanelCSV(panels: Panel[], orderNumber: string) {
  // Convert to flat array for CSV
  const data = panels.map((panel) => ({
    panelId: panel.id,
    dimensions: `${panel.width}x${panel.height}x${panel.depth}`,
    material: panel.material,
    grainDirection: panel.grain || "N/A",
    moduleRef: panel.moduleRef,
  }));

  const csv = jsonToCSV(data);

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${orderNumber}-panel-schedule.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Pattern 3: QR Code Data Generation for Panels
**What:** Generate QR codes encoding panel info
**When to use:** Creating scannable labels for production
**Example:**
```typescript
// Source: https://github.com/zpao/qrcode.react
import { QRCodeSVG } from "qrcode.react";

// QR code format from STATE.md: {orderId}-{panelId}
export function PanelQRCode({ orderId, panelId }: { orderId: string; panelId: string }) {
  const qrValue = `${orderId}-${panelId}`;
  const scanUrl = `https://northsouthcarpentry.com/panel/${qrValue}`;

  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG
        value={scanUrl}
        size={128}
        level="M" // 15% error correction
        marginSize={2}
      />
      <span className="text-xs mt-1">{panelId}</span>
    </div>
  );
}
```

### Pattern 4: Admin Order Status Flow
**What:** Manage order lifecycle with status transitions
**When to use:** Admin dashboard order management
**Example:**
```typescript
// Status flow: confirmed -> production -> qc -> ready_to_ship -> shipped -> delivered -> complete
const STATUS_TRANSITIONS = {
  confirmed: ["production"],
  production: ["qc"],
  qc: ["ready_to_ship"],
  ready_to_ship: ["shipped"],
  shipped: ["delivered"],
  delivered: ["complete"],
  complete: [],
};

// Only show valid next status actions
const nextStatuses = STATUS_TRANSITIONS[order.status] || [];
```

### Anti-Patterns to Avoid
- **Server-side PDF generation in static export:** @react-pdf/renderer PDFDownloadLink cannot SSR - always use dynamic import with ssr: false
- **Large CSV in memory:** For very large datasets, use streaming. react-papaparse supports chunked processing
- **QR without error correction:** Always use level "M" or "Q" for production labels (handles wear/damage)
- **Inline PDF styles:** Use StyleSheet.create() for performance - styles are pre-computed

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF table layouts | Manual View/Text positioning | @ag-media/react-pdf-table | Column widths, borders, cell padding all handled |
| CSV escaping | Manual string concatenation | react-papaparse jsonToCSV | Handles commas in values, quotes, newlines |
| QR error correction | Custom encoding | qrcode.react with level prop | Reed-Solomon encoding is complex |
| Blob downloads | Custom fetch/download logic | Native URL.createObjectURL | Browser-native, no polyfills |
| PDF pagination | Manual page breaks | @react-pdf/renderer wrap prop | Automatic page breaking |

**Key insight:** PDF/CSV generation looks simple until you hit edge cases - special characters, page breaks, column alignment. Use established libraries.

## Common Pitfalls

### Pitfall 1: SSR with @react-pdf/renderer
**What goes wrong:** Build fails with "window is not defined" or hydration mismatch
**Why it happens:** PDFDownloadLink requires browser APIs (Blob, canvas)
**How to avoid:** Always dynamic import with `ssr: false`
**Warning signs:** Build errors mentioning window, document, or canvas

### Pitfall 2: PDF Memory on Large Documents
**What goes wrong:** Browser tab crashes or freezes
**Why it happens:** @react-pdf/renderer builds entire document in memory
**How to avoid:** For orders with 100+ panels, consider pagination or chunked generation
**Warning signs:** UI freezes when clicking download, RAM usage spikes

### Pitfall 3: QR Code Size vs Scanability
**What goes wrong:** QR codes too small or dense to scan
**Why it happens:** More data = more modules = harder to scan
**How to avoid:** Keep QR value under 100 chars, use minimum size 96px, level M+ error correction
**Warning signs:** Installer complaints, scan failures on factory floor

### Pitfall 4: CSV Number Formatting
**What goes wrong:** Excel interprets dimensions as dates (e.g., "3/4" becomes March 4)
**Why it happens:** Excel auto-formats numbers
**How to avoid:** Prefix numeric strings with single quote or use explicit text format
**Warning signs:** QA reports showing wrong values in spreadsheet

### Pitfall 5: File Download in iOS Safari
**What goes wrong:** Download opens in new tab instead of saving
**Why it happens:** iOS Safari doesn't support download attribute reliably
**How to avoid:** For iOS, open blob URL in new tab with clear filename
**Warning signs:** Mobile users can't save files

## Code Examples

Verified patterns from official sources:

### PDF Document Structure
```typescript
// Source: https://react-pdf.org/components
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 10 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 5 },
});

export function ProductionSpecPDF({ order }: { order: OrderData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Production Specification</Text>
          <Text>Order: {order.orderNumber}</Text>
          <Text>Customer: {order.customerName}</Text>
          <Text>Due: {order.dueDate}</Text>
        </View>

        {/* Cabinet Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabinet Schedule</Text>
          <Table>
            <TH>
              <TD>ID</TD>
              <TD>Type</TD>
              <TD>Dimensions</TD>
              <TD>Config</TD>
            </TH>
            {order.cabinets.map((cab) => (
              <TR key={cab.id}>
                <TD>{cab.id}</TD>
                <TD>{cab.type}</TD>
                <TD>{`${cab.width}x${cab.height}x${cab.depth}`}</TD>
                <TD>{cab.config}</TD>
              </TR>
            ))}
          </Table>
        </View>

        {/* Additional sections... */}
      </Page>
    </Document>
  );
}
```

### QR Label Sheet Generation
```typescript
// Source: https://github.com/zpao/qrcode.react
import { QRCodeSVG } from "qrcode.react";

interface PanelLabel {
  panelId: string;
  cabinetRef: string;
  dimensions: string;
}

export function QRLabelSheet({ orderId, panels }: { orderId: string; panels: PanelLabel[] }) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {panels.map((panel) => (
        <div key={panel.panelId} className="border p-2 text-center">
          <QRCodeSVG
            value={`${orderId}-${panel.panelId}`}
            size={96}
            level="M"
            marginSize={1}
          />
          <div className="text-xs mt-1 font-mono">{panel.panelId}</div>
          <div className="text-xs text-zinc-500">{panel.cabinetRef}</div>
          <div className="text-xs">{panel.dimensions}</div>
        </div>
      ))}
    </div>
  );
}
```

### Admin Photo Upload with Convex
```typescript
// Source: https://docs.convex.dev/file-storage/upload-files
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PhotoUploader({ orderId }: { orderId: Id<"orders"> }) {
  const generateUploadUrl = useMutation(api.productionPhotos.generateUploadUrl);
  const uploadPhoto = useMutation(api.productionPhotos.upload);

  const handleUpload = async (file: File, milestone: string) => {
    // 1. Get upload URL
    const uploadUrl = await generateUploadUrl();

    // 2. Upload file
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    // 3. Save reference
    await uploadPhoto({
      orderId,
      storageId,
      milestone,
      caption: `Production photo - ${milestone}`,
    });
  };

  return (/* UI */);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pdfmake (JSON config) | @react-pdf/renderer (JSX) | 2020+ | React developers can use familiar syntax |
| Manual CSV string building | react-papaparse jsonToCSV | 2018+ | Handles edge cases automatically |
| Server-side PDF generation | Client-side with dynamic import | Next.js 13+ | Works with static export |
| Canvas-only QR codes | SVG + Canvas options | qrcode.react 4.x | Better scaling, accessibility |

**Deprecated/outdated:**
- jsPDF without html2canvas: Limited styling support
- Server-side PDF in Next.js static export: Not compatible

## Open Questions

Things that couldn't be fully resolved:

1. **Exact PDF column widths for production spec**
   - What we know: @ag-media/react-pdf-table supports weightings prop for column ratios
   - What's unclear: Optimal column distribution for each schedule (panel, edge, drilling)
   - Recommendation: Start with equal weights, adjust based on content during implementation

2. **QR code print size for factory floor**
   - What we know: Minimum 96px for digital, but print needs consideration
   - What's unclear: Exact DPI and physical size requirements for scanner
   - Recommendation: Default 25mm (1 inch) physical size, allow config in admin

3. **Large order performance**
   - What we know: @react-pdf/renderer can struggle with 500+ elements
   - What's unclear: Average order size for North South
   - Recommendation: Monitor performance, implement pagination if needed

## Sources

### Primary (HIGH confidence)
- [react-pdf.org/components](https://react-pdf.org/components) - Official @react-pdf/renderer documentation
- [github.com/zpao/qrcode.react](https://github.com/zpao/qrcode.react) - qrcode.react API and examples
- [github.com/ag-media/react-pdf-table](https://github.com/ag-media/react-pdf-table) - Table component API
- [docs.convex.dev/file-storage](https://docs.convex.dev/file-storage) - Convex file storage patterns

### Secondary (MEDIUM confidence)
- [blog.logrocket.com/generating-pdfs-react](https://blog.logrocket.com/generating-pdfs-react/) - PDF generation patterns
- [react-papaparse.js.org](https://react-papaparse.js.org/) - CSV generation docs

### Tertiary (LOW confidence)
- WebSearch results for Next.js static export PDF patterns - needs validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are well-documented with npm stats
- Architecture: HIGH - Patterns verified with official docs
- Pitfalls: MEDIUM - Based on documentation warnings and community patterns

**Research date:** 2026-02-05
**Valid until:** 30 days (stable libraries, minimal breaking changes expected)
