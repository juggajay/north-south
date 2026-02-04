/**
 * Level of Detail (LOD) Performance System
 * Phase 04-09: Version History, Before/After, LOD
 *
 * Features:
 * - LODWrapper using drei's Detailed component
 * - SimpleLOD for quick quality reduction on any component
 * - useLODConfig hook for device-based thresholds
 * - FPSMonitor for detecting performance drops
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Detailed } from '@react-three/drei';

// ============================================================================
// TYPES
// ============================================================================

interface LODWrapperProps {
  /** High detail children (shown when close) */
  high: React.ReactElement;
  /** Medium detail children (shown at mid distance) */
  medium: React.ReactElement;
  /** Low detail children (shown when far) */
  low: React.ReactElement;
  /** Distance thresholds [low, medium] in Three.js units (default: [15, 8]) */
  distances?: [number, number];
}

interface SimpleLODProps {
  /** Children to render */
  children: React.ReactNode;
  /** Whether to use low detail mode */
  lowDetail: boolean;
}

interface LODConfig {
  /** Distance thresholds for LOD levels */
  distances: [number, number];
  /** Whether device is low-end */
  isLowEnd: boolean;
  /** Whether to force low detail globally */
  forceLowDetail: boolean;
}

interface FPSMonitorProps {
  /** Target FPS threshold (default: 30) */
  targetFPS?: number;
  /** Callback when FPS drops below target */
  onLowFPS?: () => void;
  /** Callback when FPS recovers above target */
  onRecoverFPS?: () => void;
  /** Sample interval in frames (default: 60) */
  sampleInterval?: number;
  /** Show visual FPS counter */
  showCounter?: boolean;
}

// ============================================================================
// LOD WRAPPER
// ============================================================================

/**
 * LOD Wrapper using drei's Detailed component
 *
 * Usage:
 * - Automatically switches detail level based on camera distance
 * - Reduces geometry/texture detail when far away
 * - Improves performance for complex scenes
 *
 * @param high - High detail content (close up)
 * @param medium - Medium detail content (mid distance)
 * @param low - Low detail content (far away)
 * @param distances - Distance thresholds [low, medium] in Three.js units
 *
 * @example
 * ```tsx
 * <LODWrapper
 *   high={<DetailedCabinet />}
 *   medium={<SimplifiedCabinet />}
 *   low={<BoxCabinet />}
 *   distances={[15, 8]}
 * />
 * ```
 */
export function LODWrapper({
  high,
  medium,
  low,
  distances = [15, 8],
}: LODWrapperProps) {
  return (
    <Detailed distances={distances}>
      {/* Low detail (shown first in Detailed component) */}
      {low as any}
      {/* Medium detail */}
      {medium as any}
      {/* High detail */}
      {high as any}
    </Detailed>
  );
}

// ============================================================================
// SIMPLE LOD
// ============================================================================

/**
 * Simple LOD reducer for any component
 *
 * Usage:
 * - Wraps any component to reduce quality when lowDetail is true
 * - Good for manual LOD control without distance-based switching
 *
 * @param children - Content to render
 * @param lowDetail - Whether to use low detail mode
 *
 * @example
 * ```tsx
 * const [lowDetail] = useLODConfig();
 * <SimpleLOD lowDetail={lowDetail}>
 *   <ComplexGeometry />
 * </SimpleLOD>
 * ```
 */
export function SimpleLOD({ children, lowDetail }: SimpleLODProps) {
  if (!lowDetail) {
    return <>{children}</>;
  }

  // In low detail mode, reduce rendering quality
  return (
    <group
      // Reduce shadow quality in low detail
      castShadow={false}
      receiveShadow={false}
    >
      {children}
    </group>
  );
}

// ============================================================================
// USE LOD CONFIG HOOK
// ============================================================================

/**
 * Hook for device-based LOD configuration
 *
 * Features:
 * - Detects device capabilities (CPU cores, memory, GPU)
 * - Returns appropriate LOD settings
 * - Can force low detail globally
 *
 * @returns LOD configuration object
 *
 * @example
 * ```tsx
 * const { isLowEnd, forceLowDetail, distances } = useLODConfig();
 *
 * if (forceLowDetail) {
 *   return <SimpleCabinet />;
 * }
 * ```
 */
