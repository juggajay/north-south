# Phase 02: Mobile UI Shell - Research

**Researched:** 2026-02-04
**Domain:** Mobile UI Components (Navigation, Camera, Chat, Image Validation)
**Confidence:** MEDIUM

## Summary

This research covers five key domains for the Mobile UI Shell phase: bottom tab navigation with badge indicators, camera capture with Capacitor, client-side image quality validation (blur/brightness detection), AI chat integration with Google Gemini, and the press-and-hold shutter gesture pattern.

The project already has a solid foundation with Framer Motion, Capacitor Camera plugin, and Convex backend. The key additions needed are: client-side image quality detection using Canvas API and Laplacian variance for blur detection, the @google/genai SDK for Gemini chat, and press-and-hold gesture implementation using Framer Motion's `onTapStart`/`onTapCancel` with timers.

**Primary recommendation:** Use client-side Canvas-based blur detection (Laplacian variance) and brightness analysis to validate images immediately after capture, avoiding API costs and latency. For chat, use @google/genai SDK with `ai.chats.create()` for conversation management with system instructions to enforce product-knowledge boundaries.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @capacitor/camera | 8.0.0 | Camera capture & gallery selection | Official Capacitor plugin, already installed |
| framer-motion | 12.30.1 | Gestures, animations, bottom sheet | Already used for BottomSheet, industry standard |
| lucide-react | 0.563.0 | Icons including camera, badges | Already installed, consistent with project |

### New Additions
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @google/genai | latest | Gemini 3.0 Flash chat integration | Official Google SDK, replaces deprecated @google/generative-ai |

### No Additional Libraries Needed For
| Feature | Approach | Why |
|---------|----------|-----|
| Blur detection | Canvas API + Laplacian variance | Client-side, no external deps, proven algorithm |
| Brightness detection | Canvas API pixel analysis | Simple RGB averaging, no library needed |
| Press-and-hold gesture | Framer Motion onTapStart/onTapCancel + timers | Already have framer-motion |
| Badge indicators | Custom CSS + state | Simple enough, no library overhead |
| Tab navigation | Already implemented | BottomNav.tsx exists |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side blur detection | Sightengine API | API costs, latency, requires internet - NOT recommended for real-time capture flow |
| @google/genai | @google/generative-ai | Legacy SDK, no longer receiving Gemini 2.0+ features - use new SDK |
| Custom image validation | TensorFlow.js | Overkill, larger bundle, unnecessary complexity |

**Installation:**
```bash
npm install @google/genai
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── camera/
│   │   ├── CameraCapture.tsx       # Full-screen camera interface
│   │   ├── CaptureButton.tsx       # Press-and-hold shutter with ring
│   │   ├── GuidanceOverlay.tsx     # Corner brackets + rotating tips
│   │   └── PhotoPreview.tsx        # Preview with Use/Retake options
│   ├── chat/
│   │   ├── ChatInterface.tsx       # Chat UI container
│   │   ├── ChatMessage.tsx         # Individual message bubble
│   │   └── ChatInput.tsx           # Text input with send
│   ├── navigation/
│   │   ├── BottomNav.tsx           # Already exists - add badge support
│   │   └── TabBadge.tsx            # Red dot / number badge component
│   └── ui/
│       └── bottom-sheet.tsx        # Already exists
├── lib/
│   ├── image-quality.ts            # Blur & brightness detection utilities
│   ├── gemini.ts                   # Gemini client configuration
│   └── camera.ts                   # Capacitor camera wrapper
└── convex/
    └── chat.ts                     # Chat mutations/queries
```

