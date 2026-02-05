'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { imageUriToBase64, resizeImageForVision } from '../ai/claude-vision';
import { estimateDimensions } from '../ai/depth-estimation';
import { getStylesForSpace } from '../ai/render-generation';
import type {
  PipelineStage,
  PipelineProgress,
  PipelineResult,
  SpaceAnalysis,
  Dimensions,
  StyleMatch,
  Render,
} from '@/types/ai-pipeline';

/**
 * Pipeline processing state
 */
interface ProcessPhotoState {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: PipelineProgress | null;
  result: PipelineResult | null;
  error: string | null;
}

/**
 * useProcessPhoto - Pipeline Orchestration Hook
 *
 * Orchestrates the full AI pipeline:
 * 1. Analyzing - Claude Vision space analysis
 * 2. Measuring - Dimension estimation (Basic tier MVP)
 * 3. Styling - Style matching based on aesthetic
 * 4. Creating - Gemini render generation
 *
 * Progress updates in real-time as stages complete.
 * Provides reset for retry flow.
 */
export function useProcessPhoto() {
  const [state, setState] = useState<ProcessPhotoState>({
    status: 'idle',
    progress: null,
    result: null,
    error: null,
  });

  // Convex actions for AI calls
  const analyzeSpaceAction = useAction(api.ai.analyzeSpaceAction);
  const generateRendersAction = useAction(api.ai.generateRendersAction);

  /**
   * Update progress state
   */
  const updateProgress = useCallback(
    (stage: PipelineStage, completedStages: PipelineStage[]) => {
      setState((prev) => ({
        ...prev,
        progress: {
          stage,
          stagesComplete: completedStages,
        },
      }));
    },
    []
  );

  /**
   * Process photo through the full pipeline
   */
  const processPhoto = useCallback(
    async (imageUri: string): Promise<PipelineResult> => {
      // Stage 1: Analyzing
      updateProgress('analyzing', []);

      // Convert image to base64 and resize for Vision API
      const rawBase64 = await imageUriToBase64(imageUri);
      const resizedBase64 = await resizeImageForVision(rawBase64);

      // Call Claude Vision for space analysis
      const analysisResult = await analyzeSpaceAction({ imageBase64: resizedBase64 });

      if (!analysisResult.success) {
        throw new Error(analysisResult.error);
      }

      const analysis: SpaceAnalysis = analysisResult.analysis;

      // Stage 2: Measuring
      updateProgress('measuring', ['analyzing']);

      // Estimate dimensions (Basic tier for MVP)
      const dimensions: Dimensions = estimateDimensions(analysis, 'basic');

      // Stage 3: Styling
      updateProgress('styling', ['analyzing', 'measuring']);

      // Get appropriate styles for the space
      const styles: StyleMatch[] = getStylesForSpace(analysis);

      // Stage 4: Creating
      updateProgress('creating', ['analyzing', 'measuring', 'styling']);

      // Generate renders for each style
      const renderResult = await generateRendersAction({
        imageBase64: resizedBase64,
        styles: styles.map((s) => ({
          id: s.id,
          name: s.name,
          polytec: s.polytec,
        })),
        roomType: analysis.roomType,
        dimensions: {
          width: dimensions.width,
          depth: dimensions.depth,
          height: dimensions.height,
        },
        styleAesthetic: analysis.styleAesthetic,
        lightingConditions: analysis.lightingConditions,
      });

      // Convert render results to Render type with imageUrl
      // Type assertion needed due to Convex action return type inference
      const renders: Render[] = (
        renderResult.renders as Array<{
          id: string;
          styleLabel: string;
          styleId: string;
          imageBase64: string;
        }>
      ).map((r) => ({
        id: r.id,
        styleLabel: r.styleLabel,
        styleId: r.styleId,
        imageUrl: `data:image/jpeg;base64,${r.imageBase64}`,
        imageBase64: r.imageBase64,
      }));

      // Handle partial failure - if no renders succeeded, throw error
      if (renders.length === 0) {
        throw new Error('Failed to generate renders. Please try again.');
      }

      return {
        analysis,
        dimensions,
        styles,
        renders,
      };
    },
    [analyzeSpaceAction, generateRendersAction, updateProgress]
  );

  /**
   * TanStack Query mutation for the pipeline
   */
  const mutation = useMutation({
    mutationFn: processPhoto,
    onMutate: () => {
      setState({
        status: 'processing',
        progress: { stage: 'analyzing', stagesComplete: [] },
        result: null,
        error: null,
      });
    },
    onSuccess: (result) => {
      setState({
        status: 'success',
        progress: {
          stage: 'creating',
          stagesComplete: ['analyzing', 'measuring', 'styling', 'creating'],
        },
        result,
        error: null,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: message,
        progress: prev.progress
          ? { ...prev.progress, error: message }
          : null,
      }));
    },
  });

  /**
   * Reset state for retry flow
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: null,
      result: null,
      error: null,
    });
    mutation.reset();
  }, [mutation]);

  return {
    // State
    status: state.status,
    progress: state.progress,
    result: state.result,
    error: state.error,

    // Actions
    process: mutation.mutate,
    processAsync: mutation.mutateAsync,
    reset,

    // Mutation state helpers
    isIdle: state.status === 'idle',
    isProcessing: state.status === 'processing',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}
