/**
 * MaterialPicker component
 * Tabbed interface for material/hardware/door profile selection
 * with swatch grid, skeleton loading, and error states.
 */

import { useState } from 'react'
import { useCabinetStore } from '@/stores/useCabinetStore'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { usePricing } from '@/hooks/usePricing'
import { Check } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

type FinishCategory = 'material' | 'hardware' | 'doorProfile'

export function MaterialPicker() {
  const finishes = useCabinetStore((state) => state.config.finishes)
  const setFinish = useCabinetStore((state) => state.setFinish)

  // Fetch materials from Convex
  const materials = useQuery(api.products.materials.list)
  const hardware = useQuery(api.products.hardware.list)
  const doorProfiles = useQuery(api.doorProfiles.list)

  return (
    <Tabs defaultValue="material" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="material">Material</TabsTrigger>
        <TabsTrigger value="hardware">Hardware</TabsTrigger>
        <TabsTrigger value="doorProfile">Door Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="material" className="mt-4">
        {materials === undefined ? (
          <SwatchSkeleton />
        ) : materials === null || materials.length === 0 ? (
          <EmptyState category="materials" onRetry={() => {}} />
        ) : (
          <MaterialSwatches
            materials={materials}
            selected={finishes.material}
            onSelect={(code) => setFinish('material', code)}
          />
        )}
      </TabsContent>

      <TabsContent value="hardware" className="mt-4">
        {hardware === undefined ? (
          <SwatchSkeleton />
        ) : hardware === null || hardware.length === 0 ? (
          <EmptyState category="hardware" onRetry={() => {}} />
        ) : (
          <HardwareOptions
            hardware={hardware}
            selected={finishes.hardware}
            onSelect={(code) => setFinish('hardware', code)}
          />
        )}
      </TabsContent>

      <TabsContent value="doorProfile" className="mt-4">
        {doorProfiles === undefined ? (
          <SwatchSkeleton />
        ) : doorProfiles === null || doorProfiles.length === 0 ? (
          <EmptyState category="door profiles" onRetry={() => {}} />
        ) : (
          <DoorProfiles
            profiles={doorProfiles}
            selected={finishes.doorProfile}
            onSelect={(code) => setFinish('doorProfile', code)}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}

// ============================================================================
// SKELETON LOADING STATE
// ============================================================================

function SwatchSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// ERROR / EMPTY STATE
// ============================================================================

function EmptyState({ category, onRetry }: { category: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8 text-zinc-500">
      <p className="text-sm">Couldn&apos;t load {category}.</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm text-zinc-900 underline mt-2 hover:text-zinc-700"
      >
        Try again
      </button>
    </div>
  )
}

// ============================================================================
// MATERIAL SWATCHES GRID
// ============================================================================

interface MaterialSwatchesProps {
  materials: any[]
  selected: string
  onSelect: (code: string) => void
}

function MaterialSwatches({ materials, selected, onSelect }: MaterialSwatchesProps) {
  const { formatPrice } = usePricing()

  // Group by category
  const grouped = materials.reduce((acc: any, mat: any) => {
    const category = mat.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(mat)
    return acc
  }, {})

  const categoryOrder = ['woodmatt', 'satin', 'gloss', 'other']
  const sortedCategories = categoryOrder.filter(cat => grouped[cat])

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-zinc-700 mb-3 capitalize">
            {category.replace('woodmatt', 'Wood Matt')}
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {grouped[category].map((mat: any) => (
              <div key={mat.code} className="flex flex-col">
                <button
                  onClick={() => onSelect(mat.code)}
                  className={cn(
                    "relative aspect-square rounded-lg border-2 overflow-hidden transition-all",
                    selected === mat.code
                      ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
                      : "border-zinc-200 hover:border-zinc-400"
                  )}
                  title={mat.name}
                >
                  {mat.swatchUrl ? (
                    <img
                      src={mat.swatchUrl}
                      alt={mat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: mat.colorHex || '#d4d4d4' }}
                    />
                  )}
                  {/* Check overlay on selected */}
                  {selected === mat.code && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
                <p className="text-xs text-zinc-600 mt-1 text-center font-medium">
                  {formatPrice(mat.pricePerUnit)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// HARDWARE OPTIONS LIST
// ============================================================================

interface HardwareOptionsProps {
  hardware: any[]
  selected: string
  onSelect: (code: string) => void
}

function HardwareOptions({ hardware, selected, onSelect }: HardwareOptionsProps) {
  const { formatPrice } = usePricing()

  return (
    <div className="space-y-2">
      {hardware.map((item: any) => (
        <button
          key={item.code}
          onClick={() => onSelect(item.code)}
          className={cn(
            "w-full p-4 border rounded-lg text-left transition-colors",
            selected === item.code
              ? "border-zinc-900 bg-zinc-50"
              : "border-zinc-200 hover:border-zinc-400"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-zinc-500">{item.supplier}</p>
              {item.category && (
                <p className="text-xs text-zinc-400 mt-1 capitalize">{item.category}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-zinc-900">{formatPrice(item.pricePerUnit)}</p>
              {item.priceVariance && (
                <p className="text-xs text-zinc-500">&plusmn;{item.priceVariance}%</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// DOOR PROFILES SELECTION
// ============================================================================

interface DoorProfilesProps {
  profiles: any[]
  selected: string
  onSelect: (code: string) => void
}

function DoorProfiles({ profiles, selected, onSelect }: DoorProfilesProps) {
  const { formatPrice } = usePricing()

  return (
    <div className="grid grid-cols-2 gap-3">
      {profiles.map((profile: any) => (
        <button
          key={profile.code}
          onClick={() => onSelect(profile.code)}
          className={cn(
            "p-4 border rounded-lg text-center transition-colors",
            selected === profile.code
              ? "border-zinc-900 bg-zinc-50"
              : "border-zinc-200 hover:border-zinc-400"
          )}
        >
          {profile.imageUrl && (
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-full h-20 object-contain mb-2"
            />
          )}
          <p className="font-medium text-sm">{profile.name}</p>
          {profile.description && (
            <p className="text-xs text-zinc-500 mt-1">{profile.description}</p>
          )}
          <p className="text-sm font-semibold text-zinc-900 mt-2">
            {formatPrice(profile.pricePerDoor)} <span className="text-xs font-normal text-zinc-500">per door</span>
          </p>
        </button>
      ))}
    </div>
  )
}
