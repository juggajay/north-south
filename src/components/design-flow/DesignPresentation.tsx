"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Share2, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";

// ============================================================================
// CSS CONFETTI
// ============================================================================

const CONFETTI_COLORS = [
  "#77BC40", // brand green
  "#F59E0B", // amber
  "#3B82F6", // blue
  "#EF4444", // red
  "#A855F7", // purple
  "#EC4899", // pink
  "#10B981", // emerald
  "#F97316", // orange
];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = `${Math.random() * 100}%`;
  const delay = `${Math.random() * 1.5}s`;
  const duration = `${2 + Math.random() * 2}s`;
  const size = 6 + Math.random() * 6;
  const rotation = `${Math.random() * 360}deg`;

  return (
    <div
      className="absolute top-0 animate-[confetti-fall_var(--duration)_ease-in_var(--delay)_forwards] opacity-0"
      style={
        {
          left,
          "--delay": delay,
          "--duration": duration,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div
        className="rounded-sm"
        style={{
          width: size,
          height: size * 0.6,
          backgroundColor: color,
          transform: `rotate(${rotation})`,
        }}
      />
    </div>
  );
}

// ============================================================================
// DESIGN PRESENTATION (Screen 7)
// ============================================================================

export function DesignPresentation() {
  const userName = useDesignFlowStore((s) => s.userName);
  const designResult = useDesignFlowStore((s) => s.designResult);
  const next = useDesignFlowStore((s) => s.next);
  const prefersReducedMotion = useReducedMotion();

  const [renderIndex, setRenderIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  const renders = designResult?.renders ?? [];
  const hasMultiple = renders.length > 1;

  // Trigger confetti on mount (skip if prefers-reduced-motion)
  useEffect(() => {
    if (!prefersReducedMotion) {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [prefersReducedMotion]);

  const prevRender = () => {
    setRenderIndex((i) => (i > 0 ? i - 1 : renders.length - 1));
  };

  const nextRender = () => {
    setRenderIndex((i) => (i < renders.length - 1 ? i + 1 : 0));
  };

  const formatPrice = (n: number) =>
    n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-white">
      {/* Confetti layer */}
      {showConfetti && (
        <div
          ref={confettiRef}
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      {/* Confetti keyframes injected via style tag */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8">
        <div className="max-w-sm mx-auto w-full">
          {/* AI message */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[1.125rem] leading-relaxed text-[#232323] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Here&apos;s what I&apos;ve put together for your kitchen
            {userName ? `, ${userName}` : ""}.
          </motion.p>

          {/* Render image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-[#E5E5E5] to-[#D4D4D4] mb-4"
          >
            {renders.length > 0 ? (
              <img
                src={renders[renderIndex]}
                alt={`Kitchen design render ${renderIndex + 1} of ${renders.length}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-[#616161]">Design render</p>
              </div>
            )}

            {/* Prev / Next arrows for multiple renders */}
            {hasMultiple && (
              <>
                <button
                  onClick={prevRender}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors min-w-[44px] min-h-[44px]"
                  aria-label="Previous render"
                >
                  <ChevronLeft className="size-5 text-[#232323]" />
                </button>
                <button
                  onClick={nextRender}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors min-w-[44px] min-h-[44px]"
                  aria-label="Next render"
                >
                  <ChevronRight className="size-5 text-[#232323]" />
                </button>
              </>
            )}
          </motion.div>

          {/* Dots indicator */}
          {hasMultiple && (
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {renders.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRenderIndex(i)}
                  className={[
                    "w-2 h-2 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center",
                  ].join(" ")}
                  aria-label={`View render ${i + 1}`}
                >
                  <div
                    className={[
                      "w-2 h-2 rounded-full transition-colors",
                      i === renderIndex ? "bg-[#232323]" : "bg-[#E5E5E5]",
                    ].join(" ")}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          {designResult?.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-[15px] leading-relaxed text-[#616161] mb-6"
            >
              {designResult.description}
            </motion.p>
          )}

          {/* Price range */}
          {designResult?.priceRange && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mb-8"
            >
              <p className="text-2xl font-semibold text-[#232323] tracking-tight">
                {formatPrice(designResult.priceRange[0])} &ndash;{" "}
                {formatPrice(designResult.priceRange[1])}
              </p>
              <p className="text-xs text-[#616161]/70 mt-1">
                Cabinets and doors only. Benchtop, installation quoted separately.
              </p>
            </motion.div>
          )}

          {/* Share & Save */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <button
              type="button"
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#232323] hover:bg-[#FAFAFA] active:scale-[0.98] transition-all min-h-[44px]"
            >
              <Share2 className="size-4" />
              Share
            </button>
            <button
              type="button"
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#232323] hover:bg-[#FAFAFA] active:scale-[0.98] transition-all min-h-[44px]"
            >
              <Bookmark className="size-4" />
              Save
            </button>
          </motion.div>

          {/* Primary CTA */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            onClick={next}
            className="w-full h-[52px] flex items-center justify-center bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all min-h-[44px]"
          >
            Customize This Design
          </motion.button>

          {/* Secondary link */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            onClick={next}
            className="w-full mt-4 mb-4 py-3 text-sm text-[#616161] hover:text-[#232323] transition-colors text-center min-h-[44px]"
          >
            Try a different direction
          </motion.button>
        </div>
      </div>
    </div>
  );
}
