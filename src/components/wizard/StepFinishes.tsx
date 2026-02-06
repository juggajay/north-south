/**
 * StepFinishes component
 * Finish selection step with MaterialPicker
 */

import { MaterialPicker } from './MaterialPicker';

export function StepFinishes() {
  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">Choose Your Finishes</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Choose materials, hardware, and door profile for your cabinet.
        </p>
      </div>

      <MaterialPicker />
    </div>
  );
}
