/**
 * ModuleSlot component
 * Phase 04-05: Slot-based Module Placement
 *
 * Renders a single slot in the 3D view.
 * - Empty slots: Wireframe placeholder with + icon
 * - Filled slots: Module geometry with label
 * - Tap handling for module selection
 */

'use client';

import { useRef, useState } from 'react';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ModuleConfig } from '@/types/configurator';

// ============================================================================
// CONSTANTS
// ============================================================================

const MM_TO_UNITS = 0.001;

// ============================================================================
// TYPES
// ============================================================================

interface ModuleSlotProps {
  slotId: string;
  position: [number, number, number];
  width: number; // in mm
  type: 'base' | 'overhead';
  module: ModuleConfig | null;
  onTap: () => void;
}

// ============================================================================
// MODULESLOT COMPONENT
// ============================================================================

/**
 * ModuleSlot component
 *
 * Renders an interactive slot in the 3D view.
 * - Empty: Wireframe placeholder with + icon
 * - Filled: Solid module geometry with label
 * - Tap to open module picker
 *
 * @param slotId - Unique slot identifier
 * @param position - [x, y, z] position in scene units
 * @param width - Slot width in mm
 * @param type - 'base' or 'overhead'
 * @param module - Module configuration (null if empty)
 * @param onTap - Callback when slot is tapped
 */
export function ModuleSlot({
  slotId,
  position,
  width,
  type,
  module,
  onTap,
}: ModuleSlotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Slot dimensions
  const slotWidth = width * MM_TO_UNITS;
  const slotHeight = type === 'base' ? 0.8 : 0.6; // 800mm base, 600mm overhead
  const slotDepth = 0.56; // 560mm standard depth

  // Handle pointer events
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    onTap();
  };

  if (module) {
    // Render filled module (placeholder - actual models in Plan 06)
    return (
      <mesh
        ref={meshRef}
        position={position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[slotWidth * 0.95, slotHeight * 0.95, slotDepth * 0.95]} />
        <meshStandardMaterial color={hovered ? '#525252' : '#737373'} />
        <Edges color="#262626" lineWidth={1} />
        {/* Module label */}
        <Html
          position={[0, slotHeight / 2 + 0.05, slotDepth / 2 + 0.01]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="px-2 py-1 bg-white/90 rounded text-xs font-medium whitespace-nowrap">
            {module.type}
          </div>
        </Html>
      </mesh>
    );
  }

  // Render empty slot placeholder
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[slotWidth * 0.95, slotHeight * 0.95, slotDepth * 0.95]} />
      <meshBasicMaterial
        color={hovered ? '#a1a1aa' : '#e4e4e7'}
        transparent
        opacity={hovered ? 0.4 : 0.2}
        wireframe={false}
      />
      <Edges color={hovered ? '#52525b' : '#a1a1aa'} lineWidth={1} />
      {/* Plus icon for empty slot */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div className={`text-2xl ${hovered ? 'text-zinc-600' : 'text-zinc-400'}`}>
          +
        </div>
      </Html>
    </mesh>
  );
}
