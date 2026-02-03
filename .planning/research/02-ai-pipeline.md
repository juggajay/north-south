# Research: AI Pipeline Architecture

## Investigation Focus

How to build a 30-second photo-to-render pipeline combining vision analysis, depth estimation, and image generation.

---

## 1. Pipeline Overview

### Target Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        PHOTO UPLOAD                              │
│                          (0-2s)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE VALIDATION                              │
│                         (1-2s)                                   │
│  • Resolution check (min 1080p)                                  │
│  • Blur detection                                                │
│  • Lighting assessment                                           │
│  • Angle validation (can we see the space?)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL ANALYSIS                             │
│                         (5-8s)                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Claude Vision  │  │ Depth Anything  │  │  Style Match    │  │
│  │  Space Analysis │  │   V2 Depth Map  │  │  (from Vision)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│         │                    │                    │              │
│         └──────────┬─────────┴────────────────────┘              │
│                    ▼                                             │
│             Combined Output:                                     │
│             • Dimensions (W×D×H)                                 │
│             • Features list                                      │
│             • Style classification                               │
│             • 3 render prompts                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PARALLEL RENDER GENERATION                     │
│                        (15-20s)                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Render #1     │  │   Render #2     │  │   Render #3     │  │
│  │ Slimline Shaker │  │  Natural Oak    │  │  Fluted Panel   │  │
│  │ (Nano Banana)   │  │ (Nano Banana)   │  │ (Nano Banana)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPOSITING                                 │
│                        (2-3s)                                    │
│  • Blend generated joinery into original photo context           │
│  • Match lighting direction                                      │
│  • Preserve walls, floor, ceiling                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DISPLAY RESULTS                               │
│                       (< 30s total)                              │
│  • 3 swipeable renders                                           │
│  • Dimension estimate with confidence                            │
│  • Style name for each render                                    │
│  • [Configure] CTA                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Image Validation

### Quality Checks (Claude Vision)

```typescript
const validateImage = async (imageUrl: string) => {
  const prompt = `Analyze this interior photo for quality:
  
  1. RESOLUTION: Is it at least 1080p? (reject if clearly low-res)
  2. BLUR: Is the image sharp or blurry? (reject if motion blur or out of focus)
  3. LIGHTING: Can you clearly see the space? (reject if too dark or overexposed)
  4. ANGLE: Can you see walls, floor, and the alcove/space? (reject if too close or wrong angle)
  5. CONTENT: Is this an interior residential space? (reject if not applicable)
  
  Respond with JSON:
  {
    "valid": boolean,
    "issues": string[] | null,
    "guidance": string | null,
    "confidence": number (0-1)
  }`;
  
  return await claude.vision.analyze(imageUrl, prompt);
};
```

### Rejection Messages

| Issue | User-Facing Message |
|-------|---------------------|
| Low resolution | "Photo quality is too low. Try taking a new photo in better lighting." |
| Blurry | "The photo is a bit blurry. Hold your phone steady and try again." |
| Too dark | "We need more light to see your space. Try turning on lights or opening blinds." |
| Wrong angle | "Step back a bit so we can see the full space, including the floor and ceiling edges." |
| Not interior | "This doesn't look like an interior space. Please photograph the area where you want your joinery." |

---

## 3. Claude Vision Space Analysis

### Prompt Engineering

```typescript
const analyzeSpace = async (imageUrl: string) => {
  const prompt = `You are analyzing an interior photo for a joinery configurator.

Extract the following information in JSON format:

{
  "dimensions": {
    "width_mm": number (estimate, typically 1200-4000mm),
    "depth_mm": number (estimate, typically 400-800mm),
    "height_mm": number (estimate, typically 1800-2700mm),
    "confidence": number (0-1),
    "reference_used": string | null (e.g., "door frame", "power outlet", "person")
  },
  "features": {
    "wall_color": string (hex code estimate),
    "floor_type": "timber" | "tile" | "carpet" | "concrete" | "other",
    "floor_color": string (hex code estimate),
    "natural_light": "abundant" | "moderate" | "limited" | "none",
    "light_direction": "left" | "right" | "front" | "back" | "overhead",
    "existing_fixtures": string[] (power points, pipes, vents, etc.),
    "obstructions": string[] (anything that must be worked around)
  },
  "architecture": {
    "style": "modern" | "traditional" | "period" | "industrial" | "minimalist",
    "era": "contemporary" | "federation" | "art-deco" | "victorian" | "mid-century" | "unknown",
    "ceiling_type": "flat" | "raked" | "bulkhead" | "exposed-beams",
    "wall_condition": "good" | "needs-prep" | "uneven"
  },
  "perspective": {
    "camera_height_mm": number (estimate from floor),
    "viewing_angle": "straight-on" | "angled-left" | "angled-right",
    "distortion": "none" | "slight" | "significant"
  },
  "suitability": {
    "suitable_for_joinery": boolean,
    "concerns": string[] | null,
    "recommendations": string[] | null
  }
}

