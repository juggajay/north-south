"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Loader2, QrCode } from "lucide-react";
import { downloadPanelCSV, downloadHardwareCSV } from "@/lib/csv";
import { transformOrderToSpec, convertToPDFFormat } from "@/lib/pdf/transformOrderToSpec";

// Dynamic import for PDF components - required for Next.js static export
// IMPORTANT per RESEARCH.md: @react-pdf/renderer cannot SSR
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading PDF...
      </Button>
    ),
  }
);

// Dynamically import ProductionSpecPDF to avoid SSR issues
const ProductionSpecPDF = dynamic(
  () => import("@/lib/pdf/ProductionSpecPDF").then((mod) => mod.ProductionSpecPDF),
  { ssr: false }
);

interface SpecDownloaderProps {
  order: {
    _id: string;
    orderNumber: string;
    createdAt: number;
    submission?: {
      name: string;
      email: string;
      siteMeasure: boolean;
      installQuote: boolean;
      notes?: string;
    } | null;
    design?: {
      productType: string;
      config?: any;
    } | null;
  };
}

export function SpecDownloader({ order }: SpecDownloaderProps) {
  // Transform order to spec data (CSV format)
  const specData = transformOrderToSpec(order);

  // Convert to PDF format
  const pdfData = convertToPDFFormat(specData, order._id);

  const handlePanelCSV = () => {
    downloadPanelCSV(specData.panels, order.orderNumber);
  };

  const handleHardwareCSV = () => {
    downloadHardwareCSV(specData.hardware, order.orderNumber);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Download Production Specs
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* PDF Download */}
        <PDFDownloadLink
          document={<ProductionSpecPDF data={pdfData} />}
          fileName={`${order.orderNumber}-production-spec.pdf`}
        >
          {({ loading }) => (
            <Button
              variant="outline"
              disabled={loading}
              className="w-full justify-start"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {loading ? "Generating PDF..." : "Production Spec (PDF)"}
            </Button>
          )}
        </PDFDownloadLink>

        {/* Panel Schedule CSV */}
        <Button
          variant="outline"
          onClick={handlePanelCSV}
          className="w-full justify-start"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Panel Schedule (CSV)
        </Button>

        {/* Hardware List CSV */}
        <Button
          variant="outline"
          onClick={handleHardwareCSV}
          className="w-full justify-start"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Hardware List (CSV)
        </Button>

        {/* QR Labels - links to printable page */}
        <Button
          variant="outline"
          onClick={() => {
            // Open QR label sheet in new window for printing
            window.open(`/admin/qr-labels?id=${order._id}`, "_blank");
          }}
          className="w-full justify-start"
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Labels (Print)
        </Button>
      </div>

      <p className="text-xs text-zinc-500">
        PDF includes: header, cabinet schedule, panel schedule, edge banding, hardware list.
        CSV files can be imported into Excel or Google Sheets.
      </p>
    </div>
  );
}
