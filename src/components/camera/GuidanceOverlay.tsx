"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

interface GuidanceOverlayProps {
  onGalleryClick: () => void;
}

const TIPS = [
  "Stand back to capture the full wall",
  "Include floor and ceiling if possible",
  "Ensure good lighting for best results",
  "Hold steady while capturing",
];

/**
 * Camera guidance overlay with corner brackets and rotating tips.
 * Provides visual framing and helpful capture instructions.
 */
export function GuidanceOverlay({ onGalleryClick }: GuidanceOverlayProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      {/* Corner brackets */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        {/* Top-left corner */}
        <path
          d="M 4 12 L 4 4 L 12 4"
          stroke="white"
          strokeWidth="0.3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Top-right corner */}
        <path
          d="M 88 4 L 96 4 L 96 12"
          stroke="white"
          strokeWidth="0.3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Bottom-left corner */}
        <path
          d="M 4 88 L 4 96 L 12 96"
          stroke="white"
          strokeWidth="0.3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Bottom-right corner */}
        <path
          d="M 96 88 L 96 96 L 88 96"
          stroke="white"
          strokeWidth="0.3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>

      {/* Rotating tips at bottom - above capture button */}
      <div className="absolute left-0 right-0 bottom-32 flex justify-center px-6">
        <div className="pointer-events-none rounded-lg bg-black/50 px-4 py-3 backdrop-blur-sm">
          <p className="text-center text-sm font-medium text-white">
            {TIPS[currentTipIndex]}
          </p>
        </div>
      </div>

      {/* Gallery button in bottom-left - same height as capture button */}
      <button
        onClick={onGalleryClick}
        className="pointer-events-auto absolute left-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all active:scale-95"
      >
        <ImageIcon className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
