'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { SaveIndicator } from '@/components/configurator/SaveIndicator';
import { UndoRedoButtons } from '@/components/wizard/UndoRedoButtons';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Canvas3D } from '@/components/configurator/Canvas3D';
import { CabinetModel } from '@/components/configurator/CabinetModel';
import { DimensionSync } from '@/components/wizard/DimensionSync';
import { Loader2 } from 'lucide-react';

interface DesignEditClientProps {
  designId: string;
}

export default function DesignEditClient({ designId }: DesignEditClientProps) {
  const id = designId as Id<'designs'>;
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch design from Convex
  const design = useQuery(api.designs.get, { id });

  // Load design config into cabinet store once
  useEffect(() => {
    if (design && !isLoaded) {
      const cabinetStore = useCabinetStore.getState();

      // Load dimensions
      if (design.config?.dimensions) {
        const dims = design.config.dimensions as any;
        if (dims.width) cabinetStore.setDimension('width', dims.width);
        if (dims.height) cabinetStore.setDimension('height', dims.height);
        if (dims.depth) cabinetStore.setDimension('depth', dims.depth);
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
        const finishes = design.config.finishes as any;
        if (finishes.material) cabinetStore.setFinish('material', finishes.material);
        if (finishes.hardware) cabinetStore.setFinish('hardware', finishes.hardware);
        if (finishes.doorProfile) cabinetStore.setFinish('doorProfile', finishes.doorProfile);
      }

      setIsLoaded(true);
    }
  }, [design, isLoaded]);

  // Subscribe to cabinet store changes
  const cabinetConfig = useCabinetStore((state) => state.config);

  // Auto-save on every change
  const autoSave = useAutoSave(
    id,
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
