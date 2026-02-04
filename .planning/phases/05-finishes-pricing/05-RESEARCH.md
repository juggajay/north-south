# Phase 05: Finishes & Pricing - Research

**Researched:** 2026-02-04
**Domain:** Component-based pricing engines, swipeable UI patterns, real-time price calculation
**Confidence:** MEDIUM

## Summary

This phase implements a database-driven pricing engine with real-time updates and swipeable finish selection cards. The research focused on five critical areas: pricing engine architecture, swipeable UI patterns, real-time state synchronization, currency formatting, and texture preview implementation.

**Key findings:**
- Modern pricing UIs use integer-based storage (cents) to avoid JavaScript floating-point errors, only converting to currency format for display
- Swipeable card interfaces are best implemented with Framer Motion for smooth animations, while tabbed layouts (already implemented) provide better accessibility
- Zustand's per-component subscriptions are optimal for live pricing updates, preventing unnecessary re-renders
- `Intl.NumberFormat` is the standard for currency formatting in 2026, with excellent browser support
- React Three Fiber's `useTexture` hook from @react-three/drei simplifies texture loading for material previews

**Primary recommendation:** Build a dedicated pricing calculation hook (`usePricing`) that queries Convex for all pricing data, calculates totals from the Zustand configuration store, and returns formatted values. Store all prices as integers in the database (cents), calculate in integers, format on display.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Framer Motion | 11.x | Tab animations, transitions | Already in use (Phase 04), industry standard for React animations |
| Zustand | 5.x | Client state management | Already in use, optimal for high-frequency updates like live pricing |
| Convex | 1.x | Real-time database queries | Already in use, reactive queries eliminate manual sync |
| React Three Fiber | 8.x | 3D material preview | Already in use (Phase 04), standard for Three.js in React |
| @react-three/drei | 9.x | `useTexture` hook for materials | Standard companion to R3F, simplifies texture loading |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.NumberFormat | Native | Currency formatting | All price displays (already in browser, no install needed) |
| decimal.js | 10.x | Precise decimal arithmetic | Only if complex pricing formulas with decimals (likely not needed) |
| big.js | 6.x | Alternative to decimal.js | Lighter alternative if decimal precision needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tabbed UI | react-swipeable + horizontal scroll | More mobile-native feel, but worse accessibility and harder to implement |
| Intl.NumberFormat | toFixed() + manual formatting | Simpler but no locale support, fails for international users |
| Convex queries | REST API + manual caching | More control but lose real-time sync, more code |

**Installation:**
```bash
# Already installed in Phase 04
npm install framer-motion zustand convex @react-three/fiber @react-three/drei

# Only if complex decimal arithmetic needed (likely not)
npm install decimal.js
# OR
npm install big.js
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/wizard/
│   ├── MaterialPicker.tsx      # Already exists, enhance with texture preview
│   ├── StepFinishes.tsx         # Already exists, enhance with live pricing
│   └── StepReview.tsx           # Already exists, replace placeholder pricing
├── hooks/
│   ├── usePricing.ts            # NEW: Pricing calculation hook
│   ├── useModulePricing.ts      # NEW: Module-specific pricing logic
│   └── useMaterialTexture.ts    # NEW: Material texture loading hook
├── components/pricing/
│   ├── PriceBreakdown.tsx       # NEW: Itemized price display
│   ├── PriceTotal.tsx           # NEW: Sticky total bar
│   └── PriceDisclaimer.tsx      # NEW: Variance disclaimer component
convex/
├── pricing/
│   ├── calculate.ts             # NEW: Pricing calculation queries
│   └── breakdown.ts             # NEW: Price breakdown queries
```

### Pattern 1: Centralized Pricing Hook

**What:** A custom hook that encapsulates all pricing logic, queries all pricing data from Convex, reads current configuration from Zustand, and returns calculated totals with category breakdown.

**When to use:** Any component that needs to display or calculate prices.

