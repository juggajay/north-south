"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import type { DesignResult } from "@/stores/useDesignFlowStore";

// ============================================================================
// MOCK DESIGN RESULT
// ============================================================================

const MOCK_DESIGN_RESULT: DesignResult = {
  renders: ["/images/nsc-logo.png"],
  description:
    "Light oak doors with brass handles. I've put drawers near the cooktop, and used the corner for a carousel so nothing's wasted.",
  priceRange: [10000, 13000],
  cabinets: [
    { position: 1, type: "drawers", label: "Drawers", width: 600 },
    { position: 2, type: "sink", label: "Sink cabinet", width: 900 },
    { position: 3, type: "corner-carousel", label: "Corner carousel", width: 900 },
    { position: 4, type: "oven", label: "Oven cabinet", width: 600 },
    { position: 5, type: "pantry", label: "Pull-out pantry", width: 450 },
  ],
  doorStyle: "Light oak, classic framed",
  handleStyle: "Brass bar",
  wallCabinets: 3,
};

// ============================================================================
// PROGRESS STEPS
// ============================================================================

const PROGRESS_STEPS = [
  { label: "Understanding your space", threshold: 25 },
  { label: "Matching your style", threshold: 50 },
  { label: "Designing your layout", threshold: 75 },
  { label: "Creating your kitchen picture", threshold: 100 },
] as const;

// ============================================================================
// DESIGN PROCESSING (Screen 6)
// ============================================================================

export function DesignProcessing() {
  const photoUrl = useDesignFlowStore((s) => s.photoUrl);
  const processingProgress = useDesignFlowStore((s) => s.processingProgress);
  const setProcessingProgress = useDesignFlowStore((s) => s.setProcessingProgress);
  const setDesignResult = useDesignFlowStore((s) => s.setDesignResult);
  const next = useDesignFlowStore((s) => s.next);
  const prefersReducedMotion = useReducedMotion();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Simulate progress: 0->25 in 2s, 25->50 in 2s, 50->75 in 2s, 75->100 in 2s
  useEffect(() => {
    // Reset on mount
    setProcessingProgress(0, PROGRESS_STEPS[0].label);

    const TOTAL_DURATION = 8000; // 8 seconds total
    const TICK_MS = 80;
    const totalTicks = TOTAL_DURATION / TICK_MS;
    let tick = 0;

    intervalRef.current = setInterval(() => {
      tick++;
      const progress = Math.min(100, Math.round((tick / totalTicks) * 100));

      // Determine current step label
      const currentStep =
        PROGRESS_STEPS.find((s) => progress <= s.threshold) ?? PROGRESS_STEPS[3];
      setProcessingProgress(progress, currentStep.label);

      if (progress >= 100) {
        cleanup();
      }
    }, TICK_MS);

    return cleanup;
  }, [setProcessingProgress, cleanup]);

  // When progress hits 100, wait 500ms then set result and advance
  useEffect(() => {
    if (processingProgress >= 100 && !completedRef.current) {
      completedRef.current = true;
      const timeout = setTimeout(() => {
        setDesignResult(MOCK_DESIGN_RESULT);
        next();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [processingProgress, setDesignResult, next]);

  // Determine current step index for highlighting
  const currentStepIndex = PROGRESS_STEPS.findIndex(
    (s) => processingProgress <= s.threshold
  );
  const activeIndex = currentStepIndex === -1 ? PROGRESS_STEPS.length - 1 : currentStepIndex;

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      {/* Blurred photo background or gradient fallback */}
      {photoUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 brightness-50"
          style={{ backgroundImage: `url(${photoUrl})` }}
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#232323] via-[#3a3a3a] to-[#232323]"
          aria-hidden="true"
        />
      )}

      {/* Semi-transparent overlay for readability */}
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
            aria-valuenow={processingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Design generation progress"
          >
            <div
              className={[
                "h-full rounded-full bg-[#77BC40] transition-all duration-300 ease-out",
                !prefersReducedMotion && processingProgress < 100
                  ? "animate-pulse"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p className="text-xs text-white/60 mt-2">{processingProgress}%</p>
        </div>

        {/* Progress steps list */}
        <ul className="w-full space-y-3 text-left" aria-live="polite">
          {PROGRESS_STEPS.map((step, i) => {
            const isDone = processingProgress > step.threshold ||
              (processingProgress === 100 && i === PROGRESS_STEPS.length - 1);
            const isCurrent = i === activeIndex && !isDone;
            const isFuture = i > activeIndex;

            return (
              <li key={step.label} className="flex items-center gap-3">
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
                  {isDone && (
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  )}
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
      </div>
    </div>
  );
}
