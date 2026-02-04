/**
 * Render Generation Client
 *
 * Client-side helpers for AI-powered render generation.
 *
 * MVP Implementation (AI-003):
 * Style selection is aesthetic-based - all users with same detected aesthetic
 * get the same 3 style options. This satisfies "Matches space to 3 appropriate
 * design styles" since styles ARE appropriate for the detected aesthetic.
 *
 * Future enhancement: Dynamic style selection based on specific space features
 * (e.g., existing wood tones, wall colors, natural light levels)
 */

import type { SpaceAnalysis, StyleMatch, Render, Dimensions } from '@/types/ai-pipeline';

/**
 * Polytec finish styles that work for joinery
 * Maps aesthetic to appropriate Polytec color codes
 *
 * Each aesthetic maps to 3 curated style options featuring
 * complementary Polytec finishes commonly used in Australian
 * custom joinery.
 */
const POLYTEC_STYLES: Record<string, StyleMatch[]> = {
  modern: [
    {
      id: 'modern-white',
      name: 'Modern White',
      description: 'Clean, minimalist white cabinetry',
      polytec: ['Polar White', 'Classic White'],
    },
    {
      id: 'modern-grey',
      name: 'Concrete Grey',
      description: 'Industrial-inspired grey finishes',
      polytec: ['Shannon Oak', 'Stone Grey'],
    },
    {
      id: 'modern-charcoal',
      name: 'Modern Charcoal',
      description: 'Bold, dramatic dark tones',
      polytec: ['Char Oak', 'Black Wenge'],
    },
  ],
  traditional: [
    {
      id: 'trad-oak',
      name: 'Classic Oak',
      description: 'Warm, natural oak timber look',
      polytec: ['Natural Oak', 'Honey Elm'],
    },
    {
      id: 'trad-walnut',
      name: 'Warm Walnut',
      description: 'Rich, sophisticated walnut tones',
      polytec: ['Walnut Nuance', 'Opera Walnut'],
    },
    {
      id: 'trad-cream',
      name: 'Cream Shaker',
      description: 'Classic shaker style in cream',
      polytec: ['Vanilla Shake', 'Classic White'],
    },
  ],
  industrial: [
    {
      id: 'ind-dark',
      name: 'Industrial Dark',
      description: 'Raw, edgy dark finishes',
      polytec: ['Black Wenge', 'Char Oak'],
    },
    {
      id: 'ind-concrete',
      name: 'Raw Concrete',
      description: 'Textured concrete-look surfaces',
      polytec: ['Stone Grey', 'Concrete'],
    },
    {
      id: 'ind-metal',
      name: 'Brushed Metal',
      description: 'Metallic accents and finishes',
      polytec: ['Aluminium', 'Titanium'],
    },
  ],
  coastal: [
    {
      id: 'coast-white',
      name: 'Coastal White',
      description: 'Light, airy beach house white',
      polytec: ['Polar White', 'Classic White'],
    },
    {
      id: 'coast-timber',
      name: 'Beach Timber',
      description: 'Weathered, natural timber look',
      polytec: ['Bleached Walnut', 'Natural Oak'],
    },
    {
      id: 'coast-blue',
      name: 'Ocean Blue',
      description: 'Deep blue coastal accents',
      polytec: ['Navy Blue', 'Riviera'],
    },
  ],
  scandinavian: [
    {
      id: 'scandi-light',
      name: 'Nordic Light',
      description: 'Bright, minimalist Scandi white',
      polytec: ['Polar White', 'Birch Ply'],
    },
    {
      id: 'scandi-oak',
      name: 'Scandi Oak',
      description: 'Light oak with clean lines',
      polytec: ['Natural Oak', 'Prime Oak'],
    },
    {
      id: 'scandi-grey',
      name: 'Stockholm Grey',
      description: 'Soft, muted grey tones',
      polytec: ['Shannon Oak', 'Pale Grey'],
    },
  ],
};

/**
 * Get appropriate styles for a space based on its aesthetic
 * Returns 3 style options matching the detected style
 *
 * MVP: Returns fixed 3 styles per aesthetic (aesthetic-based matching)
 * Future: Could incorporate space features (flooring, wall color) for smarter matching
 */
export function getStylesForSpace(analysis: SpaceAnalysis): StyleMatch[] {
  const aesthetic = analysis.styleAesthetic;
  const styles = POLYTEC_STYLES[aesthetic] || POLYTEC_STYLES['modern'];
  return styles.slice(0, 3);
}

/**
 * Build render prompt for Gemini image generation
 *
 * Creates a detailed prompt that:
 * - Describes the desired joinery style and materials
 * - References the original space context
 * - Specifies dimensions for accurate scaling
 * - Maintains the detected aesthetic
 */
export function buildRenderPrompt(
  style: StyleMatch,
  analysis: SpaceAnalysis,
  dimensions: Dimensions
): string {
  return `Generate a photorealistic interior render showing custom joinery/cabinetry in this ${analysis.roomType}.

Style: ${style.name}
Materials: ${style.polytec.join(', ')} (Polytec finishes)
Space dimensions: ${dimensions.width}mm wide x ${dimensions.depth}mm deep x ${dimensions.height}mm high

Requirements:
- Keep the original room context (walls, floor, ceiling, windows visible)
- Add modern ${style.name.toLowerCase()} style cabinetry/joinery that fits the space
- Use ${style.polytec[0]} as the primary material finish
- Realistic lighting matching ${analysis.lightingConditions} conditions
- Maintain the ${analysis.styleAesthetic} aesthetic of the space
- Show professional custom joinery, not flat-pack furniture

Output a single photorealistic image showing the transformed space.`;
}

/**
 * Parse render result from Gemini API response
 *
 * Handles different response formats from Gemini:
 * - Inline image data (base64)
 * - External image URL
 * - Error responses
 */
export function parseRenderResult(
  response: {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: {
            data: string;
            mimeType?: string;
          };
        }>;
      };
    }>;
    image?: string;
  },
  style: StyleMatch,
  index: number
): Render {
  // Handle different response formats from Gemini
  let imageData: string;

  if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
    imageData = response.candidates[0].content.parts[0].inlineData.data;
  } else if (response.image) {
    imageData = response.image;
  } else {
    throw new Error('No image data in Gemini response');
  }

  return {
    id: `render-${style.id}-${index}`,
    styleLabel: style.name,
    styleId: style.id,
    imageUrl: `data:image/jpeg;base64,${imageData}`,
    imageBase64: imageData,
  };
}
