"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Minus, Plus, Check, Loader2 } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import type { Wall, RoomShape } from "@/stores/useDesignFlowStore";
import { estimateDimensions } from "@/lib/ai/depth-estimation";
import type { SpaceAnalysis } from "@/types/ai-pipeline";
import { useDesignSession } from "@/lib/hooks/useDesignSession";

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_LENGTH = 1.0;
const MAX_LENGTH = 6.0;
const STEP = 0.1;

// Default walls per shape (used when no photo analysis available)
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

/**
 * Derive wall dimensions from AI space analysis.
 * Converts mm estimates to metres, constrained by depth-estimation module.
 */
function deriveWallsFromAnalysis(
  analysis: SpaceAnalysis,
  roomShape: RoomShape | null
): Wall[] {
  const dims = estimateDimensions(analysis, "basic");
  const widthM = +(dims.width / 1000).toFixed(1);
  const depthM = +(dims.depth / 1000).toFixed(1);

  const shape = roomShape || "l-shape";

  switch (shape) {
    case "straight":
      return [{ id: "a", label: "Wall A", length: widthM }];
    case "l-shape":
      return [
        { id: "a", label: "Wall A", length: widthM },
        { id: "b", label: "Wall B", length: depthM },
      ];
    case "u-shape":
      return [
        { id: "a", label: "Wall A", length: widthM },
        { id: "b", label: "Wall B", length: depthM },
        { id: "c", label: "Wall C", length: widthM },
      ];
    case "galley":
      return [
        { id: "a", label: "Wall A", length: widthM },
        { id: "b", label: "Wall B (opposite)", length: widthM },
      ];
  }
}

// ============================================================================
// ROOM SHAPE SCHEMATIC SVGs
// ============================================================================

function RoomSchematic({
  shape,
  walls,
}: {
  shape: RoomShape | null;
  walls: Wall[];
}) {
  const resolvedShape = shape || "l-shape";
  const strokeColor = "#232323";
  const strokeWidth = 2;
  const dimColor = "#77BC40";
  const fillColor = "#F9FBF7";

  // Get wall lengths for labeling
  const getWallLength = (index: number) =>
    walls[index]?.length?.toFixed(1) ?? "?";

  switch (resolvedShape) {
    case "straight":
      return (
        <svg viewBox="0 0 260 120" className="w-full max-w-[280px] h-auto">
          {/* Floor area */}
          <rect x="30" y="40" width="200" height="50" fill={fillColor} rx="2" />
          {/* Wall line */}
          <line
            x1="30"
            y1="40"
            x2="230"
            y2="40"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Dimension line */}
          <line
            x1="30"
            y1="28"
            x2="230"
            y2="28"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="130"
            y="22"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
          >
            Wall A: {getWallLength(0)}m
          </text>
          {/* Counter indication */}
          <rect
            x="30"
            y="42"
            width="200"
            height="14"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
        </svg>
      );

    case "l-shape":
      return (
        <svg viewBox="0 0 260 200" className="w-full max-w-[280px] h-auto">
          {/* Floor area */}
          <path
            d="M30,30 L30,170 L200,170 L200,110 L90,110 L90,30 Z"
            fill={fillColor}
          />
          {/* Wall lines */}
          <polyline
            points="30,30 30,170 200,170"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Counter indication along walls */}
          <rect
            x="32"
            y="30"
            width="14"
            height="140"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
          <rect
            x="30"
            y="156"
            width="170"
            height="14"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
          {/* Wall A dimension (vertical) */}
          <line
            x1="16"
            y1="30"
            x2="16"
            y2="170"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="12"
            y="105"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
            transform="rotate(-90 12 105)"
          >
            A: {getWallLength(0)}m
          </text>
          {/* Wall B dimension (horizontal) */}
          <line
            x1="30"
            y1="184"
            x2="200"
            y2="184"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="115"
            y="198"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
          >
            B: {getWallLength(1)}m
          </text>
        </svg>
      );

    case "u-shape":
      return (
        <svg viewBox="0 0 260 200" className="w-full max-w-[280px] h-auto">
          {/* Floor area */}
          <path
            d="M30,30 L30,170 L230,170 L230,30 L170,30 L170,110 L90,110 L90,30 Z"
            fill={fillColor}
          />
          {/* Wall lines */}
          <polyline
            points="30,30 30,170 230,170 230,30"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Counter indications */}
          <rect
            x="32"
            y="30"
            width="14"
            height="140"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
          <rect
            x="30"
            y="156"
            width="200"
            height="14"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
          <rect
            x="214"
            y="30"
            width="14"
            height="140"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
          {/* Wall A dimension (left vertical) */}
          <line
            x1="16"
            y1="30"
            x2="16"
            y2="170"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="12"
            y="105"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
            transform="rotate(-90 12 105)"
          >
            A: {getWallLength(0)}m
          </text>
          {/* Wall B dimension (bottom horizontal) */}
          <line
            x1="30"
            y1="184"
            x2="230"
            y2="184"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="130"
            y="198"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
          >
            B: {getWallLength(1)}m
          </text>
          {/* Wall C dimension (right vertical) */}
          <line
            x1="244"
            y1="30"
            x2="244"
            y2="170"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="248"
            y="105"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
            transform="rotate(90 248 105)"
          >
            C: {getWallLength(2)}m
          </text>
        </svg>
      );

    case "galley":
      return (
        <svg viewBox="0 0 260 160" className="w-full max-w-[280px] h-auto">
          {/* Floor area */}
          <rect x="30" y="40" width="200" height="80" fill={fillColor} rx="2" />
          {/* Top wall */}
          <line
            x1="30"
            y1="40"
            x2="230"
            y2="40"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Bottom wall */}
          <line
            x1="30"
            y1="120"
            x2="230"
            y2="120"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Counter indications */}
          <rect
            x="30"
            y="42"
            width="200"
            height="12"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
          <rect
            x="30"
            y="106"
            width="200"
            height="12"
            rx="2"
            fill={dimColor}
            opacity={0.15}
          />
          {/* Wall A dimension (top) */}
          <line
            x1="30"
            y1="28"
            x2="230"
            y2="28"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="130"
            y="22"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
          >
            A: {getWallLength(0)}m
          </text>
          {/* Wall B dimension (bottom) */}
          <line
            x1="30"
            y1="134"
            x2="230"
            y2="134"
            stroke={dimColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x="130"
            y="148"
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={dimColor}
          >
            B: {getWallLength(1)}m
          </text>
        </svg>
      );
  }
}

