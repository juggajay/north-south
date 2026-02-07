'use client';

import { useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { imageUriToBase64, resizeImageForVision } from '../ai/claude-vision';
import { useDesignFlowStore } from '@/stores/useDesignFlowStore';

/**
 * useAnalyzePhoto — standalone Claude Vision analysis hook
 *
 * Decoupled from the render pipeline. Runs analysis after photo capture
 * so AI-estimated dimensions are available for the wall screen.
 *
 * All setters target Zustand (global store), NOT React component state,
 * so they are safe to call after the calling component unmounts.
 */
export function useAnalyzePhoto() {
  // @ts-ignore - Convex type inference can be excessively deep
  const analyzeSpaceAction = useAction(api.ai.analyzeSpaceAction);
  const setSpaceAnalysis = useDesignFlowStore((s) => s.setSpaceAnalysis);
  const setIsAnalyzing = useDesignFlowStore((s) => s.setIsAnalyzing);
  const setAnalysisError = useDesignFlowStore((s) => s.setAnalysisError);

  const analyze = useCallback(
    async (photoUrl: string) => {
      try {
        setIsAnalyzing(true);
        setAnalysisError(null);

        // Convert image to base64 and resize for Vision API
        const rawBase64 = await imageUriToBase64(photoUrl);
        const resizedBase64 = await resizeImageForVision(rawBase64);

        // Call Claude Vision via Convex action
        const result = await analyzeSpaceAction({ imageBase64: resizedBase64 });

        if (result.success) {
          setSpaceAnalysis(result.analysis);
        } else {
          setAnalysisError(result.error);
        }
      } catch (err) {
        setAnalysisError(
          err instanceof Error ? err.message : 'Failed to analyze photo'
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [analyzeSpaceAction, setSpaceAnalysis, setIsAnalyzing, setAnalysisError]
  );

  return { analyze };
}
