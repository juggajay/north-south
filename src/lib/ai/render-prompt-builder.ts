/**
 * Render Prompt Builder
 *
 * Builds narrative prompts for Nano Banana Pro image generation.
 * Pure function — no API calls, can be unit tested.
 *
 * Nano Banana Pro best practices:
 * - Descriptive narratives (not bullet lists)
 * - Strong MUST/NEVER constraints
 * - Image-first in parts array (handled in convex/ai.ts)
 * - systemInstruction for persistent rules (handled in convex/ai.ts)
 */

export interface NarrativePromptParams {
  // Style
  styleName: string;
  styleDescription: string;
  polytecPrimary: string;
  polytecSecondary?: string;
  doorProfile: string;
  hardware: string;
  // Space
  roomType: string;
  dimensions: { width: number; depth: number; height: number };
  lightingConditions: string;
  flooring: string;
  wallFinishes: string;
  features: string[];
  // User context
  purpose: string;
  styleSummary: string;
  priorities: string[];
  specificRequests: string[];
  freeText?: string;
  // Wall dimensions
  wallDimensions: { label: string; lengthMm: number }[];
}

/**
 * Build a narrative prompt for Gemini image generation.
 *
 * Structure follows Nano Banana Pro best practices:
 * 1. Opening sentence (intent + mood)
 * 2. The space (physical context)
 * 3. The design (materials + hardware)
 * 4. Homeowner preferences (priorities + requests)
 * 5. Critical constraints (MUST/NEVER)
 */
export function buildNarrativePrompt(params: NarrativePromptParams): string {
  const {
    styleName,
    styleDescription,
    polytecPrimary,
    polytecSecondary,
    doorProfile,
    hardware,
    roomType,
    dimensions,
    lightingConditions,
    flooring,
    wallFinishes,
    features,
    purpose,
    styleSummary,
    priorities,
    specificRequests,
    freeText,
    wallDimensions,
  } = params;

  // Opening sentence
  const opening = `Transform this ${roomType} by installing new custom ${purpose} cabinetry, for an Australian homeowner who wants a ${styleSummary} feel.`;

  // The space
  const wallDims = wallDimensions
    .map((w) => `${w.label}: ${(w.lengthMm / 1000).toFixed(1)}m`)
    .join(', ');
  const featureList = features.length > 0
    ? `Notable features include ${features.join(', ')}.`
    : '';
  const space = `The space is approximately ${(dimensions.width / 1000).toFixed(1)}m wide by ${(dimensions.depth / 1000).toFixed(1)}m deep with ${(dimensions.height / 1000).toFixed(1)}m ceilings. Wall dimensions: ${wallDims}. The flooring is ${flooring} and walls are ${wallFinishes}. Lighting is ${lightingConditions}. ${featureList}`;

  // The design
  const materialDesc = polytecSecondary
    ? `Primary material: ${polytecPrimary} (Polytec finish). Secondary: ${polytecSecondary}.`
    : `Primary material: ${polytecPrimary} (Polytec finish).`;
  const design = `Design style: ${styleName} — ${styleDescription}. ${materialDesc} Door profile: ${doorProfile}. Hardware: ${hardware}.`;

  // Homeowner preferences
  let prefs = '';
  if (priorities.length > 0) {
    const priorityNarrative = priorities.join(', ');
    prefs += `The homeowner's priorities are: ${priorityNarrative}.`;
  }
  if (specificRequests.length > 0) {
    prefs += ` They specifically requested: ${specificRequests.join(', ')}.`;
  }
  if (freeText) {
    prefs += ` In their own words: "${freeText}"`;
  }

  // Critical constraints
  const constraints = `MUST preserve the existing room exactly as photographed — same walls, flooring, ceiling, windows, and doors. MUST match the camera angle and perspective precisely. The cabinetry MUST look physically installed, not digitally overlaid. Generate a single photorealistic image.`;

  return [opening, space, design, prefs, constraints]
    .filter(Boolean)
    .join('\n\n');
}
