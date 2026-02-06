"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVideo } from "./HeroVideo";

// ============================================================================
// TYPES
// ============================================================================

interface LandingPageProps {
  onGetStarted: () => void;
  onTryDemo: () => void;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ============================================================================
// TRUST SIGNALS DATA
// ============================================================================

const trustSignals = [
  {
    icon: Star,
    title: "Trusted by 1,000+ Australian homeowners",
    description: "Real families, real kitchens, manufactured locally.",
  },
  {
    icon: Clock,
    title: "Design your kitchen in 15 minutes",
    description: "Snap a photo, answer a few questions, see your design.",
  },
  {
    icon: Shield,
    title: "Free to design, no commitment",
    description:
      "Explore, share, and only request a quote when you\u2019re ready.",
  },
];

// ============================================================================
// LANDING PAGE
// ============================================================================

export function LandingPage({ onGetStarted, onTryDemo }: LandingPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const trustRef = useRef<HTMLDivElement>(null);
  const trustInView = useInView(trustRef, { once: true, margin: "-60px" });

  // If reduced motion, skip the entrance animations — show everything immediately
  const shouldAnimate = !prefersReducedMotion;

  return (
    <div className="min-h-[100dvh] bg-white overflow-x-hidden">
      {/* ── HEADER BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]/50">
        <div className="flex items-center justify-between px-5 h-14 max-w-lg mx-auto">
          <img
            src="/images/nsc-logo.png"
            alt="North South"
            className="h-8 w-auto"
          />
          <button
            onClick={onGetStarted}
            className="text-sm font-medium text-[#616161] hover:text-[#232323] transition-colors"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-14">
        {/* Hero video / animation */}
        <motion.div
          initial={shouldAnimate ? "hidden" : "visible"}
          animate="visible"
          variants={scaleIn}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[55dvh]"
        >
          <HeroVideo reducedMotion={!!prefersReducedMotion} />
        </motion.div>

        {/* ── HEADLINE + CTA (overlapping the hero bottom) ── */}
        <div className="relative -mt-20 z-10 px-5 max-w-lg mx-auto">
          <motion.div
            initial={shouldAnimate ? "hidden" : "visible"}
            animate="visible"
            className="flex flex-col gap-5"
          >
            {/* Headline */}
            <motion.h1
              custom={0}
              variants={fadeUp}
              className="text-[2rem] leading-[1.1] tracking-[-0.02em] text-[#232323] sm:text-[2.5rem]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your dream kitchen,
              <br />
              <span className="text-[#77BC40]">designed around you.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              custom={1}
              variants={fadeUp}
              className="text-[15px] leading-relaxed text-[#616161] max-w-[340px]"
            >
              Snap a photo of your space and we&apos;ll guide you through
              designing your perfect kitchen — no design experience needed.
            </motion.p>

            {/* Price anchor */}
            <motion.div custom={2} variants={fadeUp}>
              <p className="text-sm text-[#616161]">
                <span className="font-semibold text-[#232323]">
                  Custom kitchens from $8,000
                </span>
                <br />
                <span className="text-xs text-[#616161]/70">
                  Cabinets and doors — benchtop, installation quoted separately
                </span>
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              custom={3}
              variants={fadeUp}
              className="flex flex-col gap-3 pt-2"
            >
              <Button
                onClick={onGetStarted}
                size="lg"
                className="w-full bg-[#232323] text-white hover:bg-[#2D2D2D] rounded-xl text-[15px] font-semibold h-[52px] shadow-lg shadow-[#232323]/10"
              >
                Get Started Free
                <ArrowRight className="size-4 ml-1" />
              </Button>

              <button
                onClick={onTryDemo}
                className="group flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[#616161] hover:text-[#313131] transition-colors"
              >
                Try with a sample space
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── HORIZONTAL RULE ── */}
      <div className="px-5 max-w-lg mx-auto py-10">
        <div
          className="h-px bg-gradient-to-r from-transparent via-[#77BC40]/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* ── TRUST SIGNALS ── */}
      <section
        ref={trustRef}
        className="px-5 max-w-lg mx-auto pb-8"
        aria-label="Why choose North South"
      >
        <motion.div
          initial={shouldAnimate ? "hidden" : "visible"}
          animate={
            shouldAnimate ? (trustInView ? "visible" : "hidden") : "visible"
          }
          className="grid grid-cols-1 gap-6"
        >
          {trustSignals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={signal.title}
                custom={index}
                variants={fadeUp}
                className="flex items-start gap-4"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#77BC40]/10 shrink-0">
                  <Icon className="size-[18px] text-[#77BC40]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#232323]">
                    {signal.title}
                  </p>
                  <p className="text-[13px] text-[#616161] mt-0.5">
                    {signal.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── BOTTOM SAFE AREA ── */}
      <div className="h-8" />
    </div>
  );
}