**Example:**
```typescript
// Source: Research synthesis from Zustand + Convex patterns
// hooks/usePricing.ts
import { useQuery } from 'convex/react'
import { useCabinetStore } from '@/stores/useCabinetStore'
import { api } from '../../convex/_generated/api'

interface PriceBreakdown {
  cabinets: number      // In cents
  material: number      // In cents
  hardware: number      // In cents
  addons: number        // In cents
  total: number         // In cents
}

export function usePricing() {
  // Query all pricing data from Convex (reactive)
  const materials = useQuery(api.products.materials.list) || []
  const hardware = useQuery(api.products.hardware.list) || []
  const doorProfiles = useQuery(api.doorProfiles.list) || []
  const modules = useQuery(api.products.modules.list) || []

  // Subscribe only to config changes (not entire store)
  const config = useCabinetStore((state) => state.config)

  // Calculate breakdown (runs on config or data changes)
  const breakdown = useMemo<PriceBreakdown>(() => {
    let cabinets = 0
    let materialCost = 0
    let hardwareCost = 0
    let addonsCost = 0

    // Calculate cabinet/module costs (stored as cents in DB)
    config.slots.forEach((slot) => {
      if (!slot.module) return
      const module = modules.find((m) => m.code === slot.module?.type)
      if (module) cabinets += module.pricePerUnit // Already in cents
    })

    // Calculate material cost (stored as cents in DB)
    const selectedMaterial = materials.find(
      (m) => m.code === config.finishes.material
    )
    if (selectedMaterial) {
      materialCost = selectedMaterial.pricePerUnit // Already in cents
    }

    // Calculate hardware cost (stored as cents in DB)
    const selectedHardware = hardware.find(
      (h) => h.code === config.finishes.hardware
    )
    if (selectedHardware) {
      hardwareCost = selectedHardware.pricePerUnit // Already in cents
    }

    // Calculate door profile cost
    const selectedProfile = doorProfiles.find(
      (p) => p.code === config.finishes.doorProfile
    )
    if (selectedProfile) {
      const doorCount = config.slots.size // Simplified: 1 door per module
      addonsCost += selectedProfile.pricePerDoor * doorCount // Already in cents
    }

    return {
      cabinets,
      material: materialCost,
      hardware: hardwareCost,
      addons: addonsCost,
      total: cabinets + materialCost + hardwareCost + addonsCost,
    }
  }, [config, materials, hardware, doorProfiles, modules])

  // Format helper (converts cents to currency string)
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(cents / 100) // Convert cents to dollars
  }

  return {
    breakdown,
    formatPrice,
    totalFormatted: formatPrice(breakdown.total),
  }
}
```

**Benefits:**
- Single source of truth for pricing logic
- Automatic reactivity via Convex queries
- Only subscribed components re-render on price changes
- Easy to test pricing logic in isolation

### Pattern 2: Integer-Based Pricing Storage

**What:** Store all monetary values as integers (cents) in the database, perform all calculations in integer arithmetic, convert to display format only when rendering.

**When to use:** All pricing fields in database schema, all pricing calculations.

**Example:**
```typescript
// Source: JavaScript floating-point precision best practices
// convex/schema.ts - pricing fields
materials: defineTable({
  // ... other fields
  pricePerUnit: v.number(), // Stored as cents: 8900 = $89.00
})

hardware: defineTable({
  // ... other fields
  pricePerUnit: v.number(),      // Stored as cents
  priceVariance: v.number(),     // Stored as percentage: 5 = 5%
})

// WRONG - floating point arithmetic
const total = 89.99 + 12.50 + 0.01 // May not equal 102.50 exactly

// RIGHT - integer arithmetic
const totalCents = 8999 + 1250 + 1 // Always equals 10250
const totalDollars = totalCents / 100 // Convert only for display
```

**Why it matters:**
- Avoids JavaScript floating-point precision errors (0.1 + 0.2 !== 0.3)
- Prevents rounding errors from accumulating over multiple calculations
- Guarantees exact arithmetic (critical for financial applications)

### Pattern 3: Formatted Display Component

**What:** Separate components for displaying prices with consistent formatting, variance disclaimers, and breakdowns.

**When to use:** All price displays in UI.

**Example:**
```typescript
// Source: Intl.NumberFormat best practices
// components/pricing/PriceDisplay.tsx
interface PriceDisplayProps {
  cents: number
  label?: string
  showVariance?: boolean
  variancePercent?: number
}

export function PriceDisplay({
  cents,
  label,
  showVariance,
  variancePercent = 5
}: PriceDisplayProps) {
  // Reusable formatter instance (cache for performance)
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
  const varianceAmount = showVariance ? (price * variancePercent) / 100 : 0

  return (
    <div className="space-y-1">
      {label && <span className="text-sm text-zinc-600">{label}</span>}
      <p className="text-lg font-semibold">
        {formatter.format(price)}
        {showVariance && (
          <span className="text-sm font-normal text-zinc-500">
            {' '}±{formatter.format(varianceAmount)}
          </span>
        )}
      </p>
    </div>
  )
}
```

