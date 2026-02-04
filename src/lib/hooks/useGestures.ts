/**
 * Custom gestures hook for cabinet configurator
 * Phase 04-03: 3D Model & Camera
 *
 * Wraps @use-gesture/react for additional gestures beyond OrbitControls.
 * Currently minimal - OrbitControls handles rotate/zoom/pan.
 * Will be extended for tap-to-select slots/doors in later plans.
 */

'use client';

import { useGesture } from '@use-gesture/react';
import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

interface GestureOptions {
  onTap?: (point: THREE.Vector3) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Cabinet-specific gesture handling
 *
 * @param options - Gesture callbacks
 * @returns Gesture bind function
 *
 * @example
 * ```tsx
 * const bind = useCabinetGestures({
 *   onTap: (point) => console.log('Tapped at', point)
 * });
 * <mesh {...bind()} />
 * ```
 */
export function useCabinetGestures(options: GestureOptions = {}) {
  const { onTap } = options;

  // OrbitControls handles rotate/zoom/pan
  // This hook is for tap-to-select and other custom gestures
  return useGesture({
    onClick: ({ event }) => {
      // Will be used for slot/door tap selection in Plan 05
      if (onTap && (event as any).point) {
        onTap((event as any).point);
      }
    },
  });
}
