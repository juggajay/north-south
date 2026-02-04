/**
 * PriceStickyBar component
 * Phase 05: Finishes & Pricing
 *
 * Sticky price bar for wizard navigation showing live total
 */

import { usePricing } from '@/hooks/usePricing'

interface PriceStickyBarProps {
  className?: string
}

export function PriceStickyBar({ className = '' }: PriceStickyBarProps) {
  const { formatted, isLoading } = usePricing()

  return (
    <div
      className={`sticky bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-4 flex items-center justify-between shadow-lg ${className}`}
    >
      <div className="flex flex-col">
        <span className="text-sm text-zinc-600">Estimated Total</span>
        {isLoading ? (
          <div className="h-7 w-32 bg-zinc-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-zinc-900">{formatted.total}</p>
        )}
      </div>

      <div className="text-xs text-zinc-500 max-w-xs">
        <p>
          Price includes cabinets, materials, hardware, and door profiles.
          Final price confirmed after site measure.
        </p>
      </div>
    </div>
  )
}