### Pattern 4: Material Texture Preview (Three.js)

**What:** Load and apply material textures to 3D cabinet surfaces in real-time as user selects finishes.

**When to use:** Material selection in StepFinishes.

**Example:**
```typescript
// Source: React Three Fiber texture loading patterns
// hooks/useMaterialTexture.ts
import { useTexture } from '@react-three/drei'
import { useCabinetStore } from '@/stores/useCabinetStore'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useMaterialTexture() {
  const selectedMaterial = useCabinetStore(
    (state) => state.config.finishes.material
  )
  const materials = useQuery(api.products.materials.list) || []

  const material = materials.find((m) => m.code === selectedMaterial)
  const textureUrl = material?.textureUrl || '/textures/default.jpg'

  // Load texture (cached automatically by drei)
  const texture = useTexture(textureUrl)

  return texture
}

// components/3d/CabinetMaterial.tsx
import { useMaterialTexture } from '@/hooks/useMaterialTexture'

export function CabinetMaterial() {
  const texture = useMaterialTexture()

  return (
    <meshStandardMaterial
      map={texture}
      roughness={0.8}
      metalness={0.1}
    />
  )
}
```

### Anti-Patterns to Avoid

- **Storing prices as floats:** Leads to rounding errors (0.1 + 0.2 = 0.30000000000000004)
- **Calculating totals in render:** Use `useMemo` to avoid recalculating on every render
- **Multiple currency formatters:** Create once, reuse (performance optimization)
- **Manual string formatting:** Use `Intl.NumberFormat`, not template literals with `toFixed()`
- **Inline pricing logic:** Centralize in `usePricing` hook for consistency
- **Fetching pricing data per component:** Use Convex's reactive queries once, share via hooks

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Template literals + toFixed() | Intl.NumberFormat | Locale support, symbol placement, grouping separators |
| Decimal arithmetic | Native JS math operators | Store as integers (cents) | Avoids floating-point precision errors |
| Swipeable cards | Custom touch event handlers | Framer Motion animations | Handles edge cases, cancellation, accessibility |
| Texture loading | Raw TextureLoader | @react-three/drei useTexture | Automatic caching, suspense support, error handling |
| Real-time price sync | Manual polling or WebSockets | Convex reactive queries | Built-in reactivity, automatic reconnection, optimistic updates |
| State subscription optimization | Context API with full re-renders | Zustand selectors | Per-component subscriptions, only affected parts update |

**Key insight:** Pricing logic is deceptively complex. JavaScript's floating-point arithmetic silently introduces errors that compound over calculations. Storing as integers and using established formatting libraries prevents entire classes of bugs that are difficult to debug and costly to fix retroactively (as evidenced by real-world cases of having to fix invoices in production databases).

## Common Pitfalls

### Pitfall 1: Floating-Point Arithmetic in Pricing

**What goes wrong:** Using decimal values (89.99, 12.50) in calculations leads to precision errors like `89.99 + 0.01 = 90.00000000000001`, which compounds across multiple operations and can result in incorrect totals displayed to users.

**Why it happens:** JavaScript uses IEEE 754 double-precision floating-point format, which cannot precisely represent many decimal fractions in binary. Developers assume `0.1 + 0.2` equals `0.3`, but it actually equals `0.30000000000000004`.

**How to avoid:**
1. Store all prices as integers (cents) in database schema
2. Perform all calculations using integer arithmetic
3. Convert to currency format only for display using `Intl.NumberFormat`
4. If decimals unavoidable, use `decimal.js` or `big.js` library

**Warning signs:**
- Totals that are off by fractions of a cent
- Tests failing with values like `expected: 100.00, received: 99.99999999999999`
- Customer complaints about incorrect pricing
- Need to "round" totals to fix display issues

**Real-world impact:** Developers have reported having to retroactively fix invoices in production databases and inform customers about incorrect charges due to accumulating rounding errors.

### Pitfall 2: Unnecessary Re-renders on Price Updates

**What goes wrong:** Every price update triggers re-render of entire component tree, causing UI lag and poor performance, especially with live 3D preview running simultaneously.