### Pattern 1: Press-and-Hold Shutter Button
**What:** A button that requires holding for 1 second to capture, showing circular progress
**When to use:** Camera capture to prevent accidental shots
**Example:**
```typescript
// Source: Framer Motion docs + hold-to-confirm pattern
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useRef } from "react";

const HOLD_DURATION = 1000; // 1 second

export function CaptureButton({ onCapture }: { onCapture: () => void }) {
  const [state, setState] = useState<"idle" | "holding" | "complete">("idle");
  const progress = useMotionValue(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  // Transform progress (0-1) to SVG stroke offset
  const circumference = 2 * Math.PI * 40; // radius 40
  const strokeDashoffset = useTransform(
    progress,
    [0, 1],
    [circumference, 0]
  );

  const handleTapStart = () => {
    setState("holding");
    animationRef.current = animate(progress, 1, {
      duration: HOLD_DURATION / 1000,
      ease: "linear",
      onComplete: () => {
        setState("complete");
        onCapture();
      },
    });
  };

  const handleTapEnd = () => {
    animationRef.current?.stop();
    progress.set(0);
    setState("idle");
  };

  return (
    <motion.button
      onTapStart={handleTapStart}
      onTap={handleTapEnd}
      onTapCancel={handleTapEnd}
      className="relative h-20 w-20 touch-none"
      style={{ touchAction: "none" }}
    >
      {/* Background circle */}
      <div className="absolute inset-2 rounded-full bg-white/90" />

      {/* Progress ring */}
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88">
        <motion.circle
          cx="44"
          cy="44"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          className="text-zinc-900"
        />
      </svg>
    </motion.button>
  );
}
```

### Pattern 2: Client-Side Blur Detection (Laplacian Variance)
**What:** Calculate image sharpness using Laplacian operator variance
**When to use:** Image quality validation after capture
**Example:**
```typescript
// Source: Laplacian variance method (computer vision standard)
export function detectBlur(imageData: ImageData): number {
  const { data, width, height } = imageData;

  // Convert to grayscale first
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Apply Laplacian kernel: [0, 1, 0], [1, -4, 1], [0, 1, 0]
  const laplacian: number[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap =
        gray[idx - width] +      // top
        gray[idx - 1] +          // left
        -4 * gray[idx] +         // center
        gray[idx + 1] +          // right
        gray[idx + width];       // bottom
      laplacian.push(lap);
    }
  }

  // Calculate variance
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
  const variance = laplacian.reduce((acc, val) => acc + (val - mean) ** 2, 0) / laplacian.length;

  return variance;
}

// Threshold is domain-dependent; 100-150 is a common starting point
const BLUR_THRESHOLD = 100;
export const isBlurry = (variance: number) => variance < BLUR_THRESHOLD;
```

### Pattern 3: Brightness Detection
**What:** Calculate average image brightness from pixel data
**When to use:** Detect underexposed/overexposed images
**Example:**
```typescript
// Source: Canvas API pixel analysis pattern
export function detectBrightness(imageData: ImageData): number {
  const { data } = imageData;
  let sum = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    // Average RGB values (simplified brightness)
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  return sum / pixelCount; // 0-255 scale
}

// Thresholds for under/overexposure
const MIN_BRIGHTNESS = 50;  // Below this = underexposed
const MAX_BRIGHTNESS = 220; // Above this = overexposed

export function getBrightnessIssue(brightness: number): string | null {
  if (brightness < MIN_BRIGHTNESS) {
    return "underexposed";
  }
  if (brightness > MAX_BRIGHTNESS) {
    return "overexposed";
  }
  return null;
}
```

### Pattern 4: Gemini Chat with System Instructions
**What:** Configure Gemini for product-knowledge-only chat with personality
**When to use:** Chat tab AI responses
**Example:**
```typescript
// Source: @google/genai SDK documentation
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a knowledgeable tradesperson who specializes in custom cabinetry and joinery. You work for North South Carpentry.

Your expertise covers:
- Materials (Polytec finishes, timber veneers, laminates)
- Hardware (Blum hinges, drawer systems, soft-close mechanisms)
- Pricing questions about cabinetry components
- Joinery options and construction methods

Your personality:
- Friendly expert who genuinely knows and loves materials
- Use phrases like "That Polytec finish is great for kitchens, handles moisture well"
- Practical, helpful, no unnecessary jargon

STRICT BOUNDARY: You can ONLY discuss joinery, materials, hardware, and cabinetry.
For ANY off-topic question, respond EXACTLY: "I can only help with joinery and materials. What would you like to know about your project?"
Do not engage with politics, general knowledge, or topics outside cabinetry.`;

export async function createChatSession(ai: GoogleGenAI) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1.0, // Google recommends keeping at 1.0 for Gemini 3
    },
    history: [],
  });

  return chat;
}

