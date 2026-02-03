# Research: Technology Stack

## Investigation Focus

How to build a mobile-first, AI-powered configurator with photo capture, 3D visualization, and real-time pricing.

---

## 1. Mobile Deployment Strategy

### Capacitor 8 vs React Native vs Flutter

| Aspect | Capacitor 8 | React Native | Flutter |
|--------|-------------|--------------|---------|
| Web compatibility | Native (same codebase) | Requires separate web build | Requires separate web build |
| Learning curve | Low (React + web skills) | Medium (React Native specifics) | High (Dart language) |
| WebGL/Three.js | Full support | Requires bridges | Custom implementation |
| Camera access | Native plugin | Native module | Native plugin |
| Bundle size | Smaller (web-based) | Medium | Larger |
| Performance | Near-native for UI | Native | Native |

**Recommendation:** Capacitor 8

- Single codebase for Web + iOS + Android
- Full Three.js/WebGL support without bridges
- Team can use existing React/Next.js skills
- PWA works immediately while native apps go through review

### Capacitor Configuration

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'au.com.nscarpentry.app',
  appName: 'North South Carpentry',
  webDir: 'out', // Next.js static export
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};
```

### Required Plugins

- `@capacitor/camera` — Photo capture and gallery
- `@capacitor/push-notifications` — Native push
- `@capacitor/splash-screen` — Launch screen
- `@capacitor/keyboard` — Keyboard handling
- `@capacitor/haptics` — Touch feedback
- `@capacitor/share` — Native sharing
- `@capacitor/status-bar` — Status bar control
- `@capacitor/browser` — In-app browser

---

## 2. Next.js 14 Configuration

### Static Export for Capacitor

```javascript
// next.config.ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true // No server-side image optimization
  },
  trailingSlash: true // Better for static hosting
};
```

### Considerations

- No API routes in static export — use Convex for backend
- No SSR — all pages statically generated
- Dynamic routes need `generateStaticParams()`
- Images served unoptimized (handle on CDN or client)

---

## 3. Backend: Convex Analysis

### Why Convex Over Alternatives

| Feature | Convex | Supabase | Firebase |
|---------|--------|----------|----------|
| Real-time | Built-in (default) | Requires subscriptions | Built-in |
| Type safety | End-to-end TypeScript | Partial | Partial |
| Serverless functions | Integrated | Separate (Edge Functions) | Separate (Cloud Functions) |
| File storage | Built-in | Built-in | Built-in |
| Transactions | Automatic | Manual | Limited |
| Pricing | Usage-based | Tiered | Usage-based |
| Cold starts | None | Minimal | Can be slow |

**Recommendation:** Convex

- Real-time by default (perfect for configurator updates)
- Type-safe end-to-end (reduces bugs)
- Serverless functions co-located with data
- Built-in file storage for photos, specs, renders
- No cold starts (consistent performance)

### Schema Design Pattern

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
  }).index('by_email', ['email']),
  
  designs: defineTable({
    userId: v.id('users'),
    productType: v.string(),
    config: v.any(), // JSON configuration
    status: v.string(),
    renders: v.array(v.string()),
  }).index('by_user', ['userId']),
});
```

---

## 4. 3D Configurator Technology

### Three.js + React Three Fiber

**Why R3F over raw Three.js:**
- Declarative React syntax
- Automatic cleanup/disposal
- Integration with React state
- Large ecosystem (@react-three/drei helpers)

### Performance Optimization Strategies

1. **Level of Detail (LOD)**
   - High-poly models when zoomed in
   - Simplified geometry when zoomed out
   - Automatic switching based on camera distance

2. **Instancing**
   - Reuse geometry for repeated elements (hinges, handles)
   - Single draw call for multiple instances

3. **Texture Atlasing**
   - Combine material textures into atlas
   - Reduce texture swaps

4. **Frustum Culling**
   - Don't render off-screen elements
   - Built into Three.js, ensure enabled

5. **Mobile-Specific**
   - Reduce shadow quality on mobile
   - Lower anti-aliasing on lower-end devices
   - Consider 720p render resolution scaled up

### Example Setup

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

function Configurator() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      dpr={[1, 2]} // Adaptive pixel ratio
      performance={{ min: 0.5 }} // Allow quality reduction
    >
      <Environment preset="apartment" />
      <CabinetModel config={config} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      />
    </Canvas>
  );
}
```

---

## 5. AI Integration Architecture

### Service Separation

| Service | Model | Purpose | Latency Target |
|---------|-------|---------|----------------|
| Chat | Gemini 3.0 Flash | Initial qualification | < 2s |
| Space Analysis | Claude Vision | Extract features, dimensions | < 5s |
| Depth Estimation | Depth Anything V2 | Monocular depth map | < 3s |
| Render Generation | Nano Banana Pro | Photorealistic renders | < 15s |

### Pipeline Flow

```
Photo Upload
    ↓
