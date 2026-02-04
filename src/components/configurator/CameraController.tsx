/**
 * CameraController with OrbitControls and reset button
 * Phase 04-03: 3D Model & Camera
 *
 * Features:
 * - Default 3/4 view camera position (per CONTEXT.md)
 * - OrbitControls with rotation limits (front hemisphere)
 * - Reset button appears after camera movement
 * - Touch gestures (rotate, zoom, pan) via OrbitControls
 */

'use client';

import { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

// ============================================================================
// CONSTANTS
// ============================================================================

// Default 3/4 view camera position
const DEFAULT_POSITION = new THREE.Vector3(3, 2, 4);
const DEFAULT_TARGET = new THREE.Vector3(0, 1, 0); // Look at cabinet center

// ============================================================================
// CAMERACONTROLLER COMPONENT
// ============================================================================

/**
 * Camera controls with OrbitControls and reset functionality
 *
 * Touch gestures:
 * - One finger drag: rotate
 * - Two finger pinch: zoom
 * - Two finger drag: pan
 */
export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hasMovedCamera, setHasMovedCamera] = useState(false);
  const { camera, invalidate } = useThree();

  // Track camera movement
  const handleChange = useCallback(() => {
    // Check if camera has moved from default position
    if (!hasMovedCamera) {
      const distance = camera.position.distanceTo(DEFAULT_POSITION);
      if (distance > 0.1) {
        setHasMovedCamera(true);
      }
    }
    invalidate(); // Trigger render (frameloop='demand')
  }, [hasMovedCamera, camera, invalidate]);

  // Reset camera to default 3/4 view
  const resetCamera = useCallback(() => {
    if (!controlsRef.current) return;

    camera.position.copy(DEFAULT_POSITION);
    controlsRef.current.target.copy(DEFAULT_TARGET);
    controlsRef.current.update();
    setHasMovedCamera(false);
    invalidate();
  }, [camera, invalidate]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        // Limit rotation to front hemisphere (avoid seeing back of cabinet)
        minPolarAngle={Math.PI * 0.1} // 18 degrees from top
        maxPolarAngle={Math.PI * 0.6} // 108 degrees (well above horizon)
        minAzimuthAngle={-Math.PI * 0.5} // -90 degrees (left limit)
        maxAzimuthAngle={Math.PI * 0.5} // +90 degrees (right limit)
        // Zoom limits
        minDistance={2}
        maxDistance={8}
        // Touch settings
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        onChange={handleChange}
      />

      {/* Reset button appears after camera movement */}
      {hasMovedCamera && (
        <Html
          position={[0, 0, 0]}
          center
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={resetCamera}
            className="px-3 py-1.5 bg-white/90 rounded-full text-xs font-medium shadow-sm hover:bg-white transition-colors"
          >
            Reset View
          </button>
        </Html>
      )}
    </>
  );
}