**Why it happens:** Subscribing to entire Zustand store (`const state = useCabinetStore()`) instead of specific slices, or using Context API without memoization. React re-renders all children when parent state changes.

**How to avoid:**
1. Use Zustand selectors to subscribe to specific state slices
   ```typescript
   // WRONG - subscribes to everything
   const state = useCabinetStore()

   // RIGHT - only subscribes to finishes
   const finishes = useCabinetStore((state) => state.config.finishes)
   ```
2. Wrap pricing calculations in `useMemo` to prevent recalculation on unrelated renders
3. Use `React.memo` on price display components that don't need to update frequently
4. Consider `useDeferredValue` for non-urgent price updates during heavy 3D rendering

**Warning signs:**
- UI feels sluggish when selecting materials
- React DevTools Profiler shows many components rendering on every price change
- 3D viewport stutters when interacting with pricing UI

**Performance impact:** Zustand's per-component subscriptions can reduce update times from ~220ms (Context API) to ~35ms for complex state updates (based on 2026 benchmarks).

### Pitfall 3: Incorrect Locale/Currency Assumptions

**What goes wrong:** Hardcoding currency symbols ("$"), decimal separators ("."), or thousands separators (",") breaks for international users. Australian users expect "AU$" or "$", Europeans expect "€" with comma decimals.

**Why it happens:** Using string templates like `` `$${price.toFixed(2)}` `` assumes US format. Many developers don't test with different locales.

**How to avoid:**
1. Always use `Intl.NumberFormat` with explicit locale and currency
   ```typescript
   const formatter = new Intl.NumberFormat('en-AU', {
     style: 'currency',
     currency: 'AUD',
   })
   formatter.format(1234.56) // "A$1,234.56" or "$1,234.56"
   ```
2. Store locale in environment variable or user settings
3. Test with multiple locales (en-US, en-AU, de-DE, ja-JP)

**Warning signs:**
- Currency symbol in wrong position ($100 vs 100$)
- Wrong decimal/thousands separator (1,234.56 vs 1.234,56)
- Missing currency code for international transactions

### Pitfall 4: Stale Pricing Data

**What goes wrong:** User sees old prices after admin updates pricing in database, or sees incorrect prices if Convex query hasn't loaded yet.

**Why it happens:** Not handling loading states, assuming Convex queries return instantly, or not leveraging Convex's automatic reactivity.

**How to avoid:**
1. Handle loading states explicitly
   ```typescript
   const materials = useQuery(api.products.materials.list)

   if (materials === undefined) {
     return <PricingSkeleton />
   }
   ```
2. Provide fallback values or disable actions until data loads
3. Trust Convex's reactivity—don't manually refetch
4. Show loading indicators for price calculations

**Warning signs:**
- Flashing content as prices update
- Prices showing as $0.00 briefly on load
- "undefined" in price displays
- Stale prices after admin changes

### Pitfall 5: Missing Variance Disclaimer

**What goes wrong:** Users expect exact prices but receive quotes ±5% different, leading to complaints and loss of trust. Legal issues if prices presented as guaranteed but aren't.

**Why it happens:** Developer focuses on calculation accuracy, forgets to communicate that hardware pricing varies with supplier availability.

**How to avoid:**
1. Always show variance disclaimer near hardware prices
2. Include disclaimer in review step and total price display
3. Use consistent language: "±5% supplier variance"
4. Make disclaimer visible but not intrusive (info icon, small text below total)

**Example:**
```typescript
<div className="mt-2 p-3 bg-zinc-50 rounded text-xs text-zinc-600">
  <p>
    <strong>Important:</strong> Final price confirmed after site measure.
  </p>
  <p>
    Hardware pricing may vary ±5% based on supplier availability.
  </p>
</div>
```

**Warning signs:**
- Customer complaints about "unexpected" price changes
- Legal questions about binding quotes
- No mention of variance anywhere in UI

## Code Examples

Verified patterns from official sources and research synthesis.

### Pricing Calculation Hook (Complete Implementation)

