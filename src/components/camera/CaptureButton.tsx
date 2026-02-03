"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface CaptureButtonProps {
  onCapture: () => void;
}

/**
 * Press-and-hold camera shutter button with visual progress ring.
 * Requires 1 second hold to prevent accidental captures.
 */
export function CaptureButton({ onCapture }: CaptureButtonProps) {
  const progress = useMotionValue(0);
  const isHoldingRef = useRef(false);
  const animationRef = useRef<any>(null);

  // SVG circle parameters for progress ring
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  const handlePressStart = () => {
    isHoldingRef.current = true;

    // Animate progress from 0 to 1 over 1 second
    animationRef.current = animate(progress, 1, {
      duration: 1,
      ease: "linear",
      onComplete: () => {
        if (isHoldingRef.current) {
          onCapture();
          // Reset progress after capture
          progress.set(0);
        }
      },
    });
  };

  const handlePressEnd = () => {
    isHoldingRef.current = false;

    // Stop animation and reset if released early
    if (animationRef.current) {
      animationRef.current.stop();
    }
    animate(progress, 0, { duration: 0.2 });
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center"
        onTapStart={handlePressStart}
        onTap={handlePressEnd}
        onTapCancel={handlePressEnd}
        style={{
          touchAction: "none",
        }}
      >
        {/* Progress ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width="80"
          height="80"
          viewBox="0 0 80 80"
        >
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#18181b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: progress.get()
                ? circumference - progress.get() * circumference
                : circumference,
            }}
          />
        </svg>

        {/* Inner white button */}
        <motion.div
          className="h-16 w-16 rounded-full bg-white"
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>
    </div>
  );
}
