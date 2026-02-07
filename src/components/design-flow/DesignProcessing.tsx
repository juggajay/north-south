"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import type { DesignResult, CabinetSummary } from "@/stores/useDesignFlowStore";
import { useProcessPhoto } from "@/lib/hooks/useProcessPhoto";
import { generateLayout, type LayoutIntent, type WallSegment } from "@/lib/engine/layout-engine";
import { calculatePricing } from "@/lib/engine/pricing-engine";
import type { PipelineResult } from "@/types/ai-pipeline";
import type { Priority } from "@/lib/engine/layout-engine";

// ============================================================================
// PROGRESS STEPS
// ============================================================================

const PROGRESS_STEPS = [
  { key: "analyzing", label: "Understanding your space", targetPercent: 24, durationMs: 8000 },
  { key: "measuring", label: "Checking dimensions", targetPercent: 49, durationMs: 2000 },
  { key: "styling", label: "Matching your style", targetPercent: 74, durationMs: 2000 },
  { key: "creating", label: "Creating your kitchen picture", targetPercent: 95, durationMs: 30000 },
] as const;

// ============================================================================
// ROTATING TIPS (shown during the long "creating" stage)
// ============================================================================

const CREATING_TIPS = [
  "Your cabinets will be custom-made in Australia",
  "Every design can be adjusted later",
  "North South uses premium Polytec finishes",
  "This picture is just a starting point \u2014 we\u2019ll refine it together",
  "Real materials, real craftsmanship, real results",
];

// ============================================================================
// HELPER: infer handle style from aesthetic
// ============================================================================

function inferHandleStyle(aesthetic: string): string {
  const map: Record<string, string> = {
    modern: "Brushed nickel bar",
    traditional: "Brass cup pull",
    industrial: "Matte black bar",
    coastal: "Brushed brass knob",
    scandinavian: "Birch wood peg",
  };
  return map[aesthetic] || "Brushed nickel bar";
}

// ============================================================================
// HELPER: build DesignResult from pipeline + store data
// ============================================================================

function buildDesignResult(
  pipelineResult: PipelineResult,
  storeData: {
    walls: { id: string; label: string; length: number }[];
    purpose: string | null;
    priorities: string[];
    specificRequests: string[];
  }
): DesignResult {
  // 1. Build wall segments — fallback to a single 3m wall if none provided
  const wallSegments: WallSegment[] =
    storeData.walls.length > 0
      ? storeData.walls.map((w) => ({
          label: w.label,
          lengthMm: w.length * 1000,
          selected: true,
        }))
      : [{ label: "Main wall", lengthMm: 3000, selected: true }];

  const firstStyle = pipelineResult.styles[0];

  // Map store priorities to layout engine Priority type
  const validPriorities: Priority[] = (storeData.priorities || []).filter(
    (p): p is Priority =>
      ["storage", "clean-look", "easy-clean", "value", "wow-factor"].includes(p)
  );

  const intent: LayoutIntent = {
    walls: wallSegments,
    purpose: (storeData.purpose || "kitchen") as "kitchen" | "laundry" | "pantry" | "other",
    budgetTier: "mid",
    priorities: validPriorities,
    specificRequests: storeData.specificRequests || [],
    finishes: {
      material: firstStyle?.polytec[0] || "Natural Oak",
      hardware: "bar-pull-brushed-nickel",
      doorProfile: "slab",
    },
  };

  // 2. Generate layout
  const layoutResult = generateLayout(intent);

  // 3. Calculate pricing
  const pricingResult = calculatePricing({
    config: layoutResult.config,
    budgetTier: "mid",
  });

  // 4. Build cabinets list from base modules
  const cabinets: CabinetSummary[] = layoutResult.wallAssignments.flatMap((wa) =>
    wa.modules
      .filter((m) => m.position === "base")
      .map((m, i) => ({
        position: i + 1,
        type: m.type,
        label: m.label,
        width: m.widthMm,
      }))
  );

  // 5. Count overhead modules
  const wallCabinets = layoutResult.wallAssignments.reduce(
    (sum, wa) => sum + wa.modules.filter((m) => m.position === "overhead").length,
    0
  );

  return {
    renders: pipelineResult.renders.map((r) => r.imageUrl),
    description: layoutResult.description,
    priceRange: [
      Math.round(pricingResult.total.lowCents / 100),
      Math.round(pricingResult.total.highCents / 100),
    ],
    cabinets,
    doorStyle: firstStyle?.name || "Classic Oak",
    handleStyle: inferHandleStyle(pipelineResult.analysis.styleAesthetic),
    wallCabinets,
  };
}

