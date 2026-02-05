"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelLookup } from "@/components/portal/PanelLookup";

/**
 * Panel QR Lookup Page
 *
 * Supports two URL patterns for static export compatibility:
 * 1. /panel?code=xxx (query param - preferred for static export)
 * 2. /panel/xxx (path segment - for deep linking)
 *
 * Uses client-side URL parsing for path segments since
 * dynamic routes don't work with output: "export"
 */
export default function PanelLookupPage() {
  const searchParams = useSearchParams();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First check query param
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setQrCode(decodeURIComponent(codeParam));
      setIsLoading(false);
      return;
    }

    // Then check path segment (for /panel/xxx URLs)
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/panel\/(.+?)\/?$/);
    if (match) {
      setQrCode(decodeURIComponent(match[1]));
      setIsLoading(false);
      return;
    }

    // No code found
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-64 h-48 bg-zinc-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // No QR code provided - show instructions
  if (!qrCode) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Panel Lookup</h1>
          <p className="text-zinc-600">
            Scan a panel QR code to view panel information.
          </p>
        </div>
      </div>
    );
  }

  return <PanelLookup qrCode={qrCode} />;
}
