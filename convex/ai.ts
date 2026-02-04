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
        model: "claude-sonnet-4-5-20250514",
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

/**
 * Generate styled renders using Gemini image generation
 *
 * Takes the original image and generates photorealistic renders
 * showing custom joinery in different style options.
 *
 * Uses Gemini 2.0 Flash for image generation.
 * Handles partial failures gracefully - returns successful renders
 * even if some style generations fail.
 */
export const generateRendersAction = action({
  args: {
    imageBase64: v.string(),
    styles: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        polytec: v.array(v.string()),
      })
    ),
    roomType: v.string(),
    dimensions: v.object({
      width: v.number(),
      depth: v.number(),
      height: v.number(),
    }),
    styleAesthetic: v.string(),
    lightingConditions: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "Render generation service not configured. Please contact support.",
        renders: [],
        failedCount: args.styles.length,
        errors: args.styles.map((s) => ({
          styleId: s.id,
          error: "API key not configured",
        })),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use Gemini 2.0 Flash for image generation
    // Note: Image generation capabilities vary by model availability
    const modelName = "gemini-2.0-flash-exp";

    const renderResults = await Promise.all(
      args.styles.slice(0, 3).map(async (style, index) => {
        const prompt = `Generate a photorealistic interior render showing custom joinery/cabinetry in this ${args.roomType}.

Style: ${style.name}
Materials: ${style.polytec.join(", ")} (Polytec finishes)
Space dimensions: ${args.dimensions.width}mm wide x ${args.dimensions.depth}mm deep x ${args.dimensions.height}mm high

Requirements:
- Keep the original room context (walls, floor, ceiling visible)
- Add modern ${style.name.toLowerCase()} style cabinetry
- Use ${style.polytec[0]} as primary material
- Realistic ${args.lightingConditions} lighting
- ${args.styleAesthetic} aesthetic
- Professional custom joinery quality

Output a single photorealistic image.`;

        try {
          const result = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: args.imageBase64,
                    },
                  },
                ],
              },
            ],
          });

          // Try to extract image from response
          const imagePart = result.candidates?.[0]?.content?.parts?.find(
            (part: Part) => part.inlineData !== undefined
          );

          if (imagePart?.inlineData?.data) {
            return {
              success: true as const,
              render: {
                id: `render-${style.id}-${index}`,
                styleLabel: style.name,
                styleId: style.id,
                imageBase64: imagePart.inlineData.data,
              },
            };
          }

          // If no image, model returned text instead
          // This can happen if the model doesn't support image generation
          return {
            success: false as const,
            error: "Model returned text instead of image",
            styleId: style.id,
          };
        } catch (error) {
          console.error(`Render generation failed for ${style.name}:`, error);
          return {
            success: false as const,
            error: error instanceof Error ? error.message : "Unknown error",
            styleId: style.id,
          };
        }
      })
    );

    // Separate successful and failed renders
    const successful = renderResults.filter(
      (r): r is { success: true; render: typeof r extends { render: infer R } ? R : never } =>
        r.success === true
    );
    const failed = renderResults.filter(
      (r): r is { success: false; error: string; styleId: string } =>
        r.success === false
    );

    return {
      success: successful.length > 0,
      renders: successful.map((r) => r.render),
      failedCount: failed.length,
      errors: failed.map((f) => ({ styleId: f.styleId, error: f.error })),
    };
  },
});