```typescript
// Source: Research synthesis (Zustand + Convex + integer pricing patterns)
// hooks/usePricing.ts

import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { useCabinetStore } from '@/stores/useCabinetStore'
import { api } from '../../convex/_generated/api'

interface PriceBreakdown {
  cabinets: number      // In cents
  material: number      // In cents
  hardware: number      // In cents
  doorProfile: number   // In cents
  addons: number        // In cents
  subtotal: number      // In cents
  variance: number      // In cents (±5% on hardware)
  total: number         // In cents
}

interface FormattedBreakdown {
  cabinets: string
  material: string
  hardware: string
  doorProfile: string
  addons: string
  subtotal: string
  variance: string
  total: string
}

export function usePricing() {
  // Fetch pricing data (reactive Convex queries)
  const materials = useQuery(api.products.materials.list)
  const hardware = useQuery(api.products.hardware.list)
  const doorProfiles = useQuery(api.doorProfiles.list)
  const modules = useQuery(api.products.modules.list)

  // Subscribe only to config (not entire store)
  const config = useCabinetStore((state) => state.config)

  // Create formatter once (performance optimization)
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

  // Calculate breakdown (only recalculates when dependencies change)
  const breakdown = useMemo<PriceBreakdown>(() => {
    // Handle loading state
    if (!materials || !hardware || !doorProfiles || !modules) {
      return {
        cabinets: 0,
        material: 0,
        hardware: 0,
        doorProfile: 0,
        addons: 0,
        subtotal: 0,
        variance: 0,
        total: 0,
      }
    }

    let cabinetsCost = 0
    let materialCost = 0
    let hardwareCost = 0
    let doorProfileCost = 0
    let addonsCost = 0

    // Calculate cabinet/module costs (all in cents)
    config.slots.forEach((slot) => {
      if (!slot.module) return
      const module = modules.find((m) => m.code === slot.module?.type)
      if (module) {
        cabinetsCost += module.pricePerUnit // Already in cents
      }
    })

    // Calculate material cost (flat price per selection)
    const selectedMaterial = materials.find(
      (m) => m.code === config.finishes.material
    )
    if (selectedMaterial) {
      materialCost = selectedMaterial.pricePerUnit // Already in cents
    }

    // Calculate hardware cost
    const selectedHardware = hardware.find(
      (h) => h.code === config.finishes.hardware
    )
    if (selectedHardware) {
      hardwareCost = selectedHardware.pricePerUnit // Already in cents
    }

    // Calculate door profile cost (price per door × door count)
    const selectedProfile = doorProfiles.find(
      (p) => p.code === config.finishes.doorProfile
    )
    if (selectedProfile) {
      const doorCount = config.slots.size // Simplified: 1 door per module
      doorProfileCost = selectedProfile.pricePerDoor * doorCount
    }

    const subtotal = cabinetsCost + materialCost + hardwareCost + doorProfileCost + addonsCost

    // Calculate ±5% variance on hardware
    const varianceAmount = Math.round((hardwareCost * 5) / 100)

    return {
      cabinets: cabinetsCost,
      material: materialCost,
      hardware: hardwareCost,
      doorProfile: doorProfileCost,
      addons: addonsCost,
      subtotal,
      variance: varianceAmount,
      total: subtotal, // Could add variance to total if desired
    }
  }, [config, materials, hardware, doorProfiles, modules])

  // Format breakdown for display
  const formatted = useMemo<FormattedBreakdown>(() => {
    return {
      cabinets: formatter.format(breakdown.cabinets / 100),
      material: formatter.format(breakdown.material / 100),
      hardware: formatter.format(breakdown.hardware / 100),
      doorProfile: formatter.format(breakdown.doorProfile / 100),
      addons: formatter.format(breakdown.addons / 100),
      subtotal: formatter.format(breakdown.subtotal / 100),
      variance: formatter.format(breakdown.variance / 100),
      total: formatter.format(breakdown.total / 100),
    }
  }, [breakdown, formatter])

  // Loading state
  const isLoading = !materials || !hardware || !doorProfiles || !modules

  return {
    breakdown,      // Raw cents values
    formatted,      // Formatted currency strings
    formatPrice: (cents: number) => formatter.format(cents / 100),
    isLoading,
  }
}
```

### Currency Formatting Component

```typescript
// Source: Intl.NumberFormat best practices
// components/pricing/PriceDisplay.tsx

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
  className,
  showVariance = false,
  variancePercent = 5,
}: PriceDisplayProps) {
  // Cache formatter instance
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
```

### Price Breakdown Component

