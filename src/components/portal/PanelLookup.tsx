"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PanelCard, PanelNotFound } from "./PanelCard";

interface PanelLookupProps {
  qrCode: string;
}

/**
 * Loading skeleton matching PanelCard dimensions
 */
function LoadingSkeleton() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Material swatch skeleton */}
      <div className="h-32 bg-zinc-200" />

      {/* Content skeleton */}
      <div className="p-6 space-y-3">
        {/* Panel name skeleton */}
        <div className="h-6 bg-zinc-200 rounded w-3/4" />

        {/* Dimensions skeleton */}
        <div className="h-5 bg-zinc-200 rounded w-1/2" />

        {/* Material skeleton */}
        <div className="h-6 bg-zinc-200 rounded w-2/3" />

        {/* Finish skeleton */}
        <div className="h-5 bg-zinc-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export function PanelLookup({ qrCode }: PanelLookupProps) {
  // Query panel data - PUBLIC (no auth check)
  const panel = useQuery(api.panels.lookupByQrCode, { qrCode });

  // Loading state
  if (panel === undefined) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  // Not found state
  if (panel === null) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <PanelNotFound qrCode={qrCode} />
      </div>
    );
  }

  // Success - show panel card
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      {/* Panel info card */}
      <PanelCard
        panelName={panel.panelName}
        dimensions={panel.dimensions}
        material={panel.material}
        finish={panel.finish}
      />

      {/* North South branding */}
      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500">North South Carpentry</p>
      </div>
    </div>
  );
}
