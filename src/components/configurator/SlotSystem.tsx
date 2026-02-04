/**
 * SlotSystem component
 * Phase 04-05: Slot-based Module Placement
 *
 * Calculates and renders slot positions based on cabinet dimensions.
 * Slots are automatically positioned in base and overhead areas.
 */

'use client';

import { useEffect, useState } from 'react';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { ModuleSlot } from './ModuleSlot';

// ============================================================================
// CONSTANTS
// ============================================================================

const MM_TO_UNITS = 0.001;
const DEFAULT_SLOT_WIDTH = 600; // mm

// ============================================================================
// TYPES
// ============================================================================

interface SlotPosition {
  id: string;
  type: 'base' | 'overhead';
  x: number; // Center X position in scene units
  y: number; // Y position
  z: number; // Z position (depth center)
  width: number; // Slot width in mm
}

// ============================================================================
// SLOT CALCULATION
// ============================================================================

/**
 * Calculate slot positions based on cabinet dimensions
 *
 * Logic:
 * - Divide cabinet width into slots (600mm default width)
 * - Base slots: At floor level (y = 0.4m center)
 * - Overhead slots: At upper level (y = 1.7m center)
 * - Overhead slots slightly forward for visibility
 */
function calculateSlots(dimensions: {
  width: number;
  height: number;
  depth: number;
}): SlotPosition[] {
  const slots: SlotPosition[] = [];
  const cabinetWidth = dimensions.width;
  const cabinetDepth = dimensions.depth;

  // Calculate number of base slots (simple division for now)
  const numBaseSlots = Math.floor(cabinetWidth / DEFAULT_SLOT_WIDTH);
  const baseSlotWidth = cabinetWidth / numBaseSlots;

  // Base cabinet slots
  for (let i = 0; i < numBaseSlots; i++) {
    const xOffset = (i - (numBaseSlots - 1) / 2) * (baseSlotWidth * MM_TO_UNITS);
    slots.push({
      id: `base-${i + 1}`,
      type: 'base',
      x: xOffset,
      y: 0.4, // Base cabinet height center (800mm / 2)
      z: 0,
      width: baseSlotWidth,
    });
  }

  // Overhead cabinet slots (same number as base for symmetry)
  for (let i = 0; i < numBaseSlots; i++) {
    const xOffset = (i - (numBaseSlots - 1) / 2) * (baseSlotWidth * MM_TO_UNITS);
    slots.push({
      id: `overhead-${i + 1}`,
      type: 'overhead',
      x: xOffset,
      y: 1.7, // Overhead height center
      z: cabinetDepth * MM_TO_UNITS * -0.3, // Slightly forward
      width: baseSlotWidth,
    });
  }

  return slots;
}

// ============================================================================
// SLOTSYSTEM COMPONENT
// ============================================================================

interface SlotSystemProps {
  onSlotTap: (slotId: string, slotType: 'base' | 'overhead') => void;
}

/**
 * SlotSystem component
 *
 * Calculates slot positions and renders ModuleSlot components.
 * Recalculates when dimensions change.
 *
 * @param onSlotTap - Callback when a slot is tapped (opens module picker)
 */
export function SlotSystem({ onSlotTap }: SlotSystemProps) {
  const [slots, setSlots] = useState<SlotPosition[]>([]);
  const dimensions = useCabinetStore((state) => state.config.dimensions);
  const slotConfigs = useCabinetStore((state) => state.config.slots);

  // Recalculate slots when dimensions change
  useEffect(() => {
    setSlots(calculateSlots(dimensions));
  }, [dimensions]);

  return (
    <group>
      {slots.map((slot) => {
        const slotConfig = slotConfigs.get(slot.id);
        return (
          <ModuleSlot
            key={slot.id}
            slotId={slot.id}
            position={[slot.x, slot.y, slot.z]}
            width={slot.width}
            type={slot.type}
            module={slotConfig?.module || null}
            onTap={() => onSlotTap(slot.id, slot.type)}
          />
        );
      })}
    </group>
  );
}