```typescript
// Source: Research synthesis
// components/pricing/PriceBreakdown.tsx

import { usePricing } from '@/hooks/usePricing'
import { PriceDisplay } from './PriceDisplay'

export function PriceBreakdown() {
  const { formatted, isLoading } = usePricing()

  if (isLoading) {
    return <PriceBreakdownSkeleton />
  }

  return (
    <div className="p-4 bg-white border rounded-lg">
      <h3 className="font-medium mb-3">Price Breakdown</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600">Cabinets</span>
          <span className="font-medium">{formatted.cabinets}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600">Material</span>
          <span className="font-medium">{formatted.material}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600">Hardware</span>
          <span className="font-medium">{formatted.hardware}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-600">Door Profile</span>
          <span className="font-medium">{formatted.doorProfile}</span>
        </div>

        {/* Total */}
        <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{formatted.total}</span>
        </div>
      </div>

      {/* Variance disclaimer */}
      <div className="mt-4 p-3 bg-zinc-50 rounded text-xs text-zinc-600 space-y-1">
        <p>
          <strong>Important:</strong> This is an estimate only. Final price
          will be confirmed after site measure.
        </p>
        <p>
          Hardware pricing may vary ±{formatted.variance} based on supplier
          availability.
        </p>
      </div>
    </div>
  )
}

function PriceBreakdownSkeleton() {
  return (
    <div className="p-4 bg-white border rounded-lg animate-pulse">
      <div className="h-5 bg-zinc-200 rounded w-32 mb-3" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-zinc-200 rounded w-20" />
            <div className="h-4 bg-zinc-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Material Texture Preview Hook

```typescript
// Source: React Three Fiber texture loading patterns
// hooks/useMaterialTexture.ts

import { useTexture } from '@react-three/drei'
import { useCabinetStore } from '@/stores/useCabinetStore'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook to load the currently selected material texture
 * Returns Three.js Texture object for use in materials
 */
export function useMaterialTexture() {
  // Subscribe only to material selection
  const selectedMaterial = useCabinetStore(
    (state) => state.config.finishes.material
  )

  // Query materials from Convex
  const materials = useQuery(api.products.materials.list)

  // Find selected material
  const material = materials?.find((m) => m.code === selectedMaterial)

  // Use textureUrl from database, fallback to default
  const textureUrl = material?.textureUrl || '/textures/default-wood.jpg'

  // Load texture (automatically cached by drei)
  // Supports suspense and error boundaries
  const texture = useTexture(textureUrl)

  return texture
}
```

### Convex Pricing Query

```typescript
// Source: Convex query patterns
// convex/pricing/calculate.ts

import { query } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Calculate total price for a given configuration
 * All prices returned in cents
 */
