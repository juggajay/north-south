/**
 * AI Actions
 *
 * Server-side Convex actions for AI integrations.
 * Keeps API keys secure on the server while providing typed interfaces.
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI, Part } from "@google/genai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { z } from "zod";

// Zod schema for validating Claude's response
const SpaceAnalysisSchema = z.object({
  roomType: z.string(),
  estimatedWidth: z.number(),
  estimatedDepth: z.number(),
  estimatedHeight: z.number(),
  features: z.array(z.string()),
  styleAesthetic: z.enum([
    "modern",
    "traditional",
    "industrial",
    "coastal",
    "scandinavian",
  ]),
  lightingConditions: z.enum(["natural", "artificial", "mixed"]),
  flooring: z.string(),
  wallFinishes: z.string(),
});

// Type inferred from schema
type SpaceAnalysisResult = z.infer<typeof SpaceAnalysisSchema>;

/**
 * Analyze a space image using Claude Vision
 *
 * Takes a base64 encoded image and returns structured analysis
 * of room features, dimensions, and style aesthetics.
 *
 * @param imageBase64 - Base64 encoded JPEG image (pre-resized to 1568px max recommended)
 * @returns Success with SpaceAnalysis or error with user-friendly message
 */
export const analyzeSpaceAction = action({
  args: {
    imageBase64: v.string(),
  },
  handler: async (
    _ctx,
    args
  ): Promise<
    | { success: true; analysis: SpaceAnalysisResult }
    | { success: false; error: string }
  > => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "Vision analysis service not configured. Please contact support.",
      };
    }

    try {
      const client = new Anthropic({ apiKey });

      const message = await client.messages.create({
        model: "claude-opus-4-5-20251101",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: args.imageBase64,
                },
              },
              {
                type: "text",
                text: `Analyze this space for joinery/cabinetry installation. You are helping a custom joinery company understand this room.

Extract and return ONLY a JSON object with these exact fields:
{
  "roomType": "kitchen/bedroom/living/office/laundry/garage/other",
  "estimatedWidth": <width in millimeters>,
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
      const textContent = message.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        return {
          success: false,
          error: "No text response from vision analysis. Please try again.",
        };
      }

      // Parse and validate with Zod
      try {
        // Handle potential markdown code blocks
        let jsonStr = textContent.text.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }

        const parsed = JSON.parse(jsonStr);
        const validated = SpaceAnalysisSchema.parse(parsed);

        return {
          success: true,
          analysis: validated,
        };
      } catch {
        console.error("Failed to parse Claude response:", textContent.text);
        return {
          success: false,
          error: "Could not analyze the space. Please try a clearer photo.",
        };
      }
    } catch (error) {
      console.error("Claude Vision API error:", error);

      // Check for specific error types
      if (error instanceof Anthropic.APIError) {
        if (error.status === 401) {
          return {
            success: false,
            error: "Vision service authentication failed. Please contact support.",
          };
        }
        if (error.status === 429) {
          return {
            success: false,
            error: "Vision service is busy. Please try again in a moment.",
          };
        }
      }

      return {
        success: false,
        error: "Failed to analyze space. Please try again.",
      };
    }
  },
});

// ============================================================================
// JOINERY SYSTEM INSTRUCTION (for Nano Banana Pro)
// ============================================================================

const JOINERY_SYSTEM_INSTRUCTION = `You are an expert architectural visualisation renderer for an Australian custom joinery company.
Your role: take a room photograph and generate a photorealistic image showing new cabinetry installed.
Rules:
- MUST preserve existing walls, flooring, ceiling, windows, doors EXACTLY as in the original photo
- MUST match the existing camera angle, perspective, and lens distortion EXACTLY
- MUST match existing lighting direction, shadows, and colour temperature
- NEVER change room architecture, wall colours, flooring, or ceiling
- NEVER add non-cabinetry items (furniture, appliances, decorative objects)
- NEVER generate text, watermarks, labels, or annotations
- Cabinetry MUST look physically installed, not digitally overlaid
- Hardware (handles/knobs) MUST be visible and consistent across all cabinets`;

/**
 * Generate a styled render using Gemini Nano Banana Pro
 *
 * Takes the original image + full user context and generates a single
 * photorealistic render showing custom joinery matching user preferences.
 *
 * Uses narrative prompt with systemInstruction for best results.
 */
export const generateRendersAction = action({
  args: {
    imageBase64: v.string(),
    // Style (resolved from discovery, not from photo)
    styleName: v.string(),
    styleDescription: v.string(),
    polytecPrimary: v.string(),
    polytecSecondary: v.optional(v.string()),
    doorProfile: v.string(),
    hardware: v.string(),
    // Space (from Claude Vision analysis)
    roomType: v.string(),
    dimensions: v.object({
      width: v.number(),
      depth: v.number(),
      height: v.number(),
    }),
    lightingConditions: v.string(),
    flooring: v.string(),
    wallFinishes: v.string(),
    features: v.array(v.string()),
    // User context (from discovery)
    purpose: v.string(),
    styleSummary: v.string(),
    priorities: v.array(v.string()),
    specificRequests: v.array(v.string()),
    freeText: v.optional(v.string()),
    // Wall dimensions from user
    wallDimensions: v.array(v.object({ label: v.string(), lengthMm: v.number() })),
    // Narrative prompt (pre-built on client)
    prompt: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        success: false as const,
        error: "Render generation service not configured. Please contact support.",
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = "gemini-3-pro-image-preview";

    try {
      // Image FIRST in parts array (best practice for image editing)
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: args.imageBase64,
                },
              },
              { text: args.prompt },
            ],
          },
        ],
        config: {
          responseModalities: ["IMAGE"],
          temperature: 0.4,
          systemInstruction: JOINERY_SYSTEM_INSTRUCTION,
        },
      });

      // Extract image from response
      const imagePart = result.candidates?.[0]?.content?.parts?.find(
        (part: Part) => part.inlineData !== undefined
      );

      if (imagePart?.inlineData?.data) {
        return {
          success: true as const,
          render: {
            id: `render-${Date.now()}`,
            imageBase64: imagePart.inlineData.data,
          },
        };
      }

      return {
        success: false as const,
        error: "Model returned text instead of image. Please try again.",
      };
    } catch (error) {
      console.error("Render generation failed:", error);
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
