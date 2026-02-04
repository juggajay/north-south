/**
 * Shareable Design View Page
 * Phase 04-08: Undo/Redo & Shareable Links
 *
 * Read-only view of a design with "Save a Copy" option.
 * Deep link format: /design/share/{designId}
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { Canvas3D } from '@/components/configurator/Canvas3D';
import { CabinetModel } from '@/components/models/CabinetModel';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Loader2 } from 'lucide-react';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useEffect } from 'react';

interface SharePageProps {
  params: {
    id: string;
  };
}

export default function ShareDesignPage({ params }: SharePageProps) {
  const router = useRouter();
  const designId = params.id as Id<'designs'>;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const design = useQuery(api.designs.get, { id: designId });
  const duplicateDesign = useMutation(api.designs.duplicate);

  // Load design config into cabinet store for 3D preview
  useEffect(() => {
    if (design && !isLoaded) {
      const cabinetStore = useCabinetStore.getState();

      // Reset store first
      cabinetStore.resetConfig();

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

  // Copy share link to clipboard
  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/design/share/${designId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Duplicate design and navigate to edit page
  const handleSaveCopy = async () => {
    setIsCopying(true);
    try {
      // Duplicate the design (will be associated with current user if authenticated)
      const newDesignId = await duplicateDesign({
        sourceId: designId,
      });

      // Navigate to the new design edit page
      router.push(`/design/${newDesignId}`);
    } catch (error) {
      console.error('Failed to save copy:', error);
      setIsCopying(false);
    }
  };

  // Loading state
  if (!design || !isLoaded || authLoading) {
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
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Share2 className="h-5 w-5 text-zinc-400" />
          <h1 className="text-lg font-semibold">Shared Design</h1>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            Read-only
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveCopy}
            loading={isCopying}
            disabled={isCopying}
          >
            Save a Copy
          </Button>
        </div>
      </div>

      {/* 3D viewport - full screen */}
      <div className="flex-1 bg-zinc-100">
        <Canvas3D>
          <CabinetModel />
        </Canvas3D>
      </div>

      {/* Info footer */}
      <div className="border-t bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            {design.config?.dimensions && (
              <span>
                {design.config.dimensions.width}mm W ×{' '}
                {design.config.dimensions.height}mm H ×{' '}
                {design.config.dimensions.depth}mm D
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Click "Save a Copy" to edit this design
          </p>
        </div>
      </div>
    </div>
  );
}