export const calculateTotal = query({
  args: {
    moduleIds: v.array(v.string()),
    materialCode: v.optional(v.string()),
    hardwareCode: v.optional(v.string()),
    doorProfileCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let total = 0

    // Calculate modules cost
    for (const moduleId of args.moduleIds) {
      const module = await ctx.db
        .query('modules')
        .withIndex('by_code', (q) => q.eq('code', moduleId))
        .first()
      if (module) {
        total += module.pricePerUnit // Already in cents
      }
    }

    // Calculate material cost
    if (args.materialCode) {
      const material = await ctx.db
        .query('materials')
        .withIndex('by_code', (q) => q.eq('code', args.materialCode))
        .first()
      if (material) {
        total += material.pricePerUnit // Already in cents
      }
    }

    // Calculate hardware cost
    if (args.hardwareCode) {
      const hardware = await ctx.db
        .query('hardware')
        .withIndex('by_code', (q) => q.eq('code', args.hardwareCode))
        .first()
      if (hardware) {
        total += hardware.pricePerUnit // Already in cents
      }
    }

    // Calculate door profile cost
    if (args.doorProfileCode) {
      const profile = await ctx.db
        .query('doorProfiles')
        .withIndex('by_code', (q) => q.eq('code', args.doorProfileCode))
        .first()
      if (profile) {
        const doorCount = args.moduleIds.length // 1 door per module
        total += profile.pricePerDoor * doorCount // Already in cents
      }
    }

    return total // In cents
  },
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for all state | Zustand for client state, React Query for server state | ~2023 | Less boilerplate, better performance, clearer separation |
| Manual WebSocket sync | Convex reactive queries | ~2024 | Real-time updates without manual sync code |
| toFixed() for currency | Intl.NumberFormat | ~2020 | Proper locale support, correct symbol placement |
| Float storage for prices | Integer (cents) storage | Always best practice | Eliminates floating-point errors |
| Context API for global state | Zustand with selectors | ~2023 | Per-component subscriptions prevent unnecessary re-renders |
| TextureLoader directly | useTexture from drei | ~2021 | Automatic caching, suspense support |

**Deprecated/outdated:**
- **toFixed() for currency formatting:** Replaced by Intl.NumberFormat (locale support, proper formatting)
- **Context API for high-frequency updates:** Replaced by Zustand (performance)
- **Manual state sync:** Replaced by Convex reactive queries (real-time by default)
- **Float/decimal storage for money:** Replaced by integer (cents) storage (precision)

## Open Questions

Things that couldn't be fully resolved:

1. **Module-specific hardware pricing**
   - What we know: Hardware has flat `pricePerUnit` in schema
   - What's unclear: Should hardware cost scale with module count (e.g., hinges × number of doors)?
   - Recommendation: Start with flat pricing per selection, add per-module scaling in later iteration if needed. Seed data suggests hardware selections are "per cabinet" not "per module" (e.g., "Blum CLIP top 110" is a hinge set, not individual hinges).

2. **Texture quality/compression**
   - What we know: useTexture loads textures, gltf-compressor exists for optimization
   - What's unclear: Optimal texture size/format for web delivery, compression settings
   - Recommendation: Start with 1024×1024 JPG textures at 80% quality, optimize later based on performance metrics. Monitor texture memory usage in Three.js DevTools.

3. **Real-time 3D material preview performance**
   - What we know: Material selection should update 3D view live
   - What's unclear: Performance impact of frequent texture swapping during user browsing
   - Recommendation: Rely on drei's automatic caching, implement texture preloading for all materials on initial load. Monitor with React DevTools Profiler.

4. **Add-ons pricing in this phase**
   - What we know: Add-ons table exists with pricing, referenced in requirements
   - What's unclear: Are add-ons implemented in Phase 05 or Phase 06?
   - Recommendation: Implement add-ons category in pricing breakdown hook now (future-proof), but may not be used until Phase 06 when add-ons UI is built.

## Sources

### Primary (HIGH confidence)
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - Currency formatting API
- [React Three Fiber: Loading Textures](https://r3f.docs.pmnd.rs/tutorials/loading-textures) - Texture loading patterns
- [Zustand Documentation](https://zustand.docs.pmnd.rs/) - State management patterns
- [Convex Documentation](https://www.convex.dev/) - Real-time backend sync

### Secondary (MEDIUM confidence)
- [JavaScript Rounding Errors in Financial Applications](https://www.robinwieruch.de/javascript-rounding-errors/) - WebSearch verified with expert source
- [Financial Precision in JavaScript](https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc) - Integer pricing patterns
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Modern state patterns
- [React Performance Optimization 2026](https://medium.com/@muhammadshakir4152/react-js-optimization-every-react-developer-must-know-2026-edition-e1c098f55ee9) - Performance best practices
- [Framer Motion Animated Tabs](https://www.letsbuildui.dev/articles/animated-tabs-with-framer-motion/) - Tab animation patterns
- [React Aria Swipeable Tabs](https://react-spectrum.adobe.com/react-aria/examples/swipeable-tabs.html) - Swipeable UI patterns

### Tertiary (LOW confidence)
- [react-tinder-card npm](https://www.npmjs.com/package/react-tinder-card) - Swipeable card library (not verified for production use)
- [GitHub: react-cost-calculator](https://github.com/Naess/react-cost-calculator) - Example calculator (educational reference)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, well-documented
- Architecture: MEDIUM - Patterns synthesized from multiple sources, not single authoritative guide
- Pitfalls: HIGH - Verified with official docs and real-world examples
- Code examples: MEDIUM - Synthesized from documentation and best practices, not copy-paste from official examples

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, well-established patterns)

**Notes:**
- Existing codebase already has MaterialPicker, StepFinishes, StepReview components with placeholder pricing
- Database schema already includes all pricing fields (pricePerUnit, pricePerDoor, priceVariance)
- Focus of phase is replacing placeholder pricing with real database-driven calculations
- Tabbed UI already implemented with Framer Motion, swipeable pattern research was exploratory but not needed
