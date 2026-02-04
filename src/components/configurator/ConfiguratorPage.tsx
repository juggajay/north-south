/**
 * ConfiguratorPage - Full configurator assembly
 * Phase 04-10: Final Integration
 *
 * THE entry point for configurator usage.
 * Per CONTEXT.md: "Login required to use configurator"
 * This auth check enforces that requirement.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

// Stores
import { useCabinetStore } from '@/stores/useCabinetStore'
import { useWizardStore } from '@/stores/useWizardStore'

// Components
import { Canvas3D } from './Canvas3D'
import { CabinetModel } from './CabinetModel'
import { CameraController } from './CameraController'
import { SlotSystem } from './SlotSystem'
import { MaterialApplicator } from './MaterialPreview'
import { DimensionSync } from '../wizard/DimensionSync'
import { WizardShell } from '../wizard/WizardShell'
import { UndoRedoButtons } from '../wizard/UndoRedoButtons'
import { SaveIndicator } from './SaveIndicator'
import { VersionHistory } from './VersionHistory'
import { useAutoSave } from '@/lib/hooks/useAutoSave'

interface ConfiguratorPageProps {
  designId?: Id<"designs">
  aiEstimate?: { width: number; depth: number; height: number }
}

export function ConfiguratorPage({ designId, aiEstimate }: ConfiguratorPageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useConvexAuth()

  // Load design ID from props, or sessionStorage for persistence
  const getInitialDesignId = (): Id<"designs"> | null => {
    if (designId) return designId
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('currentDesignId')
      if (stored) return stored as Id<"designs">
    }
    return null
  }

  const [currentDesignId, setCurrentDesignId] = useState<Id<"designs"> | null>(getInitialDesignId())

  // Get cabinet config for auto-save
  const cabinetConfig = useCabinetStore((state) => state.config)

  // Convert cabinet config to serializable format for auto-save
  const serializableConfig = {
    dimensions: cabinetConfig.dimensions,
    slots: Array.from(cabinetConfig.slots.entries()), // Convert Map to array
    finishes: cabinetConfig.finishes,
  }

  // Auto-save
  const { isSaving, lastSaved } = useAutoSave(currentDesignId, serializableConfig)

  // Create new design if needed (uses existing api.designs.create from Phase 01)
  const createDesign = useMutation(api.designs.create)

  useEffect(() => {
    const initDesign = async () => {
      if (!currentDesignId && isAuthenticated) {
        const id = await createDesign({
          productType: 'kitchen',
          config: {
            dimensions: aiEstimate || { width: 2400, height: 2100, depth: 600 },
            slots: [],
            finishes: { material: '', hardware: '', doorProfile: '' },
          },
        })
        setCurrentDesignId(id)
        // Store design ID in sessionStorage for persistence without dynamic routes
        // (static export doesn't support /design/[id] routes)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currentDesignId', id)
        }
      }
    }

    if (!isLoading && isAuthenticated && !currentDesignId) {
      initDesign()
    }
  }, [isAuthenticated, isLoading, currentDesignId, createDesign, aiEstimate])

  // Load existing design (uses existing api.designs.get from Phase 01)
  const design = useQuery(
    api.designs.get,
    currentDesignId ? { id: currentDesignId } : 'skip'
  )

  useEffect(() => {
    if (design?.config) {
      // Load design config into cabinet store
      const loadedConfig = design.config as any

      useCabinetStore.setState({
        config: {
          dimensions: loadedConfig.dimensions || { width: 2400, height: 2100, depth: 600 },
          slots: Array.isArray(loadedConfig.slots)
            ? new Map(loadedConfig.slots)
            : new Map(),
          finishes: loadedConfig.finishes || { material: '', hardware: '', doorProfile: '' },
        },
      })
    }
  }, [design])

  // Pre-populate with AI estimate
  useEffect(() => {
    if (aiEstimate && !design) {
      useCabinetStore.getState().setDimension('width', aiEstimate.width)
      useCabinetStore.getState().setDimension('height', aiEstimate.height)
      useCabinetStore.getState().setDimension('depth', aiEstimate.depth)
    }
  }, [aiEstimate, design])

  // ============================================
  // AUTH CHECK - This is THE entry point for configurator
  // Per CONTEXT.md: "Login required to use configurator"
  // ============================================
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-xl font-semibold mb-2">Sign in to use the configurator</h1>
        <p className="text-zinc-500 mb-4">Your designs will be saved automatically.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium"
        >
          Sign In
        </button>
      </div>
    )
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    )
  }

  const handleSlotTap = (slotId: string, slotType: 'base' | 'overhead') => {
    // Handled by WizardShell internally
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <UndoRedoButtons />
        <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        {currentDesignId && <VersionHistory designId={currentDesignId} />}
      </div>

      {/* 3D Viewport - upper 60% per CFG-002 */}
      <div className="h-[60vh] relative bg-zinc-50">
        <Canvas3D className="absolute inset-0">
          <DimensionSync />
          <CabinetModel onSlotTap={handleSlotTap} />
          <SlotSystem onSlotTap={handleSlotTap} />
          <CameraController />
          <MaterialApplicator />
        </Canvas3D>
      </div>

      {/* Wizard - lower 40% per CFG-003 */}
      <div className="flex-1 overflow-hidden bg-white">
        <WizardShell
          aiEstimate={aiEstimate}
          onSlotTap={handleSlotTap}
        />
      </div>
    </div>
  )
}
