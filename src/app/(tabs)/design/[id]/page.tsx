/**
 * Design Edit Page with Auto-save
 * Phase 04-08: Undo/Redo & Shareable Links
 *
 * Loads a saved design from Convex and renders the 3D configurator
 * with auto-save on every change.
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { SaveIndicator } from '@/components/configurator/SaveIndicator';
import { UndoRedoButtons } from '@/components/wizard/UndoRedoButtons';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Canvas3D } from '@/components/configurator/Canvas3D';
import { CabinetModel } from '@/components/models/CabinetModel';
import { DimensionSync } from '@/components/wizard/DimensionSync';
import { Loader2 } from 'lucide-react';

interface DesignPageProps {
  params: {
    id: string;
  };
}

export default function DesignPage({ params }: DesignPageProps) {
  const designId = params.id as Id<'designs'>;
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch design from Convex
  const design = useQuery(api.designs.get, { id: designId });

  // Load design config into cabinet store once
  useEffect(() => {
    if (design && !isLoaded) {
      const cabinetStore = useCabinetStore.getState();

      // Load dimensions
      if (design.config?.dimensions) {
        Object.entries(design.config.dimensions).forEach(([key, value]) => {
          cabinetStore.setDimension(
            key as keyof typeof design.config.dimensions,
            value as number
          );
        });
      }

      // Load slots
      if (design.config?.slots) {
        // Handle both Map and array formats
        const slotsData = Array.isArray(design.config.slots)
          ? design.config.slots
          : Array.from(Object.entries(design.config.slots));

        slotsData.forEach(([slotId, slotConfig]: [string, any]) => {
          if (slotConfig.module) {
            cabinetStore.setModule(slotId, slotConfig.module);
          }
        });
      }

      // Load finishes
      if (design.config?.finishes) {
        Object.entries(design.config.finishes).forEach(([key, value]) => {
          cabinetStore.setFinish(
            key as keyof typeof design.config.finishes,
            value as string
          );
        });
      }

      setIsLoaded(true);
    }
  }, [design, isLoaded]);

  // Subscribe to cabinet store changes
  const cabinetConfig = useCabinetStore((state) => state.config);

  // Auto-save on every change
  const autoSave = useAutoSave(
    designId,
    {
      dimensions: cabinetConfig.dimensions,
      slots: Array.from(cabinetConfig.slots.entries()),
      finishes: cabinetConfig.finishes,
    },
    {
      debounceMs: 1000,
      onSaveError: (error) => {
        console.error('Auto-save failed:', error);
      },
    }
  );

  // Loading state
  if (!design || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header with save indicator and undo/redo */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Edit Design</h1>
          <SaveIndicator isSaving={autoSave.isSaving} lastSaved={autoSave.lastSaved} />
        </div>
        <UndoRedoButtons />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 3D viewport */}
        <div className="flex-1 bg-zinc-100">
          <Canvas3D>
            <CabinetModel />
            <DimensionSync />
          </Canvas3D>
        </div>

        {/* Wizard sidebar */}
        <div className="w-full max-w-md border-l bg-white md:w-96">
          <WizardShell />
        </div>
      </div>
    </div>
  );
}
