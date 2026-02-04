/**
 * CabinetModel container component
 * Phase 04-03: 3D Model & Camera
 *
 * Composes the complete cabinet 3D model:
 * - CabinetFrame (wireframe box)
 * - Floor plane (grounding)
 * - Slots/modules (to be added in Plan 05)
 */

'use client';

import { CabinetFrame } from './CabinetFrame';

// ============================================================================
// TYPES
// ============================================================================

interface CabinetModelProps {
  onSlotTap?: (slotId: string) => void;
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
      {/* Slots will be added in Plan 05 */}
    </group>
  );
}
