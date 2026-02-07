'use client';

import { useState, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { imageUriToBase64, resizeImageForVision } from '../ai/claude-vision';
import { buildNarrativePrompt } from '../ai/render-prompt-builder';
import { generateLayout, type LayoutIntent, type WallSegment } from '../engine/layout-engine';
import { calculatePricing } from '../engine/pricing-engine';
import type { SpaceAnalysis } from '@/types/ai-pipeline';
import type { StylePreset } from '@/lib/constants/style-presets';
import type { DesignResult, CabinetSummary, Wall } from '@/stores/useDesignFlowStore';
import type { Priority } from '@/lib/engine/layout-engine';

/**
 * Parameters for the render pipeline.
 * Collected from the design flow store.
 */
export interface GenerateRenderParams {
  photoUrl: string;
  stylePreset: StylePreset;
  spaceAnalysis: SpaceAnalysis;
  walls: Wall[];
  purpose: string;
  styleSummary: string;
  priorities: string[];
  specificRequests: string[];
  freeText: string;
}

/**
 * useGenerateRenders — Render pipeline hook
 *
 * Replaces useProcessPhoto for the processing screen.
 * Accepts full user context (not just photo) and generates a single render
 * using the resolved style preset + narrative prompt.
 *
 * Also runs layout engine + pricing engine to build the full DesignResult.
 */
export function useGenerateRenders() {
  const generateRendersAction = useAction(api.ai.generateRendersAction);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designResult, setDesignResult] = useState<DesignResult | null>(null);
  // Track pipeline stage for progress UI
  const [stage, setStage] = useState<'styling' | 'creating' | 'done'>('styling');

  const generate = useCallback(
    async (params: GenerateRenderParams): Promise<DesignResult> => {
      const {
        photoUrl,
        stylePreset,
        spaceAnalysis,
        walls,
        purpose,
        styleSummary,
        priorities,
        specificRequests,
        freeText,
      } = params;

      setIsGenerating(true);
      setError(null);
      setStage('styling');

      try {
        // Convert image
        const rawBase64 = await imageUriToBase64(photoUrl);
        const resizedBase64 = await resizeImageForVision(rawBase64);

        // Build wall dimensions
        const wallDimensions = walls.map((w) => ({
          label: w.label,
          lengthMm: w.length * 1000,
        }));

        // Build narrative prompt
        const prompt = buildNarrativePrompt({
          styleName: stylePreset.name,
          styleDescription: stylePreset.description,
          polytecPrimary: stylePreset.finishes.material,
          doorProfile: stylePreset.finishes.doorProfile,
          hardware: stylePreset.finishes.hardware,
          roomType: spaceAnalysis.roomType,
          dimensions: {
            width: spaceAnalysis.estimatedWidth,
            depth: spaceAnalysis.estimatedDepth,
            height: spaceAnalysis.estimatedHeight,
          },
          lightingConditions: spaceAnalysis.lightingConditions,
          flooring: spaceAnalysis.flooring,
          wallFinishes: spaceAnalysis.wallFinishes,
          features: spaceAnalysis.features,
          purpose,
          styleSummary,
          priorities,
          specificRequests,
          freeText: freeText || undefined,
          wallDimensions,
        });

        console.log('[render-pipeline] Narrative prompt:', prompt);

        setStage('creating');

        // Call Gemini via Convex action
        const result = await generateRendersAction({
          imageBase64: resizedBase64,
          styleName: stylePreset.name,
          styleDescription: stylePreset.description,
          polytecPrimary: stylePreset.finishes.material,
          doorProfile: stylePreset.finishes.doorProfile,
          hardware: stylePreset.finishes.hardware,
          roomType: spaceAnalysis.roomType,
          dimensions: {
            width: spaceAnalysis.estimatedWidth,
            depth: spaceAnalysis.estimatedDepth,
            height: spaceAnalysis.estimatedHeight,
          },
          lightingConditions: spaceAnalysis.lightingConditions,
          flooring: spaceAnalysis.flooring,
          wallFinishes: spaceAnalysis.wallFinishes,
          features: spaceAnalysis.features,
          purpose,
          styleSummary,
          priorities,
          specificRequests,
          freeText: freeText || undefined,
          wallDimensions,
          prompt,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to generate render');
        }

        // Extract render image
        const renderData = (result as { success: true; render: { id: string; imageBase64: string } }).render;
        const renderUrl = `data:image/jpeg;base64,${renderData.imageBase64}`;

        // Build layout + pricing
        const wallSegments: WallSegment[] =
          walls.length > 0
            ? walls.map((w) => ({
                label: w.label,
                lengthMm: w.length * 1000,
                selected: true,
              }))
            : [{ label: 'Main wall', lengthMm: 3000, selected: true }];

        const validPriorities: Priority[] = (priorities || []).filter(
          (p): p is Priority =>
            ['storage', 'clean-look', 'easy-clean', 'value', 'wow-factor'].includes(p)
        );

        const intent: LayoutIntent = {
          walls: wallSegments,
          purpose: (purpose || 'kitchen') as 'kitchen' | 'laundry' | 'pantry' | 'other',
          budgetTier: stylePreset.budgetTier,
          priorities: validPriorities,
          specificRequests: specificRequests || [],
          finishes: {
            material: stylePreset.finishes.material,
            hardware: stylePreset.finishes.hardware,
            doorProfile: stylePreset.finishes.doorProfile,
          },
        };

        const layoutResult = generateLayout(intent);

        const pricingResult = calculatePricing({
          config: layoutResult.config,
          budgetTier: stylePreset.budgetTier,
        });

        // Build cabinets list from base modules
        const cabinets: CabinetSummary[] = layoutResult.wallAssignments.flatMap(
          (wa) =>
            wa.modules
              .filter((m) => m.position === 'base')
              .map((m, i) => ({
                position: i + 1,
                type: m.type,
                label: m.label,
                width: m.widthMm,
              }))
        );

        const wallCabinets = layoutResult.wallAssignments.reduce(
          (sum, wa) =>
            sum + wa.modules.filter((m) => m.position === 'overhead').length,
          0
        );

        // Map hardware code to display name
        const hardwareMap: Record<string, string> = {
          'HW-BRASS-BAR': 'Brass bar handles',
          'HW-BLACK-BAR': 'Matte black bar handles',
          'HW-BLACK-KNOB': 'Matte black knobs',
          'HW-BRASS-KNOB': 'Brass knobs',
          'HW-WHITE-BAR': 'White bar handles',
        };

        const result_: DesignResult = {
          renders: [renderUrl],
          description: layoutResult.description,
          priceRange: [
            Math.round(pricingResult.total.lowCents / 100),
            Math.round(pricingResult.total.highCents / 100),
          ],
          cabinets,
          doorStyle: stylePreset.name,
          handleStyle: hardwareMap[stylePreset.finishes.hardware] || stylePreset.finishes.hardware,
          wallCabinets,
        };

        setDesignResult(result_);
        setStage('done');
        return result_;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [generateRendersAction]
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setDesignResult(null);
    setStage('styling');
  }, []);

  return {
    generate,
    reset,
    isGenerating,
    error,
    designResult,
    stage,
  };
}
