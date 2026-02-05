"use client";

import { QRCodeSVG } from "qrcode.react";

export interface PanelLabel {
  panelId: string;
  cabinetRef: string;
  dimensions: string; // "600 x 800 x 18mm"
  material: string;
}

interface QRLabelSheetProps {
  orderId: string;
  orderNumber: string;
  panels: PanelLabel[];
  /** QR code size in pixels (default: 96) */
  qrSize?: number;
}

/**
 * Printable QR label sheet for production floor
 *
 * Each label contains:
 * - QR code linking to /panel/{orderId}-{panelId}
 * - Panel ID
 * - Cabinet reference
 * - Dimensions
 *
 * IMPORTANT per RESEARCH.md:
 * - Use error correction level "M" (15%) minimum for production labels
 * - Keep QR value under 100 chars for reliable scanning
 * - Minimum 96px size for digital, ~25mm for print
 */
export function QRLabelSheet({
  orderId,
  orderNumber,
  panels,
  qrSize = 96,
}: QRLabelSheetProps) {
  // Base URL for panel lookup (public route from Phase 07)
  const baseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/panel`
    : "https://northsouthcarpentry.com/panel";

  return (
    <div className="p-4 bg-white">
      {/* Print header - hidden on screen */}
      <div className="print:block hidden mb-4 text-center">
        <h1 className="text-lg font-bold">North South Carpentry</h1>
        <p className="text-sm text-zinc-600">QR Labels - Order {orderNumber}</p>
      </div>

      {/* Label grid - 4 columns on screen/print */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {panels.map((panel) => {
          // QR code format from STATE.md: {orderId}-{panelId}
          const qrValue = `${baseUrl}/${orderId}-${panel.panelId}`;

          return (
            <div
              key={panel.panelId}
              className="border border-zinc-200 p-3 text-center rounded-lg print:border-black print:rounded-none print:p-2"
            >
              <QRCodeSVG
                value={qrValue}
                size={qrSize}
                level="M" // 15% error correction - handles wear/damage
                marginSize={1}
                className="mx-auto"
              />
              <div className="mt-2 space-y-0.5">
                <p className="text-xs font-mono font-bold text-zinc-900">
                  {panel.panelId}
                </p>
                <p className="text-xs text-zinc-600 truncate">
                  {panel.cabinetRef}
                </p>
                <p className="text-xs text-zinc-500">
                  {panel.dimensions}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print footer */}
      <div className="print:block hidden mt-4 text-center text-xs text-zinc-500">
        Scan QR codes to view panel details and assembly instructions
      </div>
    </div>
  );
}

/**
 * Print-specific styles for label sheet
 * Add to global CSS or page-specific stylesheet
 */
export const printStyles = `
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;
