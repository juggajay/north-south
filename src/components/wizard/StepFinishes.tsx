/**
 * StepFinishes component
 * Phase 04-07: Finish Selection & Review
 *
 * Features:
 * - Material, hardware, and door profile selection
 * - Real-time selection summary
 * - Integrates MaterialPicker for tabbed selection UI
 */

import { MaterialPicker } from './MaterialPicker';
import { useCabinetStore } from '@/stores/useCabinetStore';

export function StepFinishes() {
  const finishes = useCabinetStore((state) => state.config.finishes);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Select Finishes</h2>
        <p className="text-sm text-zinc-500">
          Choose materials, hardware, and door profile for your cabinet.
        </p>
      </div>

      <MaterialPicker />

      {/* Summary of current selections */}
      <div className="mt-6 p-4 bg-zinc-100 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-zinc-700 mb-2">Current Selection</h3>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Material</span>
          <span className="font-medium">
            {finishes.material || <span className="text-zinc-400">Not selected</span>}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Hardware</span>
          <span className="font-medium">
            {finishes.hardware || <span className="text-zinc-400">Not selected</span>}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Door Profile</span>
          <span className="font-medium">
            {finishes.doorProfile || <span className="text-zinc-400">Not selected</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
