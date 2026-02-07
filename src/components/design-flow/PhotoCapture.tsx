"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, ArrowLeft } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import type { RoomShape, Wall } from "@/stores/useDesignFlowStore";
import { useAnalyzePhoto } from "@/lib/hooks/useAnalyzePhoto";
import { useDesignSession } from "@/lib/hooks/useDesignSession";

// ============================================================================
// DEFAULT WALLS PER ROOM SHAPE
// ============================================================================

const DEFAULT_WALLS: Record<RoomShape, Wall[]> = {
  straight: [{ id: "a", label: "Wall A", length: 3.0 }],
  "l-shape": [
    { id: "a", label: "Wall A", length: 3.0 },
    { id: "b", label: "Wall B", length: 2.4 },
  ],
  "u-shape": [
    { id: "a", label: "Wall A", length: 3.0 },
    { id: "b", label: "Wall B", length: 2.4 },
    { id: "c", label: "Wall C", length: 3.0 },
  ],
  galley: [
    { id: "a", label: "Wall A", length: 3.0 },
    { id: "b", label: "Wall B (opposite)", length: 3.0 },
  ],
};

// ============================================================================
// SHAPE CARD DATA
// ============================================================================

interface ShapeOption {
  shape: RoomShape;
  label: string;
}

const SHAPE_OPTIONS: ShapeOption[] = [
  { shape: "straight", label: "Straight" },
  { shape: "l-shape", label: "L-Shape" },
  { shape: "u-shape", label: "U-Shape" },
  { shape: "galley", label: "Galley" },
];

// ============================================================================
// SHAPE SVG ICONS
// ============================================================================

function ShapeIcon({ shape }: { shape: RoomShape }) {
  const strokeColor = "#232323";
  const strokeWidth = 2.5;

  switch (shape) {
    case "straight":
      return (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <line
            x1="8"
            y1="24"
            x2="40"
            y2="24"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Counter indicators */}
          <rect
            x="8"
            y="26"
            width="32"
            height="6"
            rx="1.5"
            fill="#77BC40"
            opacity={0.25}
          />
        </svg>
      );
    case "l-shape":
      return (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <polyline
            points="8,12 8,36 36,36"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Counter fill */}
          <path d="M10,14 L10,34 L34,34 L34,30 L14,30 L14,14 Z" fill="#77BC40" opacity={0.2} />
        </svg>
      );
    case "u-shape":
      return (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <polyline
            points="8,12 8,36 40,36 40,12"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Counter fill */}
          <path
            d="M10,14 L10,34 L38,34 L38,14 L34,14 L34,30 L14,30 L14,14 Z"
            fill="#77BC40"
            opacity={0.2}
          />
        </svg>
      );
    case "galley":
      return (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <line
            x1="8"
            y1="16"
            x2="40"
            y2="16"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="32"
            x2="40"
            y2="32"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Counter fills */}
          <rect x="8" y="18" width="32" height="4" rx="1" fill="#77BC40" opacity={0.2} />
          <rect x="8" y="26" width="32" height="4" rx="1" fill="#77BC40" opacity={0.2} />
        </svg>
      );
  }
}

// ============================================================================
// PHOTO CAPTURE (Screen 3)
// ============================================================================