[Parallel]
├── Claude Vision: Space analysis
│   → dimensions, features, style
└── Depth Anything V2: Depth map
    → refined dimensions
    ↓
[Sequential]
Style Classification
    → select 3 render styles
    ↓
[Parallel x3]
Nano Banana Pro: Generate renders
    ↓
Compositing
    → blend into original photo
    ↓
Display (< 30s total)
```

### Error Handling

- Timeout: 45 seconds max, show error + retry
- Quality check: Reject renders that don't match style
- Fallback: Show gallery of similar projects if pipeline fails

---

## 6. Authentication Strategy

### Convex Auth Options

1. **Built-in Convex Auth**
   - Email/password
   - Magic links
   - OAuth providers
   - Simple setup

2. **Clerk Integration**
   - More UI components
   - Social logins
   - Multi-factor auth
   - Higher cost

**Recommendation:** Convex Auth for MVP

- Sufficient for email/password and magic links
- No additional cost
- Can migrate to Clerk later if needed

### Guest Mode Implementation

```typescript
// Allow configurator use without auth
// Prompt for account on save/submit
const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(true);
  
  const requireAuth = (action: string) => {
    if (isGuest) {
      showAuthPrompt(`Sign up to ${action}`);
      return false;
    }
    return true;
  };
  
  return { isGuest, requireAuth };
};
```

---

## 7. File Storage Strategy

### Convex Files

- Automatic CDN distribution
- Type-safe file references
- Integrated with database

### File Types

| Type | Max Size | Format | Retention |
|------|----------|--------|-----------|
| Customer photos | 10MB | JPEG, PNG, HEIC | Permanent |
| AI renders | 5MB | PNG | Permanent |
| Production specs | 2MB | PDF, CSV | Permanent |
| Progress photos | 5MB | JPEG | Permanent |

### Upload Pattern

```typescript
// Convex mutation
export const uploadPhoto = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    // Trigger AI pipeline
    await ctx.scheduler.runAfter(0, internal.ai.analyzePhoto, { 
      storageId, 
      url 
    });
  }
});
```

---

## 8. Analytics & Monitoring

### PostHog Recommendation

- Product analytics
- Feature flags
- Session recordings
- Funnel tracking
- Self-hostable option

### Key Events to Track

```typescript
// Core funnel
posthog.capture('photo_uploaded');
posthog.capture('renders_displayed', { renderTime: ms });
posthog.capture('configurator_started');
posthog.capture('configurator_step_completed', { step: 1-4 });
posthog.capture('quote_submitted');
posthog.capture('order_confirmed');

// Engagement
posthog.capture('design_saved');
posthog.capture('design_shared');
posthog.capture('chat_opened');
```

---

## 9. Performance Benchmarks

### Target Metrics

| Metric | Target | Critical? |
|--------|--------|-----------|
| First Contentful Paint | < 1.5s | Yes |
| Largest Contentful Paint | < 2.5s | Yes |
| Time to Interactive | < 3s | Yes |
| Cumulative Layout Shift | < 0.1 | Yes |
| 3D Frame Rate | > 30 FPS | Yes |
| Photo-to-Render | < 30s | Yes |

### Testing Protocol

1. **Devices**
   - iPhone 12 (baseline iOS)
   - iPhone 14 Pro (high-end iOS)
   - Pixel 6 (baseline Android)
   - Samsung Galaxy S23 (high-end Android)

2. **Network Conditions**
   - Fast 4G (10 Mbps)
   - Slow 4G (3 Mbps)
   - 3G (1 Mbps)

3. **Tools**
   - Lighthouse (automated)
   - WebPageTest (network simulation)
   - Chrome DevTools Performance (profiling)
   - Xcode Instruments (iOS profiling)
   - Android Studio Profiler (Android profiling)

---

## 10. Recommended Dependencies

### Core

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@capacitor/core": "8.x",
    "@capacitor/camera": "8.x",
    "@capacitor/haptics": "8.x",
    "convex": "latest",
    "@react-three/fiber": "8.x",
    "@react-three/drei": "9.x",
    "three": "0.160.x",
    "framer-motion": "11.x",
    "posthog-js": "latest"
  }
}
```

### Development

```json
{
  "devDependencies": {
    "typescript": "5.x",
    "@types/react": "18.x",
    "@types/three": "0.160.x",
    "tailwindcss": "3.x",
    "eslint": "8.x",
    "prettier": "3.x"
  }
}
```