// ============================================================================
// DESIGN PROCESSING (Screen 6)
// ============================================================================

export function DesignProcessing() {
  const photoUrl = useDesignFlowStore((s) => s.photoUrl);
  const walls = useDesignFlowStore((s) => s.walls);
  const purpose = useDesignFlowStore((s) => s.purpose);
  const priorities = useDesignFlowStore((s) => s.priorities);
  const specificRequests = useDesignFlowStore((s) => s.specificRequests);
  const setProcessingProgress = useDesignFlowStore((s) => s.setProcessingProgress);
  const setDesignResult = useDesignFlowStore((s) => s.setDesignResult);
  const next = useDesignFlowStore((s) => s.next);
  const back = useDesignFlowStore((s) => s.back);
  const prefersReducedMotion = useReducedMotion();

  const {
    progress: pipelineProgress,
    result: pipelineResult,
    error: pipelineError,
    processAsync,
    reset: resetPipeline,
    isProcessing,
    isSuccess,
    isError,
  } = useProcessPhoto();

  // Prevent double-invoke in React Strict Mode
  const invokedRef = useRef(false);
  const completedRef = useRef(false);

  // Synthetic progress interpolation
  const [displayProgress, setDisplayProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const progressStartRef = useRef<{ startPercent: number; targetPercent: number; startTime: number; durationMs: number } | null>(null);

  // Determine current pipeline stage index
  const currentStageKey = pipelineProgress?.stage || "analyzing";
  const stageIndex = PROGRESS_STEPS.findIndex((s) => s.key === currentStageKey);

  // ── Start pipeline on mount ──
  useEffect(() => {
    if (!photoUrl || invokedRef.current) return;
    invokedRef.current = true;

    processAsync(photoUrl).catch(() => {
      // Error handled by hook state
    });
  }, [photoUrl, processAsync]);

  // ── Synthetic progress interpolation ──
  // When the pipeline stage changes, start interpolating toward the new target
  useEffect(() => {
    if (isSuccess) {
      // Snap to 100%
      setDisplayProgress(100);
      setProcessingProgress(100, "Complete");
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    if (isError) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const stepDef = PROGRESS_STEPS[stageIndex >= 0 ? stageIndex : 0];
    if (!stepDef) return;

    // Snap to the start of this stage (previous stage's target + 1, or 0)
    const snapPercent = stageIndex > 0 ? PROGRESS_STEPS[stageIndex - 1].targetPercent + 1 : 0;

    progressStartRef.current = {
      startPercent: Math.max(displayProgress, snapPercent),
      targetPercent: stepDef.targetPercent,
      startTime: performance.now(),
      durationMs: stepDef.durationMs,
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageKey, isSuccess, isError]);

  // Animation loop
  useEffect(() => {
    if (isError) return;

    function tick() {
      const p = progressStartRef.current;
      if (!p) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = performance.now() - p.startTime;
      const t = Math.min(elapsed / p.durationMs, 1);
      // Ease-out cubic for decelerating feel
      const eased = 1 - Math.pow(1 - t, 3);
      const current = p.startPercent + (p.targetPercent - p.startPercent) * eased;

      const rounded = Math.round(current);
      setDisplayProgress(rounded);

      // Update store for accessibility
      const stepDef = PROGRESS_STEPS[stageIndex >= 0 ? stageIndex : 0];
      if (stepDef) {
        setProcessingProgress(rounded, stepDef.label);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isError, stageIndex, setProcessingProgress]);

  // ── Rotating tips during "creating" stage ──
  useEffect(() => {
    if (currentStageKey !== "creating") return;

    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % CREATING_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentStageKey]);

  // ── On success, build DesignResult and advance ──
  useEffect(() => {
    if (!isSuccess || !pipelineResult || completedRef.current) return;
    completedRef.current = true;

    const designResult = buildDesignResult(pipelineResult, {
      walls,
      purpose,
      priorities,
      specificRequests,
    });

    // Brief delay so the user sees 100% before transitioning
    const timeout = setTimeout(() => {
      setDesignResult(designResult);
      next();
    }, 600);
    return () => clearTimeout(timeout);
  }, [isSuccess, pipelineResult, walls, purpose, priorities, specificRequests, setDesignResult, next]);

  // ── Retry handler ──
  const handleRetry = useCallback(() => {
    if (!photoUrl) return;
    invokedRef.current = false;
    completedRef.current = false;
    setDisplayProgress(0);
    resetPipeline();
    // Re-trigger on next tick after reset
    setTimeout(() => {
      invokedRef.current = true;
      processAsync(photoUrl).catch(() => {});
    }, 50);
  }, [photoUrl, resetPipeline, processAsync]);

  // ── Go back to photo step ──
  const handleBackToPhoto = useCallback(() => {
    back(); // to discovery-priorities
    back(); // further back — store's back() handles step order
  }, [back]);

  // ── No photo guard ──
  if (!photoUrl) {
    return (
      <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#232323] via-[#3a3a3a] to-[#232323]"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
          <AlertCircle className="size-12 text-white/60 mb-4" />
          <p className="text-lg text-white/90 mb-6" style={{ fontFamily: "var(--font-display)" }}>
            We need a photo of your space first.
          </p>
          <button
            onClick={back}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Error UI ──
  if (isError) {
    return (
      <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        {/* Blurred photo background */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 brightness-50"
          style={{ backgroundImage: `url(${photoUrl})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
          <AlertCircle className="size-12 text-red-400 mb-4" />
          <p className="text-lg text-white/90 mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Something went wrong
          </p>
          <p className="text-sm text-white/60 mb-8">
            {pipelineError || "We couldn\u2019t generate your design. Let\u2019s try again."}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#77BC40] text-white font-medium text-sm hover:bg-[#6aab36] transition-colors"
            >
              <RotateCcw className="size-4" />
              Try again
            </button>
            <button
              onClick={handleBackToPhoto}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Use a different photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main progress UI ──
  const activeIndex = stageIndex >= 0 ? stageIndex : 0;

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      {/* Blurred photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 brightness-50"
        style={{ backgroundImage: `url(${photoUrl})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* AI companion message */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[1.125rem] leading-relaxed text-white/90 mb-10"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Creating a picture of your new kitchen&hellip; this usually takes about 30 seconds.
        </motion.p>

        {/* Progress bar */}
        <div className="w-full mb-8">
          <div
            className="w-full h-1.5 rounded-full bg-[#E5E5E5]/30 overflow-hidden"
            role="progressbar"
            aria-valuenow={displayProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Design generation progress"
          >
            <div
              className={[
                "h-full rounded-full bg-[#77BC40] transition-[width] duration-150 ease-out",
                !prefersReducedMotion && displayProgress < 100 ? "animate-pulse" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <p className="text-xs text-white/60 mt-2">{displayProgress}%</p>
        </div>

        {/* Progress steps list */}
        <ul className="w-full space-y-3 text-left" aria-live="polite">
          {PROGRESS_STEPS.map((step, i) => {
            const isDone =
              displayProgress > step.targetPercent ||
              (displayProgress === 100 && i === PROGRESS_STEPS.length - 1);
            const isCurrent = i === activeIndex && !isDone;
            const isFuture = i > activeIndex;

            return (
              <li key={step.key} className="flex items-center gap-3">
                {/* Step indicator */}
                <div
                  className={[
                    "flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors duration-300",
                    isDone
                      ? "bg-[#77BC40]"
                      : isCurrent
                        ? "border-2 border-[#77BC40] bg-transparent"
                        : "border border-white/20 bg-transparent",
                  ].join(" ")}
                >
                  {isDone && <Check className="size-3.5 text-white" strokeWidth={3} />}
                  {isCurrent && (
                    <div
                      className={[
                        "w-2 h-2 rounded-full bg-[#77BC40]",
                        !prefersReducedMotion ? "animate-pulse" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={[
                    "text-sm transition-colors duration-300",
                    isDone
                      ? "text-white"
                      : isCurrent
                        ? "text-white font-medium"
                        : isFuture
                          ? "text-white/40"
                          : "text-white/60",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Rotating tips during "creating" stage */}
        <AnimatePresence mode="wait">
          {currentStageKey === "creating" && (
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="mt-8 text-xs text-white/50 italic"
            >
              {CREATING_TIPS[tipIndex]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