export function PhotoCapture() {
  const back = useDesignFlowStore((s) => s.back);
  const next = useDesignFlowStore((s) => s.next);
  const setPhotoUrl = useDesignFlowStore((s) => s.setPhotoUrl);
  const setRoomShape = useDesignFlowStore((s) => s.setRoomShape);
  const setWalls = useDesignFlowStore((s) => s.setWalls);

  const [showManualEntry, setShowManualEntry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<File | null>(null);
  const { analyze, isMountedRef } = useAnalyzePhoto();
  const { uploadFile, savePhoto, saveAnalysis } = useDesignSession();

  // Unmount safety for analysis hook
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, [isMountedRef]);

  // Handle photo file selection (camera or upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      photoFileRef.current = file;
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);

      // Fire-and-forget: analyze photo in background while user proceeds
      analyze(url).then(() => {
        // After analysis completes, save to Convex
        const analysis = useDesignFlowStore.getState().spaceAnalysis;
        if (analysis) saveAnalysis(analysis);
      });

      // Upload photo to Convex storage (fire-and-forget)
      uploadFile(file).then((storageId) => {
        if (storageId) savePhoto(storageId);
      });

      next();
    }
  };

  // Handle shape selection in manual entry
  const handleShapeSelect = (shape: RoomShape) => {
    setRoomShape(shape);
    setWalls(DEFAULT_WALLS[shape]);
    next();
  };

  // ── Manual Entry UI ──
  if (showManualEntry) {
    return (
      <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
        {/* Back button */}
        <button
          onClick={() => setShowManualEntry(false)}
          className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="mt-6 max-w-sm mx-auto">
          <h2
            className="text-xl font-normal text-[#232323] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What shape is your space?
          </h2>
          <p className="text-sm text-[#616161] mt-2">
            Select the layout that best matches your room.
          </p>

          {/* Shape selection grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {SHAPE_OPTIONS.map(({ shape, label }) => (
              <button
                key={shape}
                onClick={() => handleShapeSelect(shape)}
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-[#E5E5E5] bg-white hover:border-[#77BC40] hover:bg-[#77BC40]/5 active:scale-[0.97] transition-all min-h-[110px]"
              >
                <ShapeIcon shape={shape} />
                <span className="text-sm font-medium text-[#232323]">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Photo Capture UI ──
  return (
    <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
      {/* Back button */}
      <button
        onClick={back}
        className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-6 max-w-sm mx-auto flex flex-col items-center">
        {/* Heading */}
        <h2
          className="text-xl font-normal text-[#232323] text-center tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Let&apos;s see your space
        </h2>
        <p className="text-sm text-[#616161] text-center mt-2 max-w-[280px]">
          A photo helps us understand your room shape and estimate dimensions.
        </p>

        {/* Example placeholder */}
        <div className="mt-8 w-full aspect-[4/3] bg-[#F5F5F5] rounded-xl flex flex-col items-center justify-center gap-3 border border-dashed border-[#D5D5D5]">
          <div className="w-12 h-12 rounded-full bg-[#E5E5E5] flex items-center justify-center">
            <Camera className="size-5 text-[#999]" />
          </div>
          <p className="text-xs text-[#999] text-center px-4 max-w-[220px]">
            Example: a photo of your kitchen area
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 w-full space-y-2">
          <p className="text-sm text-[#616161]">
            Stand back so we can see the full area.
          </p>
          <p className="text-sm text-[#616161]">
            Don&apos;t worry about mess &mdash; we just need the walls and space.
          </p>
        </div>

        {/* Camera permission note */}
        <p className="text-xs text-[#616161]/60 mt-4 text-center">
          We&apos;ll ask for camera access. Your photo stays on your device until
          you choose to share it.
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Take a photo"
        />

        {/* Primary CTA: Open Camera */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 w-full h-[52px] flex items-center justify-center gap-2 bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
        >
          <Camera className="size-4" />
          Open Camera
        </button>

        {/* Secondary: upload */}
        <button
          onClick={() => {
            // Remove capture attribute for gallery upload
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute("capture");
              fileInputRef.current.click();
              // Restore capture for next camera use
              setTimeout(() => {
                fileInputRef.current?.setAttribute("capture", "environment");
              }, 500);
            }
          }}
          className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
        >
          <Upload className="size-3.5" />
          or upload a photo
        </button>

        {/* Tertiary: Skip */}
        <button
          onClick={() => setShowManualEntry(true)}
          className="mt-2 text-xs text-[#616161]/70 hover:text-[#616161] transition-colors min-h-[44px] text-center leading-tight"
        >
          Skip for now &mdash; I&apos;ll enter my measurements instead
        </button>
      </div>
    </div>
  );
}
