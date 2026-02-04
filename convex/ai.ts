/**
 * AI Actions
 *
 * Server-side Convex actions for AI integrations.
 * Keeps API keys secure on the server while providing typed interfaces.
 */

import Anthropic from "@anthropic-ai/sdk";
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
