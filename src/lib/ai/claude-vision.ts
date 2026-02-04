/**
 * Claude Vision API Client
 *
 * Provides space analysis capabilities using Claude Vision to extract
 * room features, dimensions, and style aesthetics from photos.
 *
 * Key exports:
 * - analyzeSpace: Main function for space analysis
 * - imageUriToBase64: Convert Capacitor image URI to base64
 * - resizeImageForVision: Resize to 1568px max for optimal Vision API performance
 */

import Anthropic from '@anthropic-ai/sdk';
import { SpaceAnalysis } from '@/types/ai-pipeline';
import { z } from 'zod';

// Zod schema for validating Claude's response
const SpaceAnalysisSchema = z.object({
  roomType: z.string(),
  estimatedWidth: z.number(),
  estimatedDepth: z.number(),
  estimatedHeight: z.number(),
  features: z.array(z.string()),
  styleAesthetic: z.enum([
    'modern',
    'traditional',
    'industrial',
    'coastal',
    'scandinavian',
  ]),
  lightingConditions: z.enum(['natural', 'artificial', 'mixed']),
  flooring: z.string(),
  wallFinishes: z.string(),
});

/**
 * Convert image URI (from Capacitor) to base64 for Claude Vision API
 * Handles data URLs and file URIs
 *
 * NOTE: This helper is also used by useProcessPhoto hook in Plan 03-05
 */
export async function imageUriToBase64(uri: string): Promise<string> {
  // If already base64 data URL, extract the base64 part
  if (uri.startsWith('data:')) {
    return uri.split(',')[1];
  }

  // Fetch the image and convert to base64
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Resize image to max 1568px on longest edge (Claude Vision optimal size)
 * Larger images get auto-resized by Claude, adding latency without quality gain
 *
 * NOTE: This helper is also used by useProcessPhoto hook in Plan 03-05
 */
export async function resizeImageForVision(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1568;
      let { width, height } = img;

      if (width <= maxDim && height <= maxDim) {
        resolve(base64);
        return;
      }

      // Scale down maintaining aspect ratio
      if (width > height) {
        height = (height * maxDim) / width;
        width = maxDim;
      } else {
        width = (width * maxDim) / height;
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Return base64 without data URL prefix
      resolve(canvas.toDataURL('image/jpeg', 0.9).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

/**
 * Analyze space using Claude Vision API
 * Returns structured analysis of room features, dimensions, and style
 *
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @param apiKey - Anthropic API key
 * @returns SpaceAnalysis object with room details
 * @throws Error if response cannot be parsed or validated
 */
export async function analyzeSpace(
  imageBase64: string,
  apiKey: string
): Promise<SpaceAnalysis> {
  const client = new Anthropic({ apiKey });

  // Ensure image is optimally sized
  const resizedImage = await resizeImageForVision(imageBase64);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: resizedImage,
            },
          },
          {
            type: 'text',
            text: `Analyze this space for joinery/cabinetry installation. You are helping a custom joinery company understand this room.

Extract and return ONLY a JSON object with these exact fields:
{
  "roomType": "kitchen/bedroom/living/office/laundry/garage/other",
  "estimatedWidth": <width in millimeters, estimate based on typical room proportions>,
  "estimatedDepth": <depth in millimeters>,
  "estimatedHeight": <ceiling height in millimeters, typically 2400-2700mm>,
  "features": ["list", "of", "features like windows, doors, alcoves, power points"],
  "styleAesthetic": "modern/traditional/industrial/coastal/scandinavian",
  "lightingConditions": "natural/artificial/mixed",
  "flooring": "description of floor type and color",
  "wallFinishes": "description of wall color/texture"
}

For dimensions:
- Standard Australian ceiling height is 2400mm
- Use reference objects (doors ~2100mm, switches ~1200mm from floor) to estimate
- If uncertain, provide reasonable estimates for the room type

Return ONLY the JSON object, no markdown formatting or explanation.`,
          },
        ],
      },
    ],
  });

  // Extract text content from response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude Vision');
  }

  // Parse and validate with Zod
  try {
    // Handle potential markdown code blocks
    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(jsonStr);
    return SpaceAnalysisSchema.parse(parsed);
  } catch (error) {
    console.error('Failed to parse Claude response:', textContent.text);
    throw new Error(
      'Invalid response format from Claude Vision. Please try again.'
    );
  }
}
