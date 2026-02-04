/**
 * StepReview component
 * Phase 04-07: Finish Selection & Review
 * Phase 05-03: Real pricing integration
 *
 * Features:
 * - Complete configuration summary (dimensions, modules, finishes)
 * - Database-driven price breakdown via PriceBreakdown component
 * - Variance disclaimer per pricing decisions
 * - Ready for Phase 06 quote submission integration
 */

import { useCabinetStore } from '@/stores/useCabinetStore';
import { PriceBreakdown } from '@/components/pricing/PriceBreakdown';

export function StepReview() {
  const dimensions = useCabinetStore((state) => state.config.dimensions);
  const slots = useCabinetStore((state) => state.config.slots);
  const finishes = useCabinetStore((state) => state.config.finishes);

  // Count modules for summary display
  const moduleCount = slots.size;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Review Your Design</h2>
        <p className="text-sm text-zinc-500">
          Confirm your configuration before submitting for a quote.
        </p>
      </div>

      {/* Dimensions summary */}
      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="font-medium mb-3">Dimensions</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-zinc-500 block mb-1">Width</span>
            <p className="font-semibold text-lg">{dimensions.width}mm</p>
          </div>
          <div>
            <span className="text-zinc-500 block mb-1">Depth</span>
            <p className="font-semibold text-lg">{dimensions.depth}mm</p>
          </div>
          <div>
            <span className="text-zinc-500 block mb-1">Height</span>
            <p className="font-semibold text-lg">{dimensions.height}mm</p>
          </div>
        </div>
      </div>

      {/* Modules summary */}
      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="font-medium mb-3">Modules ({moduleCount})</h3>
        <div className="space-y-2">
          {Array.from(slots.entries()).map(([slotId, config]) => {
            // Only show slots that have modules
            if (!config.module) return null;

            return (
              <div key={slotId} className="flex justify-between items-center text-sm">
                <span className="text-zinc-600 capitalize">
                  {slotId.replace(/-/g, ' ')}
                </span>
                <span className="font-medium">{config.module.type}</span>
              </div>
            );
          })}
          {moduleCount === 0 && (
            <p className="text-sm text-zinc-500 italic">No modules configured</p>
          )}
        </div>
      </div>

      {/* Finishes summary */}
      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="font-medium mb-3">Finishes</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600">Material</span>
            <span className="font-medium">
              {finishes.material || <span className="text-zinc-400">Not selected</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Hardware</span>
            <span className="font-medium">
              {finishes.hardware || <span className="text-zinc-400">Not selected</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Door Profile</span>
            <span className="font-medium">
              {finishes.doorProfile || <span className="text-zinc-400">Not selected</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Price breakdown - database-driven via PriceBreakdown component */}
      <PriceBreakdown />

      {/* Submit button placeholder - will be wired in Phase 06 */}
      <div className="text-center text-sm text-zinc-500 py-4">
        Submit for Quote will be enabled soon
      </div>
    </div>
  );
}
