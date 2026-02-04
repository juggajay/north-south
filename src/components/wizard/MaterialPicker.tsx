/**
 * MaterialPicker component
 * Phase 04-07: Finish Selection & Review
 * Phase 05-03: Pricing integration
 *
 * Features:
 * - Tabbed interface for material/hardware/door profile
 * - Swatch grid for materials with category grouping
 * - Real-time store updates with visual selection
 * - Price display on all options (materials, hardware, door profiles)
 */

import { useState } from 'react'
import { useCabinetStore } from '@/stores/useCabinetStore'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { usePricing } from '@/hooks/usePricing'

type FinishCategory = 'material' | 'hardware' | 'doorProfile'

const CATEGORIES: { id: FinishCategory; label: string }[] = [
  { id: 'material', label: 'Material' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'doorProfile', label: 'Door Profile' },
]

export function MaterialPicker() {
  const [activeCategory, setActiveCategory] = useState<FinishCategory>('material')
  const finishes = useCabinetStore((state) => state.config.finishes)
  const setFinish = useCabinetStore((state) => state.setFinish)

  // Fetch materials from Convex
  const materials = useQuery(api.products.materials.list) || []
  const hardware = useQuery(api.products.hardware.list) || []
  const doorProfiles = useQuery(api.doorProfiles.list) || []

  const handleMaterialSelect = (code: string) => {
    setFinish('material', code)
  }

  const handleHardwareSelect = (code: string) => {
    setFinish('hardware', code)
  }

  const handleProfileSelect = (code: string) => {
    setFinish('doorProfile', code)
  }

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex border-b">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeCategory === cat.id
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content area with swipe animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          {activeCategory === 'material' && (
            <MaterialSwatches
              materials={materials}
              selected={finishes.material}
              onSelect={handleMaterialSelect}
            />
          )}

          {activeCategory === 'hardware' && (
            <HardwareOptions
              hardware={hardware}
              selected={finishes.hardware}
              onSelect={handleHardwareSelect}
            />
          )}

          {activeCategory === 'doorProfile' && (
            <DoorProfiles
              profiles={doorProfiles}
              selected={finishes.doorProfile}
              onSelect={handleProfileSelect}
            />
          )}
        </motion.div>
      </AnimatePresence>
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

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p className="text-sm">No materials available</p>
        <p className="text-xs mt-1">Seed data may not be loaded</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-zinc-700 mb-3 capitalize">
            {category.replace('woodmatt', 'Wood Matt')}
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {grouped[category].map((mat: any) => (
              <div key={mat.code} className="flex flex-col">
                <button
                  onClick={() => onSelect(mat.code)}
                  className={cn(
                    "aspect-square rounded-lg border-2 overflow-hidden transition-all",
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

  if (hardware.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p className="text-sm">No hardware options available</p>
        <p className="text-xs mt-1">Seed data may not be loaded</p>
      </div>
    )
  }

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
                <p className="text-xs text-zinc-500">±{item.priceVariance}%</p>
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

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p className="text-sm">No door profiles available</p>
        <p className="text-xs mt-1">Seed data may not be loaded</p>
      </div>
    )
  }

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
