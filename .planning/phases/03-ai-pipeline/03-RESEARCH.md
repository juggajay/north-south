# Phase 03: AI Pipeline - Research

**Researched:** 2026-02-04
**Domain:** AI API integration, async pipeline orchestration, image processing
**Confidence:** MEDIUM

## Summary

Phase 03 involves building a multi-step AI processing pipeline that transforms user photos into styled renders with dimension estimates. The pipeline orchestrates three AI services (Claude Vision, Depth Anything V2, Nano Banana Pro) with a polished processing UI that shows animated progress stages.

The standard approach for this domain uses **TanStack Query** for async state management with retry logic, **Framer Motion** for step indicators and animations (already in stack), and the **Fetch API** for multipart/form-data image uploads. Claude Vision API supports both base64 and URL image sources. Depth Anything V2 is available via Hugging Face Transformers. Nano Banana Pro (Gemini 3 Pro Image) is Google's production image generation model launched November 2026.

This phase builds on Phase 02's camera capture infrastructure (Capacitor Camera, image quality validation) and prepares for Phase 04's configurator (which consumes the dimension data and style selection).

**Primary recommendation:** Use TanStack Query v5 with exponential backoff retry logic for all AI API calls, orchestrate the pipeline as a multi-step mutation, and provide real-time progress feedback via shared state consumed by animated step indicators.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | 5.90+ | Async state management, retry logic, caching | Industry standard for API calls, built-in retry with exponential backoff |
| @anthropic-ai/sdk | Latest | Claude Vision API integration | Official TypeScript SDK from Anthropic |
| @google/genai | 1.39.0+ | Gemini/Nano Banana Pro API | Already in stack, official Google SDK |
| framer-motion | 12.30.1+ | Animated step indicators, geometric animations | Already in stack, performant declarative animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.71.1+ | Form state for pre-processing inputs | Already in stack, dimension editing flows |
| zod | 4.3.6+ | Runtime validation of AI responses | Already in stack, validate dimension estimates |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Query | SWR or manual fetch | Query has better retry logic, devtools, type safety |
| Framer Motion | CSS animations | Motion provides better orchestration, spring physics |
| Fetch API | Axios | Fetch is native, lighter, sufficient for multipart uploads |

**Installation:**
```bash
npm install @tanstack/react-query @anthropic-ai/sdk
# @google/genai and framer-motion already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── ai/
│   │   ├── claude-vision.ts      # Claude Vision API client
│   │   ├── depth-estimation.ts   # Depth Anything V2 integration
│   │   ├── nano-banana.ts        # Nano Banana Pro render generation
│   │   └── pipeline.ts           # Pipeline orchestrator
│   └── hooks/
│       └── useProcessPhoto.ts    # TanStack Query mutation hook
├── components/
│   ├── processing/
│   │   ├── ProcessingScreen.tsx  # Main processing container
│   │   ├── StepIndicator.tsx     # Animated progress stages
│   │   ├── GeometricAnimation.tsx # Abstract motion graphics
│   │   └── ErrorFallback.tsx     # Retry UI
│   └── renders/
│       ├── RenderCarousel.tsx    # Swipeable full-screen carousel
│       ├── RenderSlide.tsx       # Individual render display
│       └── DimensionBadge.tsx    # Confidence tier indicator
└── types/
    └── ai-pipeline.ts            # TypeScript types for pipeline
```

### Pattern 1: Multi-Step Pipeline Orchestration
**What:** Chain multiple AI API calls with progress tracking and error recovery
**When to use:** Sequential async operations with UI feedback requirements
**Example:**
```typescript
// Source: TanStack Query best practices + research synthesis
import { useMutation } from '@tanstack/react-query';

type PipelineStage = 'analyzing' | 'measuring' | 'styling' | 'creating';

interface PipelineProgress {
  stage: PipelineStage;
  complete: boolean;
  error?: string;
}

export function useProcessPhoto() {
  return useMutation({
    mutationFn: async (imageUri: string) => {
      const progressCallback = (stage: PipelineStage) => {
        // Update UI via shared state (Zustand/Context)
      };

      // Step 1: Claude Vision analysis
      progressCallback('analyzing');
      const analysis = await analyzeSpace(imageUri);

      // Step 2: Depth estimation
      progressCallback('measuring');
      const dimensions = await estimateDimensions(imageUri, analysis);

      // Step 3: Style classification
      progressCallback('styling');
      const styles = await classifyStyles(analysis);

      // Step 4: Render generation
      progressCallback('creating');
      const renders = await generateRenders(imageUri, styles, dimensions);

      return { analysis, dimensions, styles, renders };
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Only retry on transient errors (5xx, network), not 4xx
    retry: (failureCount, error) => {
      if (error.status >= 400 && error.status < 500) return false;
      return failureCount < 3;
    },
  });
}
```

