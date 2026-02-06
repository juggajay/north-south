/**
 * StepLayout component
 * Step 2 of the wizard: Configure cabinet layout by placing modules in slots.
 * Uses SlotDiagram + inline module cards.
 */

'use client';

import { useEffect } from 'react';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useWizardStore } from '@/stores/useWizardStore';
import { SlotDiagram } from './SlotDiagram';
import { BASE_MODULES, OVERHEAD_MODULES } from '@/lib/constants/modules';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleType } from '@/types/configurator';

interface StepLayoutProps {
  onSlotTap: (slotId: string, slotType: 'base' | 'overhead') => void;
}

export function StepLayout({ onSlotTap }: StepLayoutProps) {
  const slots = useCabinetStore((state) => state.config.slots);
  const setModule = useCabinetStore((state) => state.setModule);
  const removeModule = useCabinetStore((state) => state.removeModule);
  const selectedSlot = useWizardStore((state) => state.selectedSlot);
  const selectSlot = useWizardStore((state) => state.selectSlot);
  const clearSelectedSlot = useWizardStore((state) => state.clearSelectedSlot);

  // Auto-select first base slot on mount
  useEffect(() => {
    if (!selectedSlot) {
      selectSlot('base-1', 'base');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const modules = selectedSlot?.type === 'overhead' ? OVERHEAD_MODULES : BASE_MODULES;
  const currentSlotConfig = selectedSlot ? slots.get(selectedSlot.id) : null;
  const currentModuleType = currentSlotConfig?.module?.type ?? null;

  const handleModuleSelect = (moduleType: ModuleType) => {
    if (!selectedSlot) return;
    setModule(selectedSlot.id, {
      type: moduleType,
      width: 600,
      interiorOptions: {},
      addons: [],
    });
  };

  const handleRemoveModule = () => {
    if (!selectedSlot) return;
    removeModule(selectedSlot.id);
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Configure Layout</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Tap a slot, then choose a module below.
        </p>
      </div>

      {/* Slot diagram - sticky */}
      <div className="sticky top-0 z-10 bg-zinc-50 -mx-6 px-6 py-3">
        <SlotDiagram onSlotTap={onSlotTap} />
      </div>

      {/* Selected slot label + remove */}
      {selectedSlot && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-700 capitalize">
            {selectedSlot.id.replace(/-/g, ' ')}
            {currentModuleType && (
              <span className="text-zinc-500 ml-2">({currentModuleType})</span>
            )}
          </p>
          {currentModuleType && (
            <button
              type="button"
              onClick={handleRemoveModule}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="w-3 h-3" />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Module cards grid */}
      {selectedSlot && (
        <div className="grid grid-cols-2 gap-3">
          {modules.map((module) => (
            <button
              key={module.type}
              type="button"
              onClick={() => handleModuleSelect(module.type)}
              className={cn(
                'p-4 border rounded-lg text-left transition-all',
                currentModuleType === module.type
                  ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                  : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50',
              )}
            >
              <div className="w-full h-16 bg-zinc-200 rounded mb-2 flex items-center justify-center text-zinc-400 text-xs">
                Photo
              </div>
              <p className="font-medium text-sm">{module.name}</p>
              <p className="text-xs text-zinc-500">{module.description}</p>
            </button>
          ))}
        </div>
      )}

      {!selectedSlot && (
        <div className="p-8 text-center text-zinc-500 text-sm">
          Tap a slot in the diagram above to get started.
        </div>
      )}
    </div>
  );
}
