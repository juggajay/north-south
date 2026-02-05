"use client";

import { motion } from "framer-motion";

interface CaptureButtonProps {
  onCapture: () => void;
}

/**
 * Simple tap camera shutter button.
 */
export function CaptureButton({ onCapture }: CaptureButtonProps) {
  return (
    <div className="flex items-center justify-center">
      <motion.button
        className="relative flex h-20 w-20 items-center justify-center"
        onClick={onCapture}
        whileTap={{ scale: 0.9 }}
        style={{ touchAction: "manipulation" }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-white/80" />

        {/* Inner white button */}
        <div className="h-16 w-16 rounded-full bg-white" />
      </motion.button>
    </div>
  );
}
