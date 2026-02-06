"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";
import type { BudgetResponse } from "@/stores/useDesignFlowStore";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ============================================================================
// BUDGET OPTIONS
// ============================================================================

const BUDGET_OPTIONS: { label: string; value: BudgetResponse }[] = [
  { label: "That works for me", value: "works" },
  { label: "I'd like to spend less", value: "less" },
  { label: "I'm happy to spend more for better quality", value: "more" },
  { label: "Not sure yet", value: "unsure" },
];

// ============================================================================
// BUDGET QUESTION (Screen 7b)
// ============================================================================

export function BudgetQuestion() {
  const designResult = useDesignFlowStore((s) => s.designResult);
  const setBudgetResponse = useDesignFlowStore((s) => s.setBudgetResponse);
  const next = useDesignFlowStore((s) => s.next);
  const back = useDesignFlowStore((s) => s.back);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const formatPrice = (n: number) =>
    n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

  const priceRange = designResult?.priceRange;
  const priceText = priceRange
    ? `${formatPrice(priceRange[0])}-${formatPrice(priceRange[1])}`
    : "this price range";

  const handleSelect = (value: BudgetResponse) => {
    setBudgetResponse(value);
    next();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white px-6 pt-12 pb-8">
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Back button */}
        <motion.button
          initial={shouldAnimate ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={back}
          className="self-start -ml-2 mb-8 flex items-center gap-1 text-sm text-[#616161] hover:text-[#232323] transition-colors min-h-[44px] min-w-[44px] px-2"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          Back
        </motion.button>

        {/* AI message */}
        <motion.div
          initial={shouldAnimate ? "hidden" : "visible"}
          animate="visible"
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            className="text-[1.125rem] leading-relaxed text-[#232323] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            I&apos;ve designed this with mid-range materials at around{" "}
            {priceText}. Does that range work for you?
          </motion.p>
        </motion.div>

        {/* Option buttons */}
        <motion.div
          initial={shouldAnimate ? "hidden" : "visible"}
          animate="visible"
          className="space-y-3"
        >
          {BUDGET_OPTIONS.map((option, i) => (
            <motion.button
              key={option.value}
              custom={i + 1}
              variants={fadeUp}
              onClick={() => handleSelect(option.value)}
              className="w-full h-[52px] flex items-center px-5 rounded-xl border border-[#E5E5E5] text-[15px] text-[#232323] text-left hover:border-[#77BC40] hover:bg-[#77BC40]/5 active:scale-[0.98] transition-all min-h-[44px]"
            >
              {option.label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
