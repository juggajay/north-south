'use client';

import { useCabinetStore } from '@/stores/useCabinetStore';
import { useWizardStore } from '@/stores/useWizardStore';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotDiagramProps {
  onSlotTap: (slotId: string, slotType: 'base' | 'overhead') => void;
}

export function SlotDiagram({ onSlotTap }: SlotDiagramProps) {
  const width = useCabinetStore((state) => state.config.dimensions.width);
  const slots = useCabinetStore((state) => state.config.slots);
  const selectedSlot = useWizardStore((state) => state.selectedSlot);

  const slotCount = Math.floor(width / 600);

  const renderRow = (rowType: 'overhead' | 'base') => {
    const slotIds = Array.from({ length: slotCount }, (_, i) => `${rowType}-${i + 1}`);

    return (
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${slotCount}, 1fr)` }}
      >
        {slotIds.map((slotId) => {
          const slotConfig = slots.get(slotId);
          const hasModule = slotConfig?.module != null;
          const isActive = selectedSlot?.id === slotId;

          return (
            <button
              key={slotId}
              type="button"
              onClick={() => onSlotTap(slotId, rowType)}
              className={cn(
                'flex items-center justify-center rounded-lg text-xs font-medium transition-all',
                rowType === 'overhead' ? 'h-12' : 'h-16',
                isActive
                  ? 'border-2 border-zinc-900 bg-zinc-900/5'
                  : hasModule
                    ? 'border-2 border-zinc-400 bg-white'
                    : 'border-2 border-dashed border-zinc-300 bg-white',
              )}
            >
              {hasModule ? (
                <Check className="w-4 h-4 text-zinc-600" />
              ) : (
                <span className="text-zinc-400">{slotId.split('-').pop()}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-zinc-100 rounded-xl p-4 space-y-2 max-w-screen-sm mx-auto">
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Overhead</p>
      {renderRow('overhead')}
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-3 mb-1">Base</p>
      {renderRow('base')}
    </div>
  );
}
