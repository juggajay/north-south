/**
 * KitchenTransformation — Remotion composition
 *
 * Bold, simple hero animation:
 *   1. NS logo fades in big and centered
 *   2. Logo spins away on Y-axis
 *   3. "Create your dream kitchen" text reveals
 *   4. Gentle hold, fade for loop
 *
 * Timeline (6s at 30fps = 180 frames):
 *   0-50:    Logo fades in with subtle scale + glow
 *   50-80:   Logo spins away (rotateY 0→90°, scale down, fade out)
 *   80-130:  Text reveal with staggered word animation
 *   130-170: Hold with gentle pulse
 *   170-180: Fade for seamless loop
 */

import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

// ============================================================================
// PROPS
// ============================================================================

export type KitchenTransformationProps = {
  beforeImage?: string;
  afterImage?: string;
};

// ============================================================================
// BRAND
// ============================================================================

const GREEN = "#77BC40";
const DARK = "#171717";
const WHITE = "#FFFFFF";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ============================================================================
// AMBIENT PARTICLES — gentle green dots floating upward
// ============================================================================

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: 120 + ((i * 71 + 23) % 1040),
  y: 500 + ((i * 43 + 11) % 200),
  size: 2 + (i % 3),
  speed: 0.3 + (i % 5) * 0.1,
  startFrame: 10 + (i * 3) % 40,
}));

const AmbientParticles: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {PARTICLES.map((p, i) => {
        const f = frame - p.startFrame;
        if (f < 0) return null;
        const yDrift = -f * p.speed * 2;
        const opacity = interpolate(f, [0, 15, 120, 160], [0, 0.3, 0.3, 0], CLAMP);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: GREEN,
              opacity,
              transform: `translateY(${yDrift}px)`,
              boxShadow: `0 0 ${p.size * 3}px ${GREEN}60`,
            }}
          />
        );
      })}
    </>
  );
};

// ============================================================================
// GREEN RING — pulses behind the logo
// ============================================================================

const GreenRing: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ringOpacity = interpolate(frame, [8, 25, 55, 72], [0, 0.25, 0.25, 0], CLAMP);
  const ringScale = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 20, stiffness: 60, mass: 1.2 },
    from: 0.6,
    to: 1,
  });
  const pulseScale = interpolate(
    frame,
    [25, 40, 50],
    [1, 1.05, 1],
    CLAMP
  );

  if (ringOpacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 320,
        height: 320,
        borderRadius: "50%",
        border: `2px solid ${GREEN}`,
        transform: `translate(-50%, -50%) scale(${ringScale * pulseScale})`,
        opacity: ringOpacity,
        boxShadow: `0 0 60px ${GREEN}30, inset 0 0 60px ${GREEN}10`,
      }}
    />
  );
};

// ============================================================================
// LOGO — big centered, then spins away
// ============================================================================

const SpinningLogo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Phase 1: Fade in (0-50)
  const fadeIn = interpolate(frame, [5, 30], [0, 1], CLAMP);
  const scaleIn = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 14, stiffness: 50, mass: 1 },
    from: 0.7,
    to: 1,
  });

  // Phase 2: Spin away (50-80)
  const spinProgress = interpolate(frame, [52, 78], [0, 1], CLAMP);
  const rotateY = spinProgress * 110; // slightly past 90° so it fully disappears
  const spinScale = interpolate(frame, [52, 78], [1, 0.6], CLAMP);
  const spinFade = interpolate(frame, [52, 72], [1, 0], CLAMP);

  const combinedOpacity = fadeIn * spinFade;
  const combinedScale = scaleIn * spinScale;

  if (combinedOpacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) perspective(800px) rotateY(${rotateY}deg) scale(${combinedScale})`,
        opacity: combinedOpacity,
        transformStyle: "preserve-3d",
      }}
    >
      <img
        src="/images/nsc-logo.png"
        style={{
          width: 240,
          height: "auto",
          filter: "brightness(2.8) contrast(0.8)",
        }}
      />
    </div>
  );
};

// ============================================================================
// TEXT REVEAL — "Create your dream kitchen"
// ============================================================================

const TextReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const words = [
    { text: "Create", start: 82 },
    { text: "your", start: 87 },
    { text: "dream", start: 92 },
    { text: "space", start: 97 },
  ];

  const groupOpacity = interpolate(frame, [80, 85, 165, 178], [0, 1, 1, 0], CLAMP);

  if (groupOpacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity: groupOpacity,
      }}
    >
      {/* Main text */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {words.map((word, i) => {
          const wordOpacity = interpolate(
            frame,
            [word.start, word.start + 10],
            [0, 1],
            CLAMP
          );
          const wordY = spring({
            frame: Math.max(0, frame - word.start),
            fps,
            config: { damping: 16, stiffness: 80, mass: 0.6 },
            from: 20,
            to: 0,
          });

          return (
            <span
              key={i}
              style={{
                fontFamily: "'Cardo', 'Georgia', serif",
                fontSize: 52,
                fontWeight: 400,
                color: i === 2 ? GREEN : WHITE, // "dream" in green
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                letterSpacing: 1,
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          fontWeight: 300,
          letterSpacing: 4,
          color: `${WHITE}90`,
          textTransform: "uppercase",
          opacity: interpolate(frame, [108, 120], [0, 0.7], CLAMP),
          transform: `translateY(${interpolate(frame, [108, 120], [8, 0], CLAMP)}px)`,
          marginTop: 12,
        }}
      >
        designed around you
      </div>
    </div>
  );
};

// ============================================================================
// ACCENT LINE — thin green line across center
// ============================================================================

const AccentLine: React.FC<{ frame: number }> = ({ frame }) => {
  // Appears with logo, stays through text
  const lineWidth = interpolate(frame, [15, 40], [0, 100], CLAMP);
  const lineOpacity = interpolate(frame, [15, 25, 165, 178], [0, 0.35, 0.35, 0], CLAMP);

  if (lineOpacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, 80px)",
        width: `${lineWidth}%`,
        maxWidth: 500,
        height: 1,
        backgroundColor: GREEN,
        opacity: lineOpacity,
        boxShadow: `0 0 15px ${GREEN}40`,
      }}
    />
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================

export const KitchenTransformation: React.FC<KitchenTransformationProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Overall fade for seamless loop
  const overallOpacity = interpolate(
    frame,
    [0, 8, 172, 180],
    [0, 1, 1, 0.3],
    CLAMP
  );

  return (
    <div
      style={{
        width: 1280,
        height: 720,
        backgroundColor: WHITE,
        position: "relative",
        overflow: "hidden",
        opacity: overallOpacity,
      }}
    >
      {/* Dark center — blurred for perfectly smooth edge blend into white */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "10%",
          right: "10%",
          bottom: "15%",
          backgroundColor: DARK,
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />

      {/* Ambient particles */}
      <AmbientParticles frame={frame} />

      {/* Green ring behind logo */}
      <GreenRing frame={frame} fps={fps} />

      {/* Accent line */}
      <AccentLine frame={frame} />

      {/* Logo (spins away) */}
      <SpinningLogo frame={frame} fps={fps} />

      {/* Text reveal */}
      <TextReveal frame={frame} fps={fps} />

{/* no extra vignette — background gradient handles the blend */}

      {/* Film grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
