/**
 * StepReview component
 * Phase 04-07: Finish Selection & Review
 * Phase 05-03: Real pricing integration
 * Phase 06-02: Quote submission integration
 *
 * Features:
 * - Complete configuration summary (dimensions, modules, finishes)
 * - Database-driven price breakdown via PriceBreakdown component
 * - Variance disclaimer per pricing decisions
 * - Submit for Quote button that launches SubmissionFlow
 * - Uses existing auto-saved designId from sessionStorage
 */

"use client";

import { useState } from 'react';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useAuth } from '@/hooks/useAuth';
import { PriceBreakdown } from '@/components/pricing/PriceBreakdown';
import { SubmissionFlow } from '@/components/submission/SubmissionFlow';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Id } from '../../../convex/_generated/dataModel';

export function StepReview() {
  const [showSubmission, setShowSubmission] = useState(false);
  const { user } = useAuth();

  const dimensions = useCabinetStore((state) => state.config.dimensions);
  const slots = useCabinetStore((state) => state.config.slots);
  const finishes = useCabinetStore((state) => state.config.finishes);

  // Count modules for summary display
  const moduleCount = slots.size;

  // Get existing auto-saved designId from sessionStorage
  // Design was already auto-saved in Phase 04 - DO NOT create new design
  const getDesignId = (): Id<"designs"> | null => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('currentDesignId');
      if (stored) return stored as Id<"designs">;
    }
    return null;
  };

  const handleStartSubmission = () => {
    const designId = getDesignId();

    if (!designId) {
      toast.error("No saved design found. Please save your design first.");
      return;
    }

    setShowSubmission(true);
  };

  // If submission flow is shown, render only that
  if (showSubmission) {
    const designId = getDesignId();
    if (!designId) {
      toast.error("Design ID missing. Cannot submit.");
      setShowSubmission(false);
      return null;
    }

    return (
      <SubmissionFlow
        designId={designId}
        onCancel={() => setShowSubmission(false)}
      />
    );
  }

  // Normal review content
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

      {/* Submit for Quote button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleStartSubmission}
          className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700"
        >
          Submit for Quote
        </Button>
      </div>
    </div>
  );
}
