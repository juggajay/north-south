/**
 * ConfiguratorPage - Full configurator assembly
 *
 * THE entry point for configurator usage.
 * Per CONTEXT.md: "Login required to use configurator"
 */

'use client'

import { useState, useEffect, useRef } from 'react'
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
import { VersionHistory } from './VersionHistory'
import { PreviewOverlay } from './PreviewOverlay'
import { SubmissionFlow } from '../submission/SubmissionFlow'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { useFullscreen } from '@/contexts/FullscreenContext'

// Get selectSlot action from wizard store
const selectSlot = useWizardStore.getState().selectSlot;

interface ConfiguratorPageProps {
  designId?: Id<"designs">
  aiEstimate?: { width: number; depth: number; height: number }
}

export function ConfiguratorPage({ designId, aiEstimate }: ConfiguratorPageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useConvexAuth()

  // Canvas container ref for PreviewOverlay
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSubmission, setShowSubmission] = useState(false)

  // Fullscreen management
  const { enterFullscreen, exitFullscreen } = useFullscreen()

  useEffect(() => {
    enterFullscreen()
    return () => exitFullscreen()
  }, [enterFullscreen, exitFullscreen])

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
    slots: Array.from(cabinetConfig.slots.entries()),
    finishes: cabinetConfig.finishes,
  }

  // Auto-save
  const { isSaving, lastSaved } = useAutoSave(currentDesignId, serializableConfig)

  // Create new design if needed
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
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currentDesignId', id)
        }
      }
    }

    if (!isLoading && isAuthenticated && !currentDesignId) {
      initDesign()
    }
  }, [isAuthenticated, isLoading, currentDesignId, createDesign, aiEstimate])

  // Load existing design
  const design = useQuery(
    api.designs.get,
    currentDesignId ? { id: currentDesignId } : 'skip'
  )

  useEffect(() => {
    if (design?.config) {
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

  // Auth check
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    )
  }

  const handleSlotTap = (slotId: string, slotType: 'base' | 'overhead') => {
    selectSlot(slotId, slotType);
  }

  const handleSubmit = () => {
    setShowSubmission(true)
  }

  // Submission flow replaces wizard when active
  if (showSubmission) {
    const submitDesignId = currentDesignId || (typeof window !== 'undefined'
      ? sessionStorage.getItem('currentDesignId') as Id<"designs"> | null
      : null)

    if (!submitDesignId) {
      setShowSubmission(false)
      return null
    }

    return (
      <SubmissionFlow
        designId={submitDesignId}
        onCancel={() => setShowSubmission(false)}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-100">
      {/* Canvas3D - hidden off-screen, shown via PreviewOverlay */}
      <div
        ref={canvasContainerRef}
        style={{ position: 'fixed', left: '-9999px', visibility: 'hidden' }}
      >
        <Canvas3D className="w-full h-full">
          <DimensionSync />
          <CabinetModel onSlotTap={handleSlotTap} />
          <SlotSystem onSlotTap={handleSlotTap} />
          <CameraController />
          <MaterialApplicator />
        </Canvas3D>
      </div>

      {/* Wizard - full screen */}
      <WizardShell
        aiEstimate={aiEstimate}
        onSlotTap={handleSlotTap}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onOpenHistory={() => setShowHistory(true)}
        onPreview={() => setShowPreview(true)}
        onSubmit={handleSubmit}
      />

      {/* Preview overlay */}
      <PreviewOverlay
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        canvasContainerRef={canvasContainerRef}
      />

      {/* Version history */}
      {currentDesignId && (
        <VersionHistory
          designId={currentDesignId}
          open={showHistory}
          onOpenChange={setShowHistory}
        />
      )}
    </div>
  )
}
