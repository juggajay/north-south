/**
 * StepReview component
 * Compact summary cards with edit links, clean price list
 */

"use client";

import { useCabinetStore } from '@/stores/useCabinetStore';
import { useWizardStore } from '@/stores/useWizardStore';
import { usePricing } from '@/hooks/usePricing';
import { Pencil } from 'lucide-react';

export function StepReview() {
  const dimensions = useCabinetStore((state) => state.config.dimensions);
  const slots = useCabinetStore((state) => state.config.slots);
  const finishes = useCabinetStore((state) => state.config.finishes);
  const goToStep = useWizardStore((state) => state.goToStep);
  const { formatted, isLoading } = usePricing();

  const moduleCount = Array.from(slots.values()).filter((s) => s.module).length;

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Review Your Design</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Confirm your configuration before submitting.
        </p>
      </div>

      {/* Dimensions card */}
      <SummaryCard
        label="Dimensions"
        value={`${dimensions.width} x ${dimensions.height} x ${dimensions.depth}mm`}
        onEdit={() => goToStep(0)}
      />

      {/* Modules card */}
      <SummaryCard
        label="Modules"
        value={`${moduleCount} module${moduleCount !== 1 ? 's' : ''} configured`}
        onEdit={() => goToStep(1)}
      />

      {/* Finishes card */}
      <SummaryCard
        label="Finishes"
        value={finishes.material || 'Not selected'}
        onEdit={() => goToStep(2)}
      />

      {/* Clean price list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700">Price Estimate</h3>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-zinc-200 rounded w-20" />
                <div className="h-4 bg-zinc-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <PriceLine label="Cabinets" value={formatted.cabinets} />
            <PriceLine label="Material" value={formatted.material} />
            <PriceLine label="Hardware" value={formatted.hardware} />
            <PriceLine label="Door Profile" value={formatted.doorProfile} />

            <div className="border-t border-zinc-200 pt-3 flex justify-between">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="font-bold text-zinc-900">{formatted.total}</span>
            </div>
          </>
        )}

        <p className="text-xs text-zinc-500">
          Final price confirmed after site measure. Hardware &plusmn;5% variance.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-lg">
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-600">{label}</span>
      <span className="text-zinc-900">{value}</span>
    </div>
  );
}
