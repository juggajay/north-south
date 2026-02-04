/**
 * AI Pipeline Types
 *
 * Comprehensive TypeScript types for the AI pipeline stages:
 * Analyzing -> Measuring -> Styling -> Creating
 */

// Pipeline stages matching CONTEXT.md decision
export type PipelineStage = 'analyzing' | 'measuring' | 'styling' | 'creating';

// Dimension confidence tiers (Basic tier for MVP single photo)
export type DimensionConfidence = 'basic' | 'standard' | 'enhanced' | 'precision';

// Space analysis from Claude Vision
export interface SpaceAnalysis {
  roomType: string;
  estimatedWidth: number; // mm
  estimatedDepth: number; // mm
  estimatedHeight: number; // mm
  features: string[]; // windows, doors, alcoves
  styleAesthetic:
    | 'modern'
    | 'traditional'
    | 'industrial'
    | 'coastal'
    | 'scandinavian';
  lightingConditions: 'natural' | 'artificial' | 'mixed';
  flooring: string;
  wallFinishes: string;
}

// Dimension estimation result
export interface Dimensions {
  width: number; // mm
  depth: number; // mm
  height: number; // mm
  confidence: DimensionConfidence;
  confidencePercent: number; // 0-100
  tierLabel: string; // "High confidence" or "Verify dimensions"
}

// Style classification for render generation
export interface StyleMatch {
  id: string;
  name: string;
  description?: string;
  polytec: string[]; // Polytec finish codes
}

// Generated render
export interface Render {
  id: string;
  styleLabel: string;
  styleId: string;
  imageUrl: string;
  imageBase64?: string;
}

// Pipeline progress tracking
export interface PipelineProgress {
  stage: PipelineStage;
  stagesComplete: PipelineStage[];
  error?: string;
}

// Full pipeline result
export interface PipelineResult {
  analysis: SpaceAnalysis;
  dimensions: Dimensions;
  styles: StyleMatch[];
  renders: Render[];
}

// Error types for conditional retry
export interface PipelineError {
  stage: PipelineStage;
  message: string;
  isRetryable: boolean;
  statusCode?: number;
}
