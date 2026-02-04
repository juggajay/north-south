/**
 * StepLayout component
 * Phase 04-05: Slot-based Module Placement
 *
 * Step 2 of the wizard: Configure cabinet layout by placing modules in slots.
 * Shows summary and list of configured modules.
 */

'use client';

import { useCabinetStore } from '@/stores/useCabinetStore';

// ============================================================================
// TYPES
// ============================================================================

interface StepLayoutProps {
  onSlotTap: (slotId: string, slotType: 'base' | 'overhead') => void;
}

// ============================================================================
// STEPLAYOUT COMPONENT
// ============================================================================

/**
 * StepLayout component
 *
 * Layout configuration step (Step 2).
 * Shows instructions, summary of configured modules, and list.
 * User interacts with 3D view to tap slots and select modules.
 *
 * @param onSlotTap - Callback to open module picker for a slot
 */
export function StepLayout({ onSlotTap }: StepLayoutProps) {
  const slots = useCabinetStore((state) => state.config.slots);

  // Calculate summary
  const filledSlots = Array.from(slots.entries()).filter(
    ([_, slotConfig]) => slotConfig.module !== null
  );
  const filledCount = filledSlots.length;
  const isEmpty = filledCount === 0;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Configure Layout</h2>
        <p className="text-sm text-zinc-500">
          Tap slots in the 3D view to add modules.
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-zinc-100 rounded-lg">
        <p className="text-sm text-zinc-600">
          {isEmpty
            ? 'No modules added yet. Tap a slot above to get started.'
            : `${filledCount} module${filledCount !== 1 ? 's' : ''} configured`}
        </p>
      </div>

      {/* List of configured modules */}
      {filledCount > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-zinc-700">Configured Modules</h4>
          {filledSlots.map(([slotId, slotConfig]) => {
            const slotType = slotId.startsWith('base') ? 'base' : 'overhead';
            return (
              <div
                key={slotId}
                className="flex items-center justify-between p-3 bg-white border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">
                    {slotConfig.module?.type || 'Unknown'}
                  </p>
                  <p className="text-xs text-zinc-500">{slotId}</p>
                </div>
                <button
                  onClick={() => onSlotTap(slotId, slotType)}
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
