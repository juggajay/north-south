/**
 * Dimension Estimation Module
 *
 * Estimates space dimensions from Claude Vision analysis.
 *
 * MVP Implementation (AI-002):
 * Uses Claude Vision's built-in spatial reasoning (Basic tier, +/-15% accuracy).
 * The tier system is designed to accommodate future Depth Anything V2 integration.
 *
 * Tier Accuracy Mapping:
 * - Basic: Single photo, +/-15% accuracy (Claude Vision estimates)
 * - Standard: Photo + reference object, +/-10% (future: Depth Anything V2)
 * - Enhanced: Multiple photos, +/-5% (future: multi-photo fusion)
 * - Precision: LiDAR scan, +/-2% (future: iPhone Pro LiDAR)
 */

import type { SpaceAnalysis, Dimensions, DimensionConfidence } from '@/types/ai-pipeline';

/**
 * Get human-readable label for dimension confidence tier
 * Per CONTEXT.md: "High confidence" vs "Verify dimensions"
 */
export function getDimensionTierLabel(confidence: DimensionConfidence): string {
  switch (confidence) {
    case 'precision':
      return 'High confidence';
    case 'enhanced':
      return 'High confidence';
    case 'standard':
      return 'Verify dimensions';
    case 'basic':
    default:
      return 'Verify dimensions';
  }
}

/**
 * Calculate confidence percentage from tier
 *
 * Tier accuracy mapping (from REQUIREMENTS.md):
 * - Basic: Single photo, +/-15% accuracy (Claude Vision estimates)
 * - Standard: Photo + reference object, +/-10% (future: Depth Anything V2)
 * - Enhanced: Multiple photos, +/-5% (future: multi-photo fusion)
 * - Precision: LiDAR scan, +/-2% (future: iPhone Pro LiDAR)
 */
function getConfidencePercent(tier: DimensionConfidence): number {
  switch (tier) {
    case 'precision':
      return 98; // +/-2% (LiDAR)
    case 'enhanced':
      return 95; // +/-5% (multi-photo)
    case 'standard':
      return 90; // +/-10% (photo + reference)
    case 'basic':
    default:
      return 85; // +/-15% (single photo)
  }
}

/**
 * Apply reasonable constraints to dimension estimates
 * Catches obvious errors in AI estimation
 *
 * Constraints based on typical Australian residential/commercial spaces:
 * - Width: 500mm (small alcove) to 6000mm (large wall unit)
 * - Depth: 300mm (shallow shelf) to 2000mm (walk-in pantry)
 * - Height: 2100mm (low ceiling) to 3500mm (high ceiling)
 */
function constrainDimensions(raw: {
  width: number;
  depth: number;
  height: number;
}): { width: number; depth: number; height: number } {
  return {
    // Min 500mm, max 6000mm for cabinet spaces
    width: Math.max(500, Math.min(6000, raw.width)),
    // Min 300mm, max 2000mm for depth
    depth: Math.max(300, Math.min(2000, raw.depth)),
    // Australian ceiling heights typically 2400-3000mm
    height: Math.max(2100, Math.min(3500, raw.height)),
  };
}

/**
 * Estimate dimensions from Claude Vision space analysis
 * MVP uses Basic tier (single photo, +/-15% accuracy)
 *
 * Future tiers (designed for Depth Anything V2 integration):
 * - Standard: Add reference object detection (credit card)
 * - Enhanced: Multiple photos combined
 * - Precision: LiDAR data (Phase 04+)
 */
export function estimateDimensions(
  analysis: SpaceAnalysis,
  tier: DimensionConfidence = 'basic'
): Dimensions {
  // Use Claude's estimates, applying sanity constraints
  const constrained = constrainDimensions({
    width: analysis.estimatedWidth,
    depth: analysis.estimatedDepth,
    height: analysis.estimatedHeight,
  });

  const confidencePercent = getConfidencePercent(tier);
  const tierLabel = getDimensionTierLabel(tier);

  return {
    width: constrained.width,
    depth: constrained.depth,
    height: constrained.height,
    confidence: tier,
    confidencePercent,
    tierLabel,
  };
}

/**
 * Format dimensions for display
 * Returns string like "2400 x 600 x 2400mm"
 */
export function formatDimensions(dims: Dimensions): string {
  return `${dims.width} x ${dims.depth} x ${dims.height}mm`;
}
