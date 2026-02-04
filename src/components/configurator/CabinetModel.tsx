/**
 * CabinetModel container component
 * Phase 04-03: 3D Model & Camera
 * Phase 04-05: Slot-based Module Placement
 *
 * Composes the complete cabinet 3D model:
 * - CabinetFrame (wireframe box)
 * - SlotSystem (module slots)
 * - Floor plane (grounding)
 */

'use client';

import { CabinetFrame } from './CabinetFrame';
import { SlotSystem } from './SlotSystem';

// ============================================================================
// TYPES
// ============================================================================

interface CabinetModelProps {
  onSlotTap?: (slotId: string, slotType: 'base' | 'overhead') => void;
}

// ============================================================================
// CABINETMODEL COMPONENT
// ============================================================================

/**
 * Cabinet model container
 *
 * @param onSlotTap - Callback when a slot is tapped (for module selection)
 */
export function CabinetModel({ onSlotTap }: CabinetModelProps) {
  return (
    <group>
      <CabinetFrame />
      {onSlotTap && <SlotSystem onSlotTap={onSlotTap} />}
    </group>
  );
}
