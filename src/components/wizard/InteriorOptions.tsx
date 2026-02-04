"use client"

import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
} from '@/components/ui/bottom-sheet'
import { useCabinetStore } from '@/stores/useCabinetStore'
import type { ModuleConfig } from '@/types/configurator'
import { SliderControl } from '@/components/ui/slider-control'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Add-ons available for any module
const ADDONS = [
  { id: 'led-strip', name: 'LED Strip', price: 85 },
  { id: 'pull-out-bin', name: 'Pull-out Bin', price: 120 },
  { id: 'drawer-divider', name: 'Drawer Dividers', price: 45 },
]

interface InteriorOptionsProps {
  isOpen: boolean
  slotId: string | null
  onClose: () => void
}

export function InteriorOptions({ isOpen, slotId, onClose }: InteriorOptionsProps) {
  const slots = useCabinetStore((state) => state.config.slots)
  const setModule = useCabinetStore((state) => state.setModule)

  const slot = slotId ? slots.get(slotId) : null
  const module = slot?.module

  if (!module) return null

  const updateInterior = (key: string, value: any) => {
    if (!slotId) return
    setModule(slotId, {
      ...module,
      interiorOptions: {
        ...module.interiorOptions,
        [key]: value,
      },
    })
  }

  const toggleAddon = (addonId: string) => {
    if (!slotId) return
    const currentAddons = module.addons || []
    const newAddons = currentAddons.includes(addonId)
      ? currentAddons.filter((id) => id !== addonId)
      : [...currentAddons, addonId]

    setModule(slotId, { ...module, addons: newAddons })
  }

  // Render options based on module type
  const renderTypeOptions = () => {
    switch (module.type) {
      case 'standard':
      case 'open-shelving':
      case 'standard-overhead':
      case 'glass-door':
      case 'open-shelf':
      case 'lift-up-door':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Shelves</h4>
            <SliderControl
              label="Number of Shelves"
              value={module.interiorOptions?.shelfCount || 1}
              min={1}
              max={4}
              step={1}
              unit=""
              onChange={(v) => updateInterior('shelfCount', v)}
            />
          </div>
        )

      case 'drawer-stack':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Drawers</h4>
            <SliderControl
              label="Number of Drawers"
              value={module.interiorOptions?.drawerCount || 4}
              min={3}
              max={5}
              step={1}
              unit=""
              onChange={(v) => updateInterior('drawerCount', v)}
            />
            <div className="flex items-center justify-between">
              <Label>Drawer Dividers</Label>
              <Switch
                checked={module.interiorOptions?.hasDividers || false}
                onCheckedChange={(v) => updateInterior('hasDividers', v)}
              />
            </div>
          </div>
        )

      case 'pull-out-pantry':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Pull-out Baskets</h4>
            <SliderControl
              label="Number of Baskets"
              value={module.interiorOptions?.basketCount || 5}
              min={3}
              max={7}
              step={1}
              unit=""
              onChange={(v) => updateInterior('basketCount', v)}
            />
          </div>
        )

      case 'sink-base':
      case 'corner-base':
      case 'appliance-tower':
      case 'rangehood-space':
      default:
        return (
          <p className="text-sm text-zinc-500">
            No additional options for this module type.
          </p>
        )
    }
  }

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[0.5, 0.85]}
      defaultSnapPoint={0}
    >
      <BottomSheetHeader>
        <BottomSheetTitle>Interior Options</BottomSheetTitle>
        <BottomSheetDescription className="capitalize">
          {module.type.replace(/-/g, ' ')}
        </BottomSheetDescription>
      </BottomSheetHeader>

      <div className="space-y-6 pb-8">
        {renderTypeOptions()}

        {/* Add-ons section */}
        <div className="space-y-3">
          <h4 className="font-medium">Add-ons</h4>
          {ADDONS.map((addon) => (
            <div
              key={addon.id}
              className="flex items-center justify-between p-3 border rounded-lg border-zinc-200 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium text-sm">{addon.name}</p>
                <p className="text-xs text-zinc-500">+${addon.price}</p>
              </div>
              <Switch
                checked={module.addons?.includes(addon.id) || false}
                onCheckedChange={() => toggleAddon(addon.id)}
              />
            </div>
          ))}
        </div>

        <Button onClick={onClose} className="w-full" size="lg">
          Done
        </Button>
      </div>
    </BottomSheet>
  )
}