### Pattern 2: Claude Vision Image Analysis
**What:** Send images to Claude Vision API for space analysis and feature extraction
**When to use:** Photo-to-text analysis, scene understanding
**Example:**
```typescript
// Source: https://platform.claude.com/docs/en/build-with-claude/vision
import Anthropic from '@anthropic-ai/sdk';

async function analyzeSpace(imageUri: string): Promise<SpaceAnalysis> {
  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  // Convert Capacitor URI to base64 or use URL source
  const imageData = await imageUriToBase64(imageUri);

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
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
              data: imageData,
            },
          },
          {
            type: "text",
            text: `Analyze this space for joinery installation. Extract:
              - Room type and dimensions estimate
              - Wall features (windows, doors, alcoves)
              - Style aesthetic (modern/traditional/industrial)
              - Lighting conditions
              - Flooring and wall finishes
              Return as JSON.`
          }
        ],
      }
    ],
  });

  // Parse and validate response with Zod
  return parseSpaceAnalysis(message.content);
}
```

### Pattern 3: Animated Step Indicators
**What:** Visual progress feedback with named stages and checkmarks
**When to use:** Multi-step async processes where user needs reassurance
**Example:**
```typescript
// Source: Framer Motion best practices + research synthesis
import { motion } from 'framer-motion';

const stages = [
  { id: 'analyzing', label: 'Analyzing' },
  { id: 'measuring', label: 'Measuring' },
  { id: 'styling', label: 'Styling' },
  { id: 'creating', label: 'Creating' },
];

export function StepIndicator({ currentStage }: { currentStage: PipelineStage }) {
  return (
    <div className="flex justify-between max-w-md mx-auto">
      {stages.map((stage, index) => {
        const isComplete = stages.findIndex(s => s.id === currentStage) > index;
        const isCurrent = stage.id === currentStage;

        return (
          <div key={stage.id} className="flex flex-col items-center">
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              animate={{
                backgroundColor: isComplete ? '#10b981' : isCurrent ? '#3b82f6' : '#e5e7eb',
                scale: isCurrent ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {isComplete && <CheckIcon className="w-6 h-6 text-white" />}
              {isCurrent && <Spinner className="w-6 h-6 text-white" />}
            </motion.div>
            <span className="text-sm mt-2">{stage.label}</span>
          </div>
        );
      })}
    </div>
  );
}
```

