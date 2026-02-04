/**
 * ReviewSummary component
 * Phase 06-02: Customer-facing submission flow
 *
 * Features:
 * - Complete configuration summary (dimensions, modules, finishes)
 * - Database-driven price breakdown from usePricing hook
 * - Display selected submission options (site measure, installation)
 * - Customer notes display if provided
 * - Back/Submit buttons for final confirmation
 */

"use client";

import { useCabinetStore } from "@/stores/useCabinetStore";
import { usePricing } from "@/hooks/usePricing";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface ReviewSummaryProps {
  siteMeasure: boolean;
  installQuote: boolean;
  notes?: string;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewSummary({
  siteMeasure,
  installQuote,
  notes,
  onBack,
  onSubmit,
  isSubmitting,
}: ReviewSummaryProps) {
  const dimensions = useCabinetStore((state) => state.config.dimensions);
  const slots = useCabinetStore((state) => state.config.slots);
  const finishes = useCabinetStore((state) => state.config.finishes);
  const { formatted, isLoading } = usePricing();

  // Count modules
  const moduleCount = slots.size;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Review & Submit</h2>
        <p className="text-sm text-zinc-500">
          Please confirm your configuration before submitting for a quote.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="p-4 bg-zinc-50 rounded-lg space-y-4">
        <h3 className="font-medium text-zinc-900">Your Configuration</h3>

        {/* Dimensions */}
        <div>
          <p className="text-sm font-medium text-zinc-700 mb-2">Dimensions</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-zinc-500 block">Width</span>
              <p className="font-semibold">{dimensions.width}mm</p>
            </div>
            <div>
              <span className="text-zinc-500 block">Depth</span>
              <p className="font-semibold">{dimensions.depth}mm</p>
            </div>
            <div>
              <span className="text-zinc-500 block">Height</span>
              <p className="font-semibold">{dimensions.height}mm</p>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div>
          <p className="text-sm font-medium text-zinc-700 mb-2">
            Modules ({moduleCount})
          </p>
          <div className="space-y-1">
            {Array.from(slots.entries())
              .filter(([_, config]) => config.module)
              .slice(0, 5)
              .map(([slotId, config]) => (
                <div key={slotId} className="flex justify-between text-sm">
                  <span className="text-zinc-600 capitalize">
                    {slotId.replace(/-/g, " ")}
                  </span>
                  <span className="font-medium">{config.module?.type}</span>
                </div>
              ))}
            {moduleCount > 5 && (
              <p className="text-sm text-zinc-500 italic">
                + {moduleCount - 5} more modules
              </p>
            )}
          </div>
        </div>

        {/* Finishes */}
        <div>
          <p className="text-sm font-medium text-zinc-700 mb-2">Finishes</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Material</span>
              <span className="font-medium">{finishes.material || "Not selected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Hardware</span>
              <span className="font-medium">{finishes.hardware || "Not selected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Door Profile</span>
              <span className="font-medium">{finishes.doorProfile || "Not selected"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Estimate */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-3">Price Estimate</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Cabinets</span>
              <span className="font-medium text-blue-900">{formatted.cabinets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Material</span>
              <span className="font-medium text-blue-900">{formatted.material}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Hardware</span>
              <span className="font-medium text-blue-900">{formatted.hardware}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Door Profile</span>
              <span className="font-medium text-blue-900">{formatted.doorProfile}</span>
            </div>
            <div className="pt-2 border-t border-blue-300 flex justify-between">
              <span className="font-semibold text-blue-900">Total Estimate</span>
              <span className="font-bold text-lg text-blue-900">{formatted.total}</span>
            </div>
          </div>
        )}
        <p className="mt-3 text-xs text-blue-700">
          Final price confirmed after site measure (±5% variance on hardware)
        </p>
      </div>

      {/* Selected Options */}
      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="font-medium text-zinc-900 mb-3">Additional Services</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600">Professional site measure</span>
            <span className="font-medium">{siteMeasure ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Installation quote</span>
            <span className="font-medium">{installQuote ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      {/* Customer Notes */}
      {notes && (
        <div className="p-4 bg-zinc-50 rounded-lg">
          <h3 className="font-medium text-zinc-900 mb-2">Your Notes</h3>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting..." : "Submit for Quote"}
        </Button>
      </div>
    </div>
  );
}
