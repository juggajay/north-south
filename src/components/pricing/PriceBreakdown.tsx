/**
 * PriceBreakdown component
 * Phase 05: Finishes & Pricing
 *
 * Display itemized price breakdown with variance disclaimer
 */

import { usePricing } from '@/hooks/usePricing'

export function PriceBreakdown() {
  const { formatted, isLoading } = usePricing()

  if (isLoading) {
    return <PriceBreakdownSkeleton />
  }

  return (
    <div className="p-4 bg-white border border-zinc-200 rounded-lg">
      <h3 className="font-medium text-zinc-900 mb-3">Price Breakdown</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600">Cabinets</span>
          <span className="font-medium text-zinc-900">{formatted.cabinets}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600">Material</span>
          <span className="font-medium text-zinc-900">{formatted.material}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600">Hardware</span>
          <span className="font-medium text-zinc-900">{formatted.hardware}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600">Door Profile</span>
          <span className="font-medium text-zinc-900">{formatted.doorProfile}</span>
        </div>

        {/* Total */}
        <div className="border-t border-zinc-200 pt-2 mt-2 flex justify-between font-semibold text-base">
          <span className="text-zinc-900">Total</span>
          <span className="text-zinc-900">{formatted.total}</span>
        </div>
      </div>

      {/* Variance disclaimer */}
      <div className="mt-4 p-3 bg-zinc-50 rounded text-xs text-zinc-600 space-y-1">
        <p>
          <strong>Important:</strong> This is an estimate only. Final price
          will be confirmed after site measure.
        </p>
        <p>
          Hardware pricing may vary ±{formatted.hardwareVariance} based on
          supplier availability.
        </p>
      </div>
    </div>
  )
}

function PriceBreakdownSkeleton() {
  return (
    <div className="p-4 bg-white border border-zinc-200 rounded-lg animate-pulse">
      <div className="h-5 bg-zinc-200 rounded w-32 mb-3" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-zinc-200 rounded w-20" />
            <div className="h-4 bg-zinc-200 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200 pt-2 mt-2 flex justify-between">
        <div className="h-5 bg-zinc-200 rounded w-16" />
        <div className="h-5 bg-zinc-200 rounded w-20" />
      </div>
    </div>
  )
}
