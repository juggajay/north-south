"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import { useGenerateRenders } from "@/lib/hooks/useGenerateRenders";
import { matchStylePreset } from "@/lib/constants/style-presets";

// ============================================================================
// PROGRESS STEPS
// ============================================================================

const PROGRESS_STEPS = [
  { key: "styling", label: "Matching your style", targetPercent: 30, durationMs: 2000 },
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
// DESIGN PROCESSING (Screen 6)
// ============================================================================

export function DesignProcessing() {
  const photoUrl = useDesignFlowStore((s) => s.photoUrl);
  const walls = useDesignFlowStore((s) => s.walls);
  const purpose = useDesignFlowStore((s) => s.purpose);
  const priorities = useDesignFlowStore((s) => s.priorities);
  const specificRequests = useDesignFlowStore((s) => s.specificRequests);
  const freeText = useDesignFlowStore((s) => s.freeText);
  const styleSummary = useDesignFlowStore((s) => s.styleSummary);
  const stylePreset = useDesignFlowStore((s) => s.stylePreset);
  const spaceAnalysis = useDesignFlowStore((s) => s.spaceAnalysis);
  const existingResult = useDesignFlowStore((s) => s.designResult);
  const setProcessingProgress = useDesignFlowStore((s) => s.setProcessingProgress);
  const setDesignResult = useDesignFlowStore((s) => s.setDesignResult);
  const next = useDesignFlowStore((s) => s.next);
  const back = useDesignFlowStore((s) => s.back);
  const prefersReducedMotion = useReducedMotion();

  const {
    generate,
    reset: resetPipeline,
    isGenerating,
    error: pipelineError,
    designResult: pipelineDesignResult,
    stage: pipelineStage,
  } = useGenerateRenders();

  // Prevent double-invoke in React Strict Mode
  const invokedRef = useRef(false);
  const completedRef = useRef(false);

  // Synthetic progress interpolation
  const [displayProgress, setDisplayProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const progressStartRef = useRef<{ startPercent: number; targetPercent: number; startTime: number; durationMs: number } | null>(null);

  // Determine current pipeline stage index
  const currentStageKey = pipelineStage === 'done' ? 'creating' : pipelineStage;
  const stageIndex = PROGRESS_STEPS.findIndex((s) => s.key === currentStageKey);

  const isSuccess = pipelineStage === 'done' && pipelineDesignResult !== null;
  const isError = pipelineError !== null;

  // ── Phase 5: Skip processing if result already exists ──
  useEffect(() => {
    if (existingResult && !invokedRef.current) {
      // No upstream changes — skip straight to presentation
      next();
    }
  }, [existingResult, next]);

  // ── Start pipeline on mount ──
  useEffect(() => {
    if (existingResult) return; // Skip if result exists
    if (!photoUrl || invokedRef.current) return;
    if (!spaceAnalysis) return; // Need analysis for the prompt
    invokedRef.current = true;

    // Resolve style preset — use store value or fallback
    const resolvedPreset = stylePreset ?? matchStylePreset([], 'unknown');

    generate({
      photoUrl,
      stylePreset: resolvedPreset,
      spaceAnalysis,
      walls,
      purpose: purpose || 'kitchen',
      styleSummary: styleSummary || 'modern, clean',
      priorities,
      specificRequests,
      freeText,
    }).catch(() => {
      // Error handled by hook state
    });
  }, [
    photoUrl, spaceAnalysis, stylePreset, walls, purpose,
    styleSummary, priorities, specificRequests, freeText,
    existingResult, generate,
  ]);

  // ── Synthetic progress interpolation ──
  useEffect(() => {
    if (isSuccess) {
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
      const eased = 1 - Math.pow(1 - t, 3);
      const current = p.startPercent + (p.targetPercent - p.startPercent) * eased;

      const rounded = Math.round(current);
      setDisplayProgress(rounded);

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

  // ── On success, save DesignResult and advance ──
  useEffect(() => {
    if (!isSuccess || !pipelineDesignResult || completedRef.current) return;
    completedRef.current = true;

    const timeout = setTimeout(() => {
      setDesignResult(pipelineDesignResult);
      next();
    }, 600);
    return () => clearTimeout(timeout);
  }, [isSuccess, pipelineDesignResult, setDesignResult, next]);

  // ── Retry handler ──
  const handleRetry = useCallback(() => {
    if (!photoUrl || !spaceAnalysis) return;
    invokedRef.current = false;
    completedRef.current = false;
    setDisplayProgress(0);
    resetPipeline();

    const resolvedPreset = stylePreset ?? matchStylePreset([], 'unknown');

    setTimeout(() => {
      invokedRef.current = true;
      generate({
        photoUrl,
        stylePreset: resolvedPreset,
        spaceAnalysis,
        walls,
        purpose: purpose || 'kitchen',
        styleSummary: styleSummary || 'modern, clean',
        priorities,
        specificRequests,
        freeText,
      }).catch(() => {});
    }, 50);
  }, [
    photoUrl, spaceAnalysis, stylePreset, walls, purpose,
    styleSummary, priorities, specificRequests, freeText,
    resetPipeline, generate,
  ]);

  // ── Go back ──
  const handleBackToPhoto = useCallback(() => {
    back();
    back();
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
