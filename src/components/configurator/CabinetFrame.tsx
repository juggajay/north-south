/**
 * CabinetFrame component - renders cabinet frame that scales with dimensions
 * Phase 04-03: 3D Model & Camera
 *
 * Features:
 * - Uses useFrame for non-reactive dimension reading (per RESEARCH.md)
 * - Smooth dimension transitions with damp()
 * - Wireframe edges + subtle fill
 * - Centered vertically (cabinet sits on floor)
 */

'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useCabinetStore } from '@/stores/useCabinetStore';

// ============================================================================
// CONSTANTS
// ============================================================================

// 1mm = 0.001 units (so 2400mm = 2.4 units)
const MM_TO_UNITS = 0.001;

// ============================================================================
// CABINETFRAME COMPONENT
// ============================================================================

/**
 * Cabinet frame that scales based on store dimensions
 *
 * Renders as wireframe box with subtle fill for depth perception.
 * Dimensions smoothly animate when changed.
 */
export function CabinetFrame() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Read dimensions from store (non-reactive - no subscription)
    const { dimensions } = useCabinetStore.getState().config;

    // Convert dimensions to scene units
    const targetWidth = dimensions.width * MM_TO_UNITS;
    const targetHeight = dimensions.height * MM_TO_UNITS;
    const targetDepth = dimensions.depth * MM_TO_UNITS;

    // Smooth interpolation for dimension changes using THREE.MathUtils.damp
    meshRef.current.scale.x = THREE.MathUtils.damp(
      meshRef.current.scale.x,
      targetWidth,
      4,
      delta
    );
    meshRef.current.scale.y = THREE.MathUtils.damp(
      meshRef.current.scale.y,
      targetHeight,
      4,
      delta
    );
    meshRef.current.scale.z = THREE.MathUtils.damp(
      meshRef.current.scale.z,
      targetDepth,
      4,
      delta
    );

    // Center vertically (cabinet sits on floor)
    meshRef.current.position.y = meshRef.current.scale.y / 2;
  });

  return (
    <group>
      {/* Cabinet frame */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#e5e5e5"
          transparent
          opacity={0.1}
        />
        <Edges color="#737373" lineWidth={1} />
      </mesh>

      {/* Floor plane for grounding */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f5f5f5" />
        {/* Subtle grid */}
        <Edges color="#d4d4d4" lineWidth={0.5} />
      </mesh>
    </group>
  );
}
