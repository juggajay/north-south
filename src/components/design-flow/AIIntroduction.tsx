"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import { useDesignSession } from "@/lib/hooks/useDesignSession";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ============================================================================
// AI INTRODUCTION (Screen 2)
// ============================================================================

export function AIIntroduction() {
  const userName = useDesignFlowStore((s) => s.userName);
  const next = useDesignFlowStore((s) => s.next);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const { initSession } = useDesignSession();

  // Initialize or restore Convex session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white px-6">
      <motion.div
        initial={shouldAnimate ? "hidden" : "visible"}
        animate="visible"
        className="flex flex-col items-center text-center max-w-sm w-full"
      >
        {/* Logo */}
        <motion.img
          custom={0}
          variants={fadeUp}
          src="/images/nsc-logo.png"
          alt="North South Carpentry"
          className="h-10 w-auto mb-10"
        />

        {/* Personalized Greeting */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          className="text-[1.75rem] leading-tight tracking-[-0.02em] text-[#232323]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Hi {userName || "there"}{" "}
          <span className="inline-block" aria-hidden="true">
            {/* wave hand — plain text, no emoji */}
          </span>
        </motion.h1>

        {/* AI Introduction */}
        <motion.p
          custom={2}
          variants={fadeUp}
          className="text-[15px] leading-relaxed text-[#616161] mt-4"
        >
          I&apos;m your kitchen design assistant. I&apos;ll help you create a
          design that&apos;s tailored to your space and style.
        </motion.p>

        {/* Expectations */}
        <motion.div
          custom={3}
          variants={fadeUp}
          className="mt-8 w-full space-y-3"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#77BC40]/10 shrink-0">
              <span className="text-sm font-semibold text-[#77BC40]">1</span>
            </div>
            <p className="text-sm text-[#616161]">
              Snap a photo of your space
            </p>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#77BC40]/10 shrink-0">
              <span className="text-sm font-semibold text-[#77BC40]">2</span>
            </div>
            <p className="text-sm text-[#616161]">
              Answer a few questions about what you need
            </p>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#77BC40]/10 shrink-0">
              <span className="text-sm font-semibold text-[#77BC40]">3</span>
            </div>
            <p className="text-sm text-[#616161]">
              See your personalised design in minutes
            </p>
          </div>
        </motion.div>

        {/* Time & save note */}
        <motion.p
          custom={4}
          variants={fadeUp}
          className="text-xs text-[#616161]/70 mt-6"
        >
          About 15-20 minutes. You can save and come back anytime.
        </motion.p>

        {/* CTA */}
        <motion.button
          custom={5}
          variants={fadeUp}
          onClick={next}
          className="mt-8 w-full h-[52px] flex items-center justify-center gap-2 bg-[#232323] text-white text-[15px] font-semibold rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
        >
          Let&apos;s Go
          <ArrowRight className="size-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