// ============================================================================
// DIMENSION STEPPER
// ============================================================================

function DimensionStepper({
  wall,
  onUpdate,
}: {
  wall: Wall;
  onUpdate: (id: string, length: number) => void;
}) {
  const decrement = useCallback(() => {
    const newVal = Math.max(MIN_LENGTH, +(wall.length - STEP).toFixed(1));
    onUpdate(wall.id, newVal);
  }, [wall.id, wall.length, onUpdate]);

  const increment = useCallback(() => {
    const newVal = Math.min(MAX_LENGTH, +(wall.length + STEP).toFixed(1));
    onUpdate(wall.id, newVal);
  }, [wall.id, wall.length, onUpdate]);

  return (
    <div className="flex items-center justify-between bg-[#F9F9F9] rounded-xl px-4 py-3">
      <span className="text-sm font-medium text-[#232323]">{wall.label}</span>
      <div className="flex items-center gap-3">
        {/* Decrement */}
        <button
          onClick={decrement}
          disabled={wall.length <= MIN_LENGTH}
          aria-label={`Decrease ${wall.label} length`}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#232323] hover:bg-[#F5F5F5] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="size-4" />
        </button>

        {/* Display */}
        <span className="w-[56px] text-center text-base font-semibold text-[#232323] tabular-nums">
          {wall.length.toFixed(1)}m
        </span>

        {/* Increment */}
        <button
          onClick={increment}
          disabled={wall.length >= MAX_LENGTH}
          aria-label={`Increase ${wall.label} length`}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#232323] hover:bg-[#F5F5F5] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SHAPE DESCRIPTION HELPER
// ============================================================================

function describeShape(shape: RoomShape | null, walls: Wall[]): string {
  const wallCount = walls.length;
  const shapeName = shape
    ? shape.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "L-Shape";

  if (wallCount === 1) {
    return `I can see one wall forming a straight layout \u2014 about ${walls[0].length.toFixed(1)}m long.`;
  }
  if (wallCount === 2) {
    return `I can see two walls forming an ${shapeName} \u2014 about ${walls[0].length.toFixed(1)}m and ${walls[1].length.toFixed(1)}m.`;
  }
  if (wallCount === 3) {
    return `I can see three walls forming a ${shapeName} \u2014 about ${walls[0].length.toFixed(1)}m, ${walls[1].length.toFixed(1)}m, and ${walls[2].length.toFixed(1)}m.`;
  }
  return `I can see ${wallCount} walls forming a ${shapeName} layout.`;
}

// ============================================================================
// WALL DETECTION (Screen 4)
// ============================================================================

type SubScreen = "confirmation" | "dimensions";

export function WallDetection() {
  const back = useDesignFlowStore((s) => s.back);
  const setStep = useDesignFlowStore((s) => s.setStep);
  const roomShape = useDesignFlowStore((s) => s.roomShape);
  const walls = useDesignFlowStore((s) => s.walls);
  const setWalls = useDesignFlowStore((s) => s.setWalls);
  const updateWallLength = useDesignFlowStore((s) => s.updateWallLength);
  const spaceAnalysis = useDesignFlowStore((s) => s.spaceAnalysis);
  const isAnalyzing = useDesignFlowStore((s) => s.isAnalyzing);
  const setRoomShape = useDesignFlowStore((s) => s.setRoomShape);
  const { saveWallData } = useDesignSession();

  const [subScreen, setSubScreen] = useState<SubScreen>("confirmation");
  const [wallsInitialized, setWallsInitialized] = useState(false);

  const effectiveShape = roomShape || "l-shape";

  // Derive walls from AI analysis or use defaults
  useEffect(() => {
    if (wallsInitialized) return;
    if (walls.length > 0) {
      setWallsInitialized(true);
      return;
    }
    // Wait for analysis to finish if it's running
    if (isAnalyzing) return;

    if (spaceAnalysis) {
      // Use AI-estimated dimensions
      const aiWalls = deriveWallsFromAnalysis(spaceAnalysis, roomShape);
      setWalls(aiWalls);
      // Auto-detect room shape if not set
      if (!roomShape) {
        setRoomShape("l-shape");
      }
    } else {
      // No analysis available — use defaults
      const defaults = DEFAULT_WALLS[effectiveShape];
      setWalls(defaults);
    }
    setWallsInitialized(true);
  }, [
    wallsInitialized, walls.length, isAnalyzing, spaceAnalysis,
    roomShape, effectiveShape, setWalls, setRoomShape,
  ]);

  const effectiveWalls =
    walls.length > 0
      ? walls
      : DEFAULT_WALLS[effectiveShape];

  // Show loading state while analysis is running and walls haven't been set yet
  if (isAnalyzing && walls.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8 flex flex-col items-center justify-center">
        <Loader2 className="size-8 text-[#77BC40] animate-spin mb-4" />
        <p
          className="text-lg text-[#232323] text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Analysing your photo...
        </p>
        <p className="text-sm text-[#616161] text-center mt-2">
          Estimating room dimensions from your image
        </p>
      </div>
    );
  }

  // ── Screen 4a: Wall Confirmation ──
  if (subScreen === "confirmation") {
    return (
      <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
        {/* Back */}
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="mt-6 max-w-sm mx-auto">
          {/* AI companion message */}
          <div className="bg-[#F9FBF7] border border-[#77BC40]/20 rounded-xl p-4">
            <p className="text-sm text-[#232323] leading-relaxed">
              {spaceAnalysis
                ? `From your photo, I can see ${describeShape(effectiveShape, effectiveWalls).toLowerCase()}`
                : describeShape(effectiveShape, effectiveWalls)
              }
            </p>
          </div>

          {/* Detected walls list */}
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-semibold text-[#616161] uppercase tracking-wider">
              {spaceAnalysis ? "Estimated Walls" : "Detected Walls"}
            </h3>
            {effectiveWalls.map((wall) => (
              <div
                key={wall.id}
                className="flex items-center justify-between py-3 px-4 bg-[#F9F9F9] rounded-xl"
              >
                <span className="text-sm font-medium text-[#232323]">
                  {wall.label}
                </span>
                <span className="text-sm text-[#616161] tabular-nums">
                  ~{wall.length.toFixed(1)}m
                </span>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => setSubScreen("dimensions")}
            className="mt-8 w-full h-[52px] flex items-center justify-center gap-2 bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
          >
            <Check className="size-4" />
            Yes, that looks right
          </button>

          {/* Secondary link */}
          <button
            onClick={() => setSubScreen("dimensions")}
            className="mt-3 w-full text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px] text-center"
          >
            Not quite right? Let me adjust
          </button>
        </div>
      </div>
    );
  }

  // ── Screen 4b: Dimension Confirmation ──
  return (
    <div className="min-h-[100dvh] bg-white px-6 pt-4 pb-8">
      {/* Back to confirmation */}
      <button
        onClick={() => setSubScreen("confirmation")}
        className="flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px]"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-4 max-w-sm mx-auto">
        <h2
          className="text-xl font-normal text-[#232323] text-center tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Confirm your dimensions
        </h2>
        <p className="text-sm text-[#616161] text-center mt-2">
          Use the +/- buttons to fine-tune each wall.
        </p>

        {/* 2D Schematic */}
        <div className="mt-6 flex justify-center">
          <RoomSchematic shape={effectiveShape} walls={effectiveWalls} />
        </div>

        {/* Dimension steppers */}
        <div className="mt-6 space-y-3">
          {effectiveWalls.map((wall) => (
            <DimensionStepper
              key={wall.id}
              wall={wall}
              onUpdate={updateWallLength}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            // Save walls to Convex (fire-and-forget)
            saveWallData(effectiveWalls, effectiveShape);
            setStep("discovery-purpose");
          }}
          className="mt-8 w-full h-[52px] flex items-center justify-center gap-2 bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
        >
          Looks Good
        </button>
      </div>
    </div>
  );
}