// Send message and get response
export async function sendMessage(
  chat: Awaited<ReturnType<typeof createChatSession>>,
  message: string
) {
  const response = await chat.sendMessage({ message });
  return response.text;
}
```

### Pattern 5: Badge Indicator Component
**What:** Red dot or number badge for tab navigation
**When to use:** Unread messages (Chat), order updates (Orders)
**Example:**
```typescript
// Source: React Navigation patterns + custom implementation
interface TabBadgeProps {
  count?: number;
  showDot?: boolean;
}

export function TabBadge({ count, showDot }: TabBadgeProps) {
  if (!count && !showDot) return null;

  if (showDot) {
    return (
      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
    );
  }

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
```

### Anti-Patterns to Avoid
- **Server-side image validation for capture flow:** Adds latency, requires network, poor UX for real-time capture
- **Manual conversation history management:** Use SDK's built-in chat state management
- **Separate blur and brightness API calls:** Process in one canvas pass for efficiency
- **onClick for mobile capture:** Use Framer Motion gestures for proper touch handling
- **Large image processing:** Downscale to ~1024px before quality analysis for speed

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blur detection algorithm | Custom edge detection | Laplacian variance | Standard computer vision, well-documented thresholds |
| Camera permissions | Manual Capacitor.requestPermissions | @capacitor/camera checkPermissions/requestPermissions | Handles platform differences (iOS limited library, Android photo picker) |
| Chat conversation state | Manual history array | ai.chats.create() | SDK handles history appending, role assignment |
| Touch gesture detection | Raw pointer events | Framer Motion onTapStart/onTap/onTapCancel | Handles touch vs mouse, proper cancellation |
| Image EXIF orientation | Manual rotation logic | Capacitor Camera correctOrientation: true | Handles portrait mode automatically |

**Key insight:** Client-side image quality validation is achievable with Canvas API - no need for third-party APIs (Sightengine, Cloudinary) which add cost, latency, and offline failure modes.

## Common Pitfalls

### Pitfall 1: Camera Activity Termination (Android)
**What goes wrong:** Camera opens, user takes photo, Android kills your app due to memory pressure, returns to blank state
**Why it happens:** Android aggressively manages memory for camera operations
**How to avoid:** Listen for `appRestoredResult` event in Capacitor App plugin to recover captured image
**Warning signs:** Users reporting "photo disappeared" or blank screens after capture on Android

### Pitfall 2: Press-and-Hold on Touch Devices
**What goes wrong:** Touch events don't trigger, or trigger alongside scroll
**Why it happens:** Browser interprets touch as scroll gesture
**How to avoid:** Set `touch-action: none` CSS on the capture button element
**Warning signs:** Button works on desktop but not mobile, or triggers scroll instead of hold

### Pitfall 3: Image Quality Thresholds Too Strict/Lenient
**What goes wrong:** Good photos rejected, or blurry photos accepted
**Why it happens:** Laplacian variance thresholds are domain-specific
**How to avoid:** Start with threshold ~100 for blur, test with real cabinetry photos, adjust based on feedback
**Warning signs:** Users complaining about "good photos being rejected" or reviews showing accepted blurry images

### Pitfall 4: Gemini Off-Topic Boundary Enforcement
**What goes wrong:** Chat answers questions about weather, politics, etc.
**Why it happens:** System instructions not strict enough, or temperature too high
**How to avoid:** Use explicit "respond EXACTLY with this phrase" for off-topic, keep temperature at 1.0 (Google recommendation)
**Warning signs:** Chat logs showing non-cabinetry conversations

### Pitfall 5: Base64 Memory Issues
**What goes wrong:** App crashes or freezes after photo capture
**Why it happens:** Using CameraResultType.Base64 with full-resolution images
**How to avoid:** Use CameraResultType.Uri, only convert to base64 when needed (quality check), downscale before processing
**Warning signs:** Memory warnings in dev tools, crashes on older devices

### Pitfall 6: Blocking UI During Quality Check
**What goes wrong:** User sees frozen preview while quality validation runs
**Why it happens:** Synchronous canvas operations on main thread
**How to avoid:** Show "Checking quality..." state, process asynchronously, or use Web Worker for heavy computation
**Warning signs:** Preview screen feels laggy, ANR (Application Not Responding) on Android

## Code Examples

Verified patterns from official sources:

### Camera Capture with Capacitor
```typescript
// Source: https://capacitorjs.com/docs/apis/camera
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export async function capturePhoto() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    correctOrientation: true,
    width: 2048, // Limit dimensions
    height: 2048,
  });

  return image.webPath; // Use for display and processing
}