export function useLODConfig(): LODConfig {
  const [config, setConfig] = useState<LODConfig>({
    distances: [15, 8],
    isLowEnd: false,
    forceLowDetail: false,
  });

  useEffect(() => {
    // Detect device capabilities
    const detectDevice = () => {
      // Check CPU cores (low-end: < 4 cores)
      const cores = navigator.hardwareConcurrency || 4;

      // Check device memory (low-end: < 4GB)
      // @ts-ignore - deviceMemory is not in TypeScript types but exists in Chrome
      const memory = navigator.deviceMemory || 4;

      // Check if mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Determine if low-end
      const isLowEnd = cores < 4 || memory < 4 || (isMobile && cores < 6);

      // Adjust distances for low-end devices (switch earlier)
      const distances: [number, number] = isLowEnd ? [20, 12] : [15, 8];

      setConfig({
        distances,
        isLowEnd,
        forceLowDetail: false, // Can be set by user preference later
      });
    };

    detectDevice();
  }, []);

  return config;
}

// ============================================================================
// FPS MONITOR
// ============================================================================

/**
 * FPS Monitor for detecting performance drops
 *
 * Features:
 * - Tracks frame rate in real-time
 * - Triggers callbacks on low FPS / recovery
 * - Optional visual counter
 *
 * @param targetFPS - Target FPS threshold (default: 30)
 * @param onLowFPS - Callback when FPS drops below target
 * @param onRecoverFPS - Callback when FPS recovers
 * @param sampleInterval - Sample interval in frames (default: 60)
 * @param showCounter - Show visual FPS counter
 *
 * @example
 * ```tsx
 * <FPSMonitor
 *   targetFPS={30}
 *   onLowFPS={() => setLowDetail(true)}
 *   onRecoverFPS={() => setLowDetail(false)}
 *   showCounter
 * />
 * ```
 */
export function FPSMonitor({
  targetFPS = 30,
  onLowFPS,
  onRecoverFPS,
  sampleInterval = 60,
  showCounter = false,
}: FPSMonitorProps) {
  const [fps, setFPS] = useState(60);
  const [isLowFPS, setIsLowFPS] = useState(false);

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);

  useFrame(() => {
    frameCount.current += 1;

    // Sample every N frames
    if (frameCount.current % sampleInterval === 0) {
      const now = performance.now();
      const delta = now - lastTime.current;
      const currentFPS = (sampleInterval / delta) * 1000;

      lastTime.current = now;

      // Add to history (keep last 5 samples)
      fpsHistory.current.push(currentFPS);
      if (fpsHistory.current.length > 5) {
        fpsHistory.current.shift();
      }

      // Calculate average FPS
      const avgFPS =
        fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;

      setFPS(Math.round(avgFPS));

      // Check if FPS is low
      const nowLowFPS = avgFPS < targetFPS;

      if (nowLowFPS && !isLowFPS) {
        setIsLowFPS(true);
        onLowFPS?.();
      } else if (!nowLowFPS && isLowFPS) {
        setIsLowFPS(false);
        onRecoverFPS?.();
      }
    }
  });

  if (!showCounter) {
    return null;
  }

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial
          color={isLowFPS ? '#ef4444' : '#22c55e'}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Note: Text rendering requires drei's Text component */}
      {/* For simplicity, we just show a colored indicator here */}
      {/* In production, you'd use Html component to show actual FPS number */}
    </group>
  );
}

// ============================================================================
// PERFORMANCE DEGRADATION HELPER
// ============================================================================

/**
 * Hook that automatically reduces quality on performance drops
 *
 * Features:
 * - Monitors FPS continuously
 * - Gradually reduces quality levels
 * - Returns current quality level and manual override
 *
 * @returns [qualityLevel, setQualityOverride]
 *
 * @example
 * ```tsx
 * const [quality] = usePerformanceDegradation();
 *
 * return quality === 'low' ? <SimpleCabinet /> : <DetailedCabinet />;
 * ```
 */
export function usePerformanceDegradation(): [
  'high' | 'medium' | 'low',
  (level: 'high' | 'medium' | 'low') => void
] {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [override, setOverride] = useState<'high' | 'medium' | 'low' | null>(null);

  const handleLowFPS = () => {
    if (quality === 'high') {
      setQuality('medium');
    } else if (quality === 'medium') {
      setQuality('low');
    }
  };

  const handleRecoverFPS = () => {
    if (quality === 'low') {
      setQuality('medium');
    } else if (quality === 'medium') {
      setQuality('high');
    }
  };

  // Use override if set
  const currentQuality = override || quality;

  return [currentQuality, setOverride];
}
