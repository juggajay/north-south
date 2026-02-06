"use client";

/**
 * HeroVideo — Remotion Player wrapper for the NS logo reveal animation.
 *
 * Renders a looping, autoplay, muted Remotion composition.
 * Falls back to a static placeholder when reduced motion is preferred.
 */

import { lazy, Suspense, useMemo } from "react";
import type { KitchenTransformationProps } from "./remotion/KitchenTransformation";

// Lazy-load Remotion Player to avoid SSR issues and reduce initial bundle
const RemotionPlayer = lazy(() => import("./RemotionHeroPlayer"));

interface HeroVideoProps {
  reducedMotion: boolean;
  beforeImage?: string;
  afterImage?: string;
}

export function HeroVideo({ reducedMotion, beforeImage, afterImage }: HeroVideoProps) {
  const inputProps = useMemo<KitchenTransformationProps>(
    () => ({ beforeImage, afterImage }),
    [beforeImage, afterImage],
  );

  if (reducedMotion) {
    return <StaticHero />;
  }

  return (
    <Suspense fallback={<StaticHero />}>
      <RemotionPlayer inputProps={inputProps} />
    </Suspense>
  );
}

/** Static fallback — shown when reduced motion is preferred or while loading */
function StaticHero() {
  return (
    <div className="relative w-full h-full" style={{ backgroundColor: "#232323" }}>
      {/* NS Logo centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Circle with NS */}
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" stroke="#555" strokeWidth="2" />
            <text
              x="60"
              y="68"
              textAnchor="middle"
              fill="#77BC40"
              fontSize="40"
              fontWeight="bold"
              fontFamily="Inter, sans-serif"
            >
              NS
            </text>
          </svg>
          {/* Brand text */}
          <div className="text-center">
            <div
              className="text-sm font-bold tracking-[0.25em] uppercase"
              style={{ color: "#999" }}
            >
              North South
            </div>
            <div
              className="text-[10px] tracking-[0.3em] uppercase mt-1"
              style={{ color: "#666" }}
            >
              &mdash; Kitchens &mdash;
            </div>
          </div>
        </div>
      </div>

      {/* Subtle grid for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
