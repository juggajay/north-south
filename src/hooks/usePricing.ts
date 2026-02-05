/**
 * usePricing hook
 * Phase 05: Finishes & Pricing
 *
 * Centralized pricing calculation that:
 * - Uses cached product catalog from context (reactive)
 * - Reads configuration from Zustand store
 * - Calculates breakdown by category (all in cents)
 * - Returns formatted currency strings
 */

import { useMemo } from 'react'
import { useCabinetStore } from '@/stores/useCabinetStore'
import { useProductCatalog, Material, Hardware, DoorProfile, Module } from '@/contexts/ProductCatalogContext'

interface PriceBreakdown {
  cabinets: number      // In cents
  material: number      // In cents
  hardware: number      // In cents
  doorProfile: number   // In cents
  addons: number        // In cents
  total: number         // In cents
}

interface FormattedBreakdown {
  cabinets: string
  material: string
  hardware: string
  doorProfile: string
  addons: string
  total: string
  hardwareVariance: string  // ±5% amount
}

export function usePricing() {
  // Use cached product catalog from context
  const { materials, hardware, doorProfiles, modules, isLoading } = useProductCatalog()

  // Subscribe only to config slice (not entire store)
  const config = useCabinetStore((state) => state.config)

  // Memoized formatter instance (en-AU, AUD)
  const formatter = useMemo(
    () => new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    []
  )

  // Calculate breakdown (memoized, recalculates only on dependency change)
  const breakdown = useMemo<PriceBreakdown>(() => {
    // Handle loading state - return zeros
    if (!materials || !hardware || !doorProfiles || !modules) {
      return { cabinets: 0, material: 0, hardware: 0, doorProfile: 0, addons: 0, total: 0 }
    }

    let cabinetsCost = 0
    let materialCost = 0
    let hardwareCost = 0
    let doorProfileCost = 0
    let addonsCost = 0

    // Calculate cabinet/module costs
    // Match module type to modules table by looking for matching category/type
    config.slots.forEach((slot) => {
      if (!slot.module) return

      // Find module by type - simplified matching
      // Module types in store: 'standard', 'sink-base', etc.
      // Modules in DB: 'MOD-BASE-600', 'MOD-BASE-SINK', etc.
      const moduleType = slot.module.type
      let matchedModule = modules.find((m: Module) => {
        const codeLC = m.code.toLowerCase()
        // Map store module types to database module codes
        if (moduleType === 'standard' && codeLC.includes('base-600')) return true
        if (moduleType === 'sink-base' && codeLC.includes('sink')) return true
        if (moduleType === 'drawer-stack' && codeLC.includes('drawer')) return true
        if (moduleType === 'pull-out-pantry' && codeLC.includes('pantry')) return true
        if (moduleType === 'corner-base' && codeLC.includes('corner') && m.category === 'corner') return true
        if (moduleType === 'appliance-tower' && codeLC.includes('tall')) return true
        if (moduleType === 'open-shelving' && codeLC.includes('base-300')) return true
        if (moduleType === 'standard-overhead' && codeLC.includes('oh-600')) return true
        if (moduleType === 'glass-door' && codeLC.includes('oh-450')) return true
        if (moduleType === 'open-shelf' && codeLC.includes('oh-300')) return true
        if (moduleType === 'rangehood-space' && codeLC.includes('rangehood')) return true
        if (moduleType === 'lift-up-door' && codeLC.includes('oh-600')) return true
        return false
      })

      // Fallback: use average module price if no match
      if (!matchedModule) {
        matchedModule = modules.find((m: Module) => m.code === 'MOD-BASE-600')
      }

      if (matchedModule) {
        cabinetsCost += matchedModule.pricePerUnit // Already in cents
      }
    })

    // Calculate material cost (flat price per selection)
    const selectedMaterial = materials.find((m: Material) => m.code === config.finishes.material)
    if (selectedMaterial) {
      materialCost = selectedMaterial.pricePerUnit // Already in cents
    }

    // Calculate hardware cost
    const selectedHardware = hardware.find((h: Hardware) => h.code === config.finishes.hardware)
    if (selectedHardware) {
      hardwareCost = selectedHardware.pricePerUnit // Already in cents
    }

    // Calculate door profile cost (price per door × module count)
    const selectedProfile = doorProfiles.find((p: DoorProfile) => p.code === config.finishes.doorProfile)
    if (selectedProfile) {
      // Count modules that have doors (rough approximation: all modules)
      const doorCount = Array.from(config.slots.values()).filter(s => s.module).length
      doorProfileCost = selectedProfile.pricePerDoor * doorCount
    }

    // Add-ons: sum all addon prices per module (future enhancement)
    // For now, keep at 0 until add-ons UI is wired

    return {
      cabinets: cabinetsCost,
      material: materialCost,
      hardware: hardwareCost,
      doorProfile: doorProfileCost,
      addons: addonsCost,
      total: cabinetsCost + materialCost + hardwareCost + doorProfileCost + addonsCost,
    }
  }, [config, materials, hardware, doorProfiles, modules])

  // Format breakdown for display
  const formatted = useMemo<FormattedBreakdown>(() => {
    const hardwareVarianceAmount = Math.round((breakdown.hardware * 5) / 100)
    return {
      cabinets: formatter.format(breakdown.cabinets / 100),
      material: formatter.format(breakdown.material / 100),
      hardware: formatter.format(breakdown.hardware / 100),
      doorProfile: formatter.format(breakdown.doorProfile / 100),
      addons: formatter.format(breakdown.addons / 100),
      total: formatter.format(breakdown.total / 100),
      hardwareVariance: formatter.format(hardwareVarianceAmount / 100),
    }
  }, [breakdown, formatter])

  // Helper function for ad-hoc formatting
  const formatPrice = (cents: number) => formatter.format(cents / 100)

  return {
    breakdown,      // Raw cents values
    formatted,      // Formatted AUD strings
    formatPrice,    // Helper for ad-hoc formatting
    isLoading,
  }
}
