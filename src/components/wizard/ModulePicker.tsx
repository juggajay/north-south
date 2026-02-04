/**
 * ModulePicker component
 * Phase 04-05: Slot-based Module Placement
 *
 * Bottom sheet for selecting modules to place in slots.
 * Shows all 12 module types (7 base, 5 overhead) based on slot type.
 */

'use client';

import Sheet from 'react-modal-sheet';
import { useCabinetStore } from '@/stores/useCabinetStore';
import type { ModuleType } from '@/types/configurator';

// ============================================================================
// MODULE DEFINITIONS
// ============================================================================

// Base modules (7 types)
const BASE_MODULES: { type: ModuleType; name: string; description: string }[] = [
  { type: 'standard', name: 'Standard Cabinet', description: 'Shelf and door' },
  { type: 'sink-base', name: 'Sink Base', description: 'Open for plumbing' },
  { type: 'drawer-stack', name: 'Drawer Stack', description: '3-4 drawers' },
  { type: 'pull-out-pantry', name: 'Pull-out Pantry', description: 'Tall pull-out' },
  { type: 'corner-base', name: 'Corner Cabinet', description: 'L-shaped corner' },
  { type: 'appliance-tower', name: 'Appliance Tower', description: 'Oven/microwave' },
  { type: 'open-shelving', name: 'Open Shelving', description: 'No doors' },
];

// Overhead modules (5 types)
const OVERHEAD_MODULES: { type: ModuleType; name: string; description: string }[] = [
  { type: 'standard-overhead', name: 'Standard Overhead', description: 'Single door' },
  { type: 'glass-door', name: 'Glass Door', description: 'Display cabinet' },
  { type: 'open-shelf', name: 'Open Shelf', description: 'No doors' },
  { type: 'rangehood-space', name: 'Rangehood Space', description: 'For rangehood' },
  { type: 'lift-up-door', name: 'Lift-up Door', description: 'Lifts upward' },
];

// ============================================================================
// TYPES
// ============================================================================

interface ModulePickerProps {
  isOpen: boolean;
  slotId: string | null;
  slotType: 'base' | 'overhead' | null;
  onClose: () => void;
}

// ============================================================================
// MODULEPICKER COMPONENT
// ============================================================================

/**
 * ModulePicker bottom sheet
 *
 * Displays all module types for the selected slot type.
 * User taps to select a module, which places it in the slot.
 * Can also remove an existing module.
 *
 * @param isOpen - Whether the sheet is open
 * @param slotId - ID of the selected slot
 * @param slotType - 'base' or 'overhead' (determines available modules)
 * @param onClose - Callback to close the sheet
 */
export function ModulePicker({
  isOpen,
  slotId,
  slotType,
  onClose,
}: ModulePickerProps) {
  const setModule = useCabinetStore((state) => state.setModule);
  const removeModule = useCabinetStore((state) => state.removeModule);
  const slotConfig = useCabinetStore((state) =>
    slotId ? state.config.slots.get(slotId) : null
  );

  const modules = slotType === 'base' ? BASE_MODULES : OVERHEAD_MODULES;
  const hasModule = slotConfig?.module !== null && slotConfig?.module !== undefined;

  const handleSelect = (moduleType: ModuleType) => {
    if (!slotId) return;

    setModule(slotId, {
      type: moduleType,
      width: 600, // Default width
      interiorOptions: {},
      addons: [],
    });

    onClose();
  };

  const handleRemove = () => {
    if (!slotId) return;
    removeModule(slotId);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[500, 300, 0]}
      initialSnap={0}
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>
          <div className="px-4 pb-8">
            <h3 className="text-lg font-semibold mb-4">
              Select {slotType === 'base' ? 'Base' : 'Overhead'} Module
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {modules.map((module) => (
                <button
                  key={module.type}
                  onClick={() => handleSelect(module.type)}
                  className="p-4 border rounded-lg text-left hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                >
                  {/* Placeholder for real product photos per CONTEXT.md */}
                  <div className="w-full h-20 bg-zinc-200 rounded mb-2 flex items-center justify-center text-zinc-400 text-xs">
                    Photo
                  </div>
                  <p className="font-medium text-sm">{module.name}</p>
                  <p className="text-xs text-zinc-500">{module.description}</p>
                </button>
              ))}
            </div>

            {/* Remove option if slot is filled */}
            {hasModule && (
              <button
                onClick={handleRemove}
                className="w-full mt-4 py-3 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove Module
              </button>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onClose} />
    </Sheet>
  );
}
