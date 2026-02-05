"use client";

import React from "react";

interface PanelCardProps {
  panelName: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  material: string;
  finish: string;
}

/**
 * Get background color for material swatch based on material name
 * Simple color mapping until actual DB swatches are added
 */
function getMaterialSwatchColor(material: string): string {
  const materialLower = material.toLowerCase();

  // Oak/wood tones → amber
  if (
    materialLower.includes("oak") ||
    materialLower.includes("wood") ||
    materialLower.includes("natural")
  ) {
    return "from-amber-200 via-amber-300 to-amber-400";
  }

  // White/light → zinc
  if (
    materialLower.includes("white") ||
    materialLower.includes("pearl") ||
    materialLower.includes("snow")
  ) {
    return "from-zinc-100 via-zinc-200 to-zinc-300";
  }

  // Black/dark → slate
  if (
    materialLower.includes("black") ||
    materialLower.includes("charcoal") ||
    materialLower.includes("graphite")
  ) {
    return "from-slate-700 via-slate-800 to-slate-900";
  }

  // Grey/neutral → stone
  if (materialLower.includes("grey") || materialLower.includes("gray")) {
    return "from-stone-300 via-stone-400 to-stone-500";
  }

  // Blue tones → sky
  if (materialLower.includes("blue") || materialLower.includes("ocean")) {
    return "from-sky-300 via-sky-400 to-sky-500";
  }

  // Green tones → emerald
  if (materialLower.includes("green") || materialLower.includes("sage")) {
    return "from-emerald-300 via-emerald-400 to-emerald-500";
  }

  // Default fallback → neutral gradient
  return "from-zinc-400 via-zinc-500 to-zinc-600";
}

export function PanelCard({
  panelName,
  dimensions,
  material,
  finish,
}: PanelCardProps) {
  const swatchColor = getMaterialSwatchColor(material);

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Material swatch placeholder */}
      <div className={`h-32 bg-gradient-to-br ${swatchColor}`} />

      {/* Content section */}
      <div className="p-6 space-y-3">
        {/* Panel name */}
        <h2 className="text-xl font-bold text-zinc-900">{panelName}</h2>

        {/* Dimensions */}
        <p className="text-zinc-600">
          {dimensions.width} × {dimensions.height} × {dimensions.depth} mm
        </p>

        {/* Material name */}
        <p className="text-lg text-zinc-800">{material}</p>

        {/* Finish name */}
        <p className="text-zinc-500">{finish}</p>
      </div>
    </div>
  );
}

/**
 * Not found state for invalid QR codes
 */
interface NotFoundProps {
  qrCode: string;
}

export function PanelNotFound({ qrCode }: NotFoundProps) {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-6">
      <div className="text-center space-y-4">
        {/* Warning icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-zinc-900">Panel Not Found</h2>

        {/* Message */}
        <div className="space-y-2 text-sm text-zinc-600">
          <p>
            This QR code <span className="font-mono text-zinc-800">({qrCode})</span>{" "}
            doesn't match any panel in our system.
          </p>
          <p>
            If you just received your order, it may take a few hours for panels
            to be registered.
          </p>
        </div>
      </div>
    </div>
  );
}