export async function selectFromGallery() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    correctOrientation: true,
  });

  return image.webPath;
}
```

### Image Quality Validation Pipeline
```typescript
// Combined blur and brightness check
export async function validateImageQuality(
  imageUrl: string
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Load image
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });

  // Create canvas and get pixel data (downscale for performance)
  const maxSize = 1024;
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Check blur
  const blurVariance = detectBlur(imageData);
  if (blurVariance < 100) {
    issues.push("Image sharpness: Low. Tip: Ensure good lighting and hold phone steady.");
  }

  // Check brightness
  const brightness = detectBrightness(imageData);
  if (brightness < 50) {
    issues.push("Image brightness: Low. Tip: Move to a well-lit area or turn on lights.");
  } else if (brightness > 220) {
    issues.push("Image brightness: High. Tip: Avoid direct sunlight or bright lights in frame.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
```

### Gemini Chat Integration with Convex
```typescript
// convex/chat.ts - Server-side Gemini integration
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

export const sendChatMessage = action({
  args: {
    userId: v.id("users"),
    message: v.string(),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Get or create conversation history
    const history = args.conversationId
      ? await ctx.runQuery(internal.chat.getHistory, { conversationId: args.conversationId })
      : [];

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.0,
      },
      history,
    });

    const response = await chat.sendMessage({ message: args.message });

    // Store messages
    await ctx.runMutation(internal.chat.storeMessages, {
      conversationId: args.conversationId,
      userId: args.userId,
      userMessage: args.message,
      assistantMessage: response.text,
    });

    return response.text;
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @google/generative-ai SDK | @google/genai SDK | 2024-2025 | New SDK supports Gemini 2.0+, old SDK deprecated June 2026 |
| model.startChat() | ai.chats.create() | 2025 | New API pattern in @google/genai |
| Server-side image validation APIs | Client-side Canvas analysis | Current | No API costs, works offline, lower latency |
| onClick for mobile buttons | Framer Motion gestures | Current | Better touch handling, proper gesture cancellation |

**Deprecated/outdated:**
- `@google/generative-ai`: Being sunset June 24, 2026, missing Gemini 2.0+ features
- `@google-cloud/vertexai`: Also deprecated in favor of `@google/genai`

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal Blur Threshold for Cabinetry Photos**
   - What we know: Laplacian variance ~100 is a common starting point
   - What's unclear: Exact threshold for room/cabinet photos specifically
   - Recommendation: Start at 100, collect real data, tune based on user feedback

2. **Gemini 3.0 Flash Rate Limits**
   - What we know: Gemini has rate limits per model
   - What's unclear: Exact limits for gemini-3-flash-preview in production
   - Recommendation: Implement client-side rate limiting, queue messages if needed

3. **Framing Detection (Is Subject Centered)**
   - What we know: User mentioned detecting framing quality
   - What's unclear: Whether edge detection can reliably detect "wall centered in frame"
   - Recommendation: Defer framing detection; blur and brightness are more impactful and reliable

## Sources

### Primary (HIGH confidence)
- Capacitor Camera Plugin docs - https://capacitorjs.com/docs/apis/camera
- Google GenAI SDK GitHub - https://github.com/googleapis/js-genai
- Firebase AI Logic Chat docs - https://firebase.google.com/docs/ai-logic/chat
- Framer Motion Gestures docs - https://motion.dev/motion/gestures/

### Secondary (MEDIUM confidence)
- Sightengine Image Quality docs - https://sightengine.com/docs/image-quality-detection
- Laplacian blur detection articles (multiple sources agree on approach)
- Canvas brightness detection gists - https://gist.github.com/vincentorback/011ef128acfbf846b825

### Tertiary (LOW confidence)
- Specific Laplacian threshold values (domain-dependent, needs validation)
- Gemini 3.0 Flash model availability (verify model ID when implementing)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries, well-documented
- Architecture: HIGH - Patterns derived from official docs
- Image quality detection: MEDIUM - Algorithm solid, thresholds need tuning
- Gemini integration: MEDIUM - SDK documented but model ID may vary
- Press-and-hold pattern: HIGH - Framer Motion gestures well-documented

**Research date:** 2026-02-04
**Valid until:** 2026-02-18 (2 weeks - Gemini SDK evolving rapidly)