Common reference objects for dimension estimation:
- Standard door: 2040mm high × 820mm wide
- Power outlet: typically 300mm from floor
- Light switch: typically 1000-1200mm from floor
- Standard ceiling: 2400-2700mm
- Kitchen bench height: 900mm`;

  return await claude.vision.analyze(imageUrl, prompt);
};
```

---

## 4. Depth Anything V2 Integration

### Purpose

Refine dimension estimates using monocular depth estimation. The depth map provides relative distances that, combined with Claude's reference object detection, gives more accurate measurements.

### Implementation

```typescript
import { DepthAnything } from 'depth-anything-v2';

const estimateDepth = async (imageBuffer: Buffer) => {
  const depthMap = await DepthAnything.predict(imageBuffer, {
    model: 'vitl', // Large model for accuracy
    outputType: 'numpy'
  });
  
  // Extract depth at key points
  const wallDepths = extractWallPlaneDepths(depthMap);
  const floorDepth = extractFloorPlaneDepth(depthMap);
  
  return {
    depthMap,
    wallDepths,
    floorDepth,
    relativeDimensions: calculateRelativeDimensions(wallDepths, floorDepth)
  };
};
```

### Dimension Accuracy Tiers

| Tier | Input | Process | Accuracy |
|------|-------|---------|----------|
| Basic | Single photo | Claude Vision only | ±15% |
| Standard | Photo + reference object | Claude + calibration | ±10% |
| Enhanced | Multiple photos | Claude + Depth + triangulation | ±5% |
| Precision | LiDAR scan | Direct measurement import | ±2% |

### Tier Detection

```typescript
const determineTier = (inputs: AnalysisInputs) => {
  if (inputs.lidarScan) return 'precision';
  if (inputs.photos.length >= 3) return 'enhanced';
  if (inputs.referenceObject) return 'standard';
  return 'basic';
};
```

---

## 5. Style Classification

### Style Categories

| Style | Door Profile | Colors | Hardware | Target Customer |
|-------|--------------|--------|----------|-----------------|
| Modern Coastal | Slimline Shaker | Warm whites, natural oak | Brushed brass | Young professional |
| Contemporary Minimal | Flat Panel | Pure white, grey | Integrated/handleless | Design-conscious |
| Modern Farmhouse | Traditional Shaker | Cream, sage, timber | Black iron | Family home |
| Scandi Natural | Slimline Shaker | White, pale timber | Chrome, white | Minimalist |
| Industrial | Flat Panel | Charcoal, black, timber | Matte black | Urban loft |
| Classic Elegant | Fluted/Reeded | Warm white, navy | Polished brass | Traditional taste |

### Style Matching Logic

```typescript
const matchStyles = (spaceAnalysis: SpaceAnalysis) => {
  const scores: StyleScore[] = [];
  
  for (const style of STYLES) {
    let score = 0;
    
    // Architecture match
    if (style.architectureAffinity.includes(spaceAnalysis.architecture.style)) {
      score += 30;
    }
    
    // Color harmony
    const colorMatch = calculateColorHarmony(
      spaceAnalysis.features.wall_color,
      style.primaryColors
    );
    score += colorMatch * 25;
    
    // Era appropriateness
    if (style.eraMatch.includes(spaceAnalysis.architecture.era)) {
      score += 20;
    }
    
    // Lighting compatibility
    if (style.lightingPreference === spaceAnalysis.features.natural_light) {
      score += 15;
    }
    
    // Popularity boost (trending styles)
    score += style.popularityBoost;
    
    scores.push({ style: style.name, score });
  }
  
  // Return top 3
  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
};
```

---

## 6. Render Generation (Nano Banana Pro)

### Prompt Construction

```typescript
const constructRenderPrompt = (
  style: StyleDefinition,
  spaceAnalysis: SpaceAnalysis,
  dimensions: Dimensions
) => {
  return `Photorealistic interior render of a butler's pantry/joinery unit.

SPACE CONTEXT:
- Alcove dimensions: ${dimensions.width_mm}mm wide × ${dimensions.depth_mm}mm deep × ${dimensions.height_mm}mm high
- Wall color: ${spaceAnalysis.features.wall_color}
- Floor: ${spaceAnalysis.features.floor_type} in ${spaceAnalysis.features.floor_color}
- Lighting: Natural light from ${spaceAnalysis.features.light_direction}, ${spaceAnalysis.features.natural_light} intensity

JOINERY STYLE: ${style.name}
- Door profile: ${style.doorProfile}
- Primary color: ${style.primaryColor}
- Secondary accent: ${style.secondaryColor}
- Hardware: ${style.hardware} finish
- Handle style: ${style.handleStyle}