### Pattern 4: Swipeable Render Carousel
**What:** Full-screen horizontal carousel for generated renders with pagination dots
**When to use:** Displaying multiple related images with natural swipe navigation
**Example:**
```typescript
// Source: Framer Motion drag constraints + research synthesis
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function RenderCarousel({ renders }: { renders: Render[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative h-screen w-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            const threshold = 50;
            if (info.offset.x > threshold && currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            } else if (info.offset.x < -threshold && currentIndex < renders.length - 1) {
              setCurrentIndex(currentIndex + 1);
            }
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          <img
            src={renders[currentIndex].imageUrl}
            className="object-cover h-full w-full"
            alt={`Render ${currentIndex + 1}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
        {renders.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <button
        className="absolute bottom-8 left-8 right-8 h-14 bg-blue-600 text-white rounded-lg"
      >
        Customize this
      </button>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Blocking the UI thread during processing:** Use TanStack Query mutations with loading states, not synchronous waits
- **Not handling partial failures:** If one API step fails, preserve previous results and allow retry from failure point
- **Showing time estimates:** User research shows time estimates increase frustration; use stage names instead
- **Allowing cancel mid-pipeline:** User decided committed flow is simpler; don't add cancel complexity
- **Polling for completion:** AI APIs are request/response; use await, not polling

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Retry logic with exponential backoff | Custom setTimeout loops | TanStack Query `retry` + `retryDelay` | Edge cases: jitter, max attempts, conditional retry, built-in |
| Image carousel with swipe | Custom touch event handlers | Framer Motion `drag` with constraints | Handles velocity, momentum, elastic bounds, cross-platform |
| Progress animations | CSS transitions | Framer Motion spring animations | Natural physics, interruption handling, orchestration |
| Base64 image encoding | String concatenation | `btoa()` or `FileReader.readAsDataURL()` | Handles binary safely, browser-optimized |
| API error categorization | String matching | HTTP status code ranges (4xx vs 5xx) | Standard semantics, retry-safe |
| Form data uploads | Manual boundary creation | Native `FormData` API | Handles multipart encoding, file metadata |

**Key insight:** AI pipeline orchestration is mostly async coordination. Don't build state machines manually—TanStack Query handles loading/error/success states, retry logic, and caching. Don't build animation timelines manually—Framer Motion handles sequencing, spring physics, and interruptions.

## Common Pitfalls

### Pitfall 1: Claude Vision Image Size Limits
**What goes wrong:** Sending images larger than 8000x8000px gets rejected; images over 1568px get auto-resized, increasing latency without quality gain
**Why it happens:** Developers don't read size constraints and send full-resolution camera photos (4000x3000+ typical on modern phones)
**How to avoid:** Resize images to max 1568px on longest edge before sending. Phase 02 already downscales to 1024px for quality detection—reuse that
**Warning signs:** "Image too large" API errors, slow time-to-first-token (TTFT) on Vision API calls

### Pitfall 2: Not Validating AI Response Structure
**What goes wrong:** Claude returns valid text but not valid JSON; app crashes trying to parse
**Why it happens:** LLMs are probabilistic—even with "return JSON" prompts, they may wrap JSON in markdown or add commentary
**How to avoid:** Use Zod schemas to validate and parse responses. Catch parse errors and retry with stronger prompt
**Warning signs:** Intermittent crashes on response parsing, empty fields in UI

### Pitfall 3: Treating All Errors as Retryable
**What goes wrong:** App retries 400/401/403 errors that will never succeed, wasting time and user patience
**Why it happens:** Default retry logic retries everything
**How to avoid:** Use conditional retry: `retry: (failureCount, error) => error.status >= 500 && failureCount < 3`
**Warning signs:** Long retry delays on authentication errors, quota exceeded errors

### Pitfall 4: Blocking UI During Sequential API Calls
**What goes wrong:** User sees frozen screen while 3-4 API calls execute sequentially
**Why it happens:** Using synchronous-looking async/await without progress feedback
**How to avoid:** Update progress state after each stage completes. Use TanStack Query's `onMutate` and intermediate callbacks
**Warning signs:** Users reporting "app froze", no visual feedback between stages

### Pitfall 5: Image Upload Content-Type Mismatch
**What goes wrong:** FormData upload fails because server doesn't recognize multipart/form-data
**Why it happens:** Manually setting `Content-Type: multipart/form-data` without boundary, or using wrong header format
**How to avoid:** Let browser set Content-Type automatically when using FormData. Don't manually set the header
**Warning signs:** 415 Unsupported Media Type errors, server receiving empty body

### Pitfall 6: Depth Estimation Without Context
**What goes wrong:** Monocular depth estimation returns relative depth but no absolute scale
**Why it happens:** Single-photo depth models can't know if object is 1m or 10m away without reference
**How to avoid:** Communicate confidence tiers clearly. Use "High confidence" vs "Verify dimensions" labels, not raw percentages
**Warning signs:** Users trusting low-confidence estimates, complaints about inaccurate dimensions

## Code Examples

Verified patterns from official sources:

### Claude Vision Multi-Image Analysis
```typescript
// Source: https://platform.claude.com/docs/en/build-with-claude/vision
import Anthropic from '@anthropic-ai/sdk';

async function analyzeMultipleViews(images: string[]): Promise<EnhancedDimensions> {
  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const contentBlocks = images.flatMap((imageData, index) => [
    { type: "text" as const, text: `Image ${index + 1}:` },
    {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: "image/jpeg" as const,
        data: imageData,
      },
    },
  ]);

  contentBlocks.push({
    type: "text",
    text: "Analyze these images of the same space from different angles. Provide enhanced dimension estimates.",
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: contentBlocks }],
  });

  return parseDimensions(message.content);
}
```

### TanStack Query Retry Configuration
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
import { useMutation, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error.status >= 400 && error.status < 500) return false;
        // Retry up to 3 times on 5xx or network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) =>
        // Exponential backoff: 1s, 2s, 4s, capped at 30s
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Framer Motion Sequence Orchestration
```typescript
// Source: Framer Motion documentation + research synthesis
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export function GeometricAnimation({ stage }: { stage: PipelineStage }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      rotate: [0, 90, 180, 270, 360],
      scale: [1, 1.2, 1, 1.2, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    });
  }, [stage, controls]);

  return (
    <div className="flex items-center justify-center h-48">
      <motion.div
        animate={controls}
        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600"
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      />
    </div>
  );
}
```

### Nano Banana Pro (Gemini 3 Pro Image) Integration
```typescript
// Source: Google Gemini API documentation + research
import { GoogleGenerativeAI } from '@google/genai';

async function generateRenders(
  imageUri: string,
  styles: string[],
  dimensions: Dimensions
): Promise<Render[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image' });

  const renders = await Promise.all(
    styles.slice(0, 3).map(async (style) => {
      const prompt = `Generate a photorealistic render of ${style} style joinery
        in this space. Preserve walls, floor, ceiling. Dimensions: ${dimensions.width}mm × ${dimensions.depth}mm × ${dimensions.height}mm.
        Apply Polytec ${style} finishes realistically.`;

      const result = await model.generateContent({
        contents: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageUri } },
        ],
      });

      const response = await result.response;
      return {
        styleLabel: style,
        imageUrl: response.candidates[0].content.parts[0].inlineData.data,
      };
    })
  );

  return renders;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Query v3/v4 | TanStack Query v5 | 2024 | Unified API across frameworks, better TypeScript, improved devtools |
| Manual FormData boundaries | Native FormData API | Always preferred | Browser handles encoding, no manual header management |
| CSS @keyframes | Framer Motion spring physics | 2020+ | Natural motion, interruption handling, better UX |
| Depth Anything V1 | Depth Anything V2 | June 2024 | 10x faster, more accurate, multiple model sizes |
| Imagen 2 | Nano Banana Pro (Gemini 3 Pro Image) | Nov 2026 | Better text rendering, 8 reference images vs 4, higher resolution |

**Deprecated/outdated:**
- **SWR for mutations:** TanStack Query has superior retry logic and error handling
- **Axios for multipart uploads in Next.js:** Fetch API is native, lighter, sufficient
- **react-query package name:** Renamed to @tanstack/react-query in v5

## Open Questions

Things that couldn't be fully resolved:

1. **Depth Anything V2 API Access**
   - What we know: Model is available via Hugging Face Transformers (Python), open-source on GitHub
   - What's unclear: No official hosted API found. May need to self-host or use Hugging Face Inference API
   - Recommendation: Investigate Hugging Face Inference API or Replicate.com for hosted inference. If not viable, consider using Claude Vision for dimension estimation (less accurate but simpler integration)

2. **Nano Banana Pro Access Method**
   - What we know: Nano Banana Pro is Gemini 3 Pro Image, available in Gemini API
   - What's unclear: Whether `@google/genai` SDK supports `gemini-3-pro-image` model name, or if it's only in Google AI Studio
   - Recommendation: Test with `gemini-3-pro-image` model name. Fall back to `gemini-2.0-flash-image` if unavailable

3. **Pipeline Timeout Strategy**
   - What we know: User expects <30 second total pipeline time
   - What's unclear: Whether to fail fast at 30s or show "taking longer than expected" message
   - Recommendation: Set 30s timeout per stage (not total), show "this is taking longer than usual" after 15s

4. **Dimension Confidence Calculation**
   - What we know: Multiple tiers (Basic/Standard/Enhanced/Precision) with different accuracy targets
   - What's unclear: How to calculate confidence score from single photo vs multiple photos vs LiDAR
   - Recommendation: Start simple: single photo = Basic (±15%), defer multi-photo logic to Phase 04

## Sources

### Primary (HIGH confidence)
- Claude Vision API Documentation: https://platform.claude.com/docs/en/build-with-claude/vision
- TanStack Query Documentation: https://tanstack.com/query/latest/docs/framework/react/overview
- Framer Motion Documentation: (verified via existing package.json integration)
- Depth Anything V2 GitHub: https://github.com/DepthAnything/Depth-Anything-V2

### Secondary (MEDIUM confidence)
- [React Native AI API integration best practices 2026](https://www.callstack.com/blog/announcing-react-native-best-practices-for-ai-agents) - Patterns apply to Capacitor
- [TanStack Query React Query React Native 2026](https://tanstack.com/query/latest/docs/framework/react/react-native) - Confirms full support
- [React Query Retry Strategies](https://www.dhiwise.com/blog/design-converter/react-query-retry-strategies-for-better-error-handling) - Verified with official docs
- [Nano Banana Pro (Gemini 3 Pro Image) Overview](https://wavespeed.ai/blog/posts/google-nano-banana-pro-complete-guide-2026/) - Product announcement
- [Depth Anything V2 Monocular Depth Estimation](https://medium.com/data-science/monocular-depth-estimation-with-depth-anything-v2-54b6775abc9f) - Implementation guide

### Tertiary (LOW confidence - flagged for validation)
- FormData upload patterns: Multiple sources agree, but specific to React Native (adapt for Capacitor)
- Geometric animation patterns: General Framer Motion patterns, need design input for specific aesthetic
- Carousel implementations: FlatList-specific patterns don't apply to web; use Framer Motion drag instead

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - TanStack Query and Framer Motion confirmed, Depth Anything V2 API access unclear
- Architecture: HIGH - Patterns verified with official documentation (Claude, TanStack Query, Framer Motion)
- Pitfalls: MEDIUM - Based on community patterns and common issues, not project-specific experience
- Code examples: HIGH - All examples sourced from official documentation or verified libraries

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days) - AI API landscape evolving, Nano Banana Pro recently launched
