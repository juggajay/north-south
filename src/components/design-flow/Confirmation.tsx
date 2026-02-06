"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Share2, RotateCcw } from "lucide-react";
import { useDesignFlowStore } from "@/stores/useDesignFlowStore";

// ============================================================================
// CSS CONFETTI
// ============================================================================

function Confetti() {
  const prefersReduced = useReducedMotion();
  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.8 + Math.random() * 1.2,
      size: 4 + Math.random() * 6,
      color: ["#77BC40", "#232323", "#F59E0B", "#3B82F6", "#EC4899"][
        Math.floor(Math.random() * 5)
      ],
    }))
  );

  if (prefersReduced) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: -20, x: `${p.x}vw`, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            y: ["0vh", "80vh"],
            rotate: [0, 360 + Math.random() * 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          className="absolute top-0"
          style={{
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// TIMELINE STEP
// ============================================================================

function TimelineStep({
  number,
  title,
  isLast,
}: {
  number: number;
  title: string;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#77BC40]/10 shrink-0">
          <span className="text-xs font-semibold text-[#77BC40]">{number}</span>
        </div>
        {!isLast && <div className="w-px flex-1 bg-[#77BC40]/20 my-1" />}
      </div>

      {/* Text */}
      <div className={isLast ? "pb-0" : "pb-4"}>
        <p className="text-sm text-[#232323] pt-1">{title}</p>
      </div>
    </div>
  );
}

// ============================================================================
// CONFIRMATION (Screen 11)
// ============================================================================

interface ConfirmationProps {
  onViewDashboard?: () => void;
}

const TIMELINE_STEPS = [
  "Quote (2\u20133 business days)",
  "Site measure (we come to you \u2014 free)",
  "Approve your final design",
  "We build your kitchen",
  "Installation (4\u20136 weeks from approval)",
];

export function Confirmation({ onViewDashboard }: ConfirmationProps) {
  const userName = useDesignFlowStore((s) => s.userName);
  const designResult = useDesignFlowStore((s) => s.designResult);
  const reset = useDesignFlowStore((s) => s.reset);
  const [showConfetti, setShowConfetti] = useState(true);

  const renderUrl = designResult?.renders?.[0];

  // Auto-dismiss confetti after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white relative">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Render image */}
        {renderUrl ? (
          <img
            src={renderUrl}
            alt="Your kitchen design"
            className="w-full aspect-[16/10] object-cover"
          />
        ) : (
          <div className="w-full aspect-[16/10] bg-[#F7F7F7] flex items-center justify-center">
            <p className="text-sm text-[#616161]">Your kitchen design</p>
          </div>
        )}

        <div className="px-5 pb-10">
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-[1.5rem] leading-tight tracking-[-0.02em] text-[#232323]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quote request submitted
          </motion.h1>

          {/* AI message */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 bg-[#77BC40]/5 border border-[#77BC40]/15 rounded-xl px-4 py-3"
          >
            <p className="text-sm text-[#616161] leading-relaxed">
              You&apos;re all set, {userName || "there"}. I&apos;ve sent
              everything to our team. You&apos;ll get an email shortly with the
              details.
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-6"
          >
            <p className="text-sm font-semibold text-[#232323] mb-3">
              What happens next:
            </p>
            <div>
              {TIMELINE_STEPS.map((title, idx) => (
                <TimelineStep
                  key={idx}
                  number={idx + 1}
                  title={title}
                  isLast={idx === TIMELINE_STEPS.length - 1}
                />
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 space-y-3"
          >
            {/* Primary CTA */}
            <button
              onClick={() => {
                if (onViewDashboard) {
                  onViewDashboard();
                } else {
                  alert("Dashboard coming soon");
                }
              }}
              className="w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-[#232323] rounded-xl shadow-lg shadow-[#232323]/10 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all"
            >
              View My Designs
              <ArrowRight className="size-4" />
            </button>

            {/* Share link */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "North South Carpentry",
                    text: "I just designed my new kitchen with North South Carpentry. Check it out!",
                    url: "https://northsouthcarpentry.com.au",
                  });
                } else {
                  alert("Share feature coming soon");
                }
              }}
              className="w-full h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-[#232323] border border-zinc-200 rounded-xl hover:bg-zinc-50 active:scale-[0.98] transition-all"
            >
              <Share2 className="size-4" />
              Know someone renovating? Share North South
            </button>

            {/* Start new design */}
            <button
              onClick={reset}
              className="w-full h-[44px] flex items-center justify-center gap-1.5 text-sm font-medium text-[#616161] hover:text-[#232323] transition-colors"
            >
              <RotateCcw className="size-3.5" />
              Start a new design
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