CONFIGURATION:
- Base cabinets: 4 units (600mm each) with mix of doors and drawers
- Overhead cabinets: 4 units (600mm each) with adjustable shelves
- Countertop: 40mm stone or laminate
- Include subtle LED strip lighting under overheads

RENDER REQUIREMENTS:
- Match the perspective angle of the original photo
- Preserve visible walls, floor, and ceiling from original
- Realistic material textures (show wood grain on timber finishes)
- Soft ambient lighting plus accent from LEDs
- Show hardware details (handles, hinges visible where appropriate)
- Professional interior photography style
- 16:9 aspect ratio, high resolution`;
};
```

### Quality Validation

After generation, validate renders:

```typescript
const validateRender = async (renderUrl: string, style: StyleDefinition) => {
  const prompt = `Validate this interior render for quality:
  
  1. Does it show ${style.doorProfile} door profile? 
  2. Is the primary color approximately ${style.primaryColor}?
  3. Is the hardware ${style.hardware} finish?
  4. Does it look photorealistic (not obviously AI-generated)?
  5. Is the perspective reasonable for an interior photo?
  
  Respond: { "valid": boolean, "issues": string[] }`;
  
  const result = await claude.vision.analyze(renderUrl, prompt);
  
  if (!result.valid) {
    // Retry with adjusted prompt
    return await regenerateWithFixes(style, result.issues);
  }
  
  return { valid: true, url: renderUrl };
};
```

---

## 7. Compositing Pipeline

### Blending Strategy

The renders should show the joinery in context of the original photo. Options:

1. **Full replacement** — Generate entire scene including walls/floor
   - Pro: Consistent lighting
   - Con: May not match original exactly

2. **Inpainting** — Mask joinery area, generate only that region
   - Pro: Preserves original context perfectly
   - Con: Edge blending can be tricky

3. **Hybrid** — Generate full scene but blend edges with original
   - Pro: Best of both worlds
   - Con: More complex pipeline

**Recommendation:** Option 1 (Full replacement) for MVP

- Simpler pipeline
- More consistent results
- Original photo shown in before/after slider anyway

### Compositing Code

```typescript
const compositeRender = async (
  originalPhoto: Buffer,
  generatedRender: Buffer,
  mask: Buffer // Area where joinery should appear
) => {
  // For MVP: return generated render as-is
  // Future: blend edges using mask
  
  return generatedRender;
};
```

---

## 8. Error Handling & Fallbacks

### Timeout Strategy

```typescript
const TIMEOUTS = {
  validation: 5000,      // 5 seconds
  spaceAnalysis: 10000,  // 10 seconds
  depthEstimation: 8000, // 8 seconds
  renderGeneration: 20000, // 20 seconds per render
  total: 45000           // 45 seconds max
};

const runPipelineWithTimeout = async (imageUrl: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUTS.total);
  
  try {
    return await runPipeline(imageUrl, controller.signal);
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'timeout',
        fallback: await getFallbackGallery()
      };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
```

### Fallback Gallery

If pipeline fails, show curated gallery of similar spaces:

```typescript
const getFallbackGallery = async (spaceAnalysis?: SpaceAnalysis) => {
  // Get gallery images that match detected style
  const filters = spaceAnalysis ? {
    architectureStyle: spaceAnalysis.architecture.style,
    era: spaceAnalysis.architecture.era
  } : {};
  
  return await db.query('galleryImages')
    .filter(filters)
    .limit(6)
    .collect();
};
```

---

## 9. Cost Estimation

### Per-Request Costs

| Service | Cost per Request | Requests per Photo |
|---------|------------------|-------------------|
| Claude Vision (validation) | ~$0.02 | 1 |
| Claude Vision (analysis) | ~$0.05 | 1 |
| Depth Anything V2 | ~$0.01 | 1 |
| Nano Banana Pro (render) | ~$0.10 | 3 |

**Total per photo:** ~$0.38

### Monthly Projections

| Scenario | Photos/Month | Cost |
|----------|--------------|------|
| Low (50 leads) | 150 | $57 |
| Medium (200 leads) | 600 | $228 |
| High (500 leads) | 1500 | $570 |

---

## 10. Implementation Checklist

- [ ] Set up Claude Vision API integration
- [ ] Implement image validation prompts
- [ ] Build space analysis prompt engineering
- [ ] Integrate Depth Anything V2
- [ ] Create style classification logic
- [ ] Set up Nano Banana Pro integration
- [ ] Build render prompt templates for each style
- [ ] Implement render validation
- [ ] Create compositing pipeline (or decide on full replacement)
- [ ] Build timeout and error handling
- [ ] Create fallback gallery system
- [ ] Set up cost monitoring
- [ ] Performance testing (target < 30s)
