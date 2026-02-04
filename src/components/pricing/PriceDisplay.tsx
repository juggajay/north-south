/**
 * PriceDisplay component
 * Phase 05: Finishes & Pricing
 *
 * Display a single price with optional variance indicator
 */

import { useMemo } from 'react'

interface PriceDisplayProps {
  cents: number
  label?: string
  className?: string
  showVariance?: boolean
  variancePercent?: number
}

export function PriceDisplay({
  cents,
  label,
  className = '',
  showVariance = false,
  variancePercent = 5,
}: PriceDisplayProps) {
  // Cache formatter instance (performance optimization)
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  )

  const price = cents / 100
  const varianceAmount = (price * variancePercent) / 100

  return (
    <div className={className}>
      {label && (
        <span className="block text-sm text-zinc-600 mb-1">{label}</span>
      )}
      <p className="text-lg font-semibold text-zinc-900">
        {formatter.format(price)}
        {showVariance && (
          <span className="text-sm font-normal text-zinc-500 ml-1">
            ±{formatter.format(varianceAmount)}
          </span>
        )}
      </p>
    </div>
  )
}
