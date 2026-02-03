# Phase 01 Context — Foundation Setup

## Implementation Decisions

These decisions were captured during `/gsd:discuss-phase 1` to guide planning and execution.

---

### Project Structure

**Decision:** Monorepo with clear separation

```
nsc-app/
├── app/                    # Next.js App Router pages
│   ├── (tabs)/             # Tab navigation layout
│   │   ├── home/           # Camera entry, landing
│   │   ├── design/         # Saved designs
│   │   ├── orders/         # Order tracking
│   │   └── chat/           # AI chat
│   ├── configure/[id]/     # Configurator wizard
│   └── layout.tsx          # Root layout
├── components/             # Reusable UI components
│   ├── ui/                 # Base components (Button, Sheet, etc.)
│   ├── camera/             # Camera capture components
│   ├── configurator/       # 3D viewport, module sheets
│   └── renders/            # Render display components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, constants
├── convex/                 # Backend (schema, functions, queries)
├── ios/                    # Capacitor iOS project
├── android/                # Capacitor Android project
└── public/                 # Static assets
```

---

### Convex Schema Decisions

**Users Table:**
- Minimal fields for MVP: id, email, name, phone (optional)
- Address stored only when needed (quote submission)
- Index on email for lookups

**Designs Table:**
- Config stored as JSON blob (flexible for iteration)
- Renders stored as array of file IDs
- Status enum: draft | saved | submitted | quoted | ordered

**Authentication:**
- Convex Auth for MVP (email/password + magic links)
- Guest mode: designs saved to localStorage until sign-up
- On sign-up: migrate localStorage designs to account

---

### Capacitor Configuration

**App ID:** `au.com.nscarpentry.app`
**Display Name:** "North South Carpentry"
**Web Directory:** `out` (Next.js static export)

**Plugins to install:**
- @capacitor/camera
- @capacitor/push-notifications
- @capacitor/splash-screen
- @capacitor/keyboard
- @capacitor/haptics
- @capacitor/share
- @capacitor/status-bar
- @capacitor/browser

**iOS Permissions:**
- NSCameraUsageDescription: "Take photos of your space for design visualization"
- NSPhotoLibraryUsageDescription: "Select photos of your space"

**Android Permissions:**
- android.permission.CAMERA
- android.permission.READ_EXTERNAL_STORAGE

---

### Next.js Configuration

**output:** 'export' (static generation only)
**images.unoptimized:** true (no server-side optimization)
**trailingSlash:** true (better for static hosting)

**Environment Variables:**
- NEXT_PUBLIC_CONVEX_URL
- NEXT_PUBLIC_POSTHOG_KEY
- CONVEX_DEPLOY_KEY (CI only)

---

### Styling Approach

**Framework:** Tailwind CSS
**Component Library:** Build custom, inspired by shadcn/ui patterns
**Animation:** Framer Motion
**3D:** React Three Fiber + Drei helpers

**Color Tokens:**
```css
--primary: navy (#1a365d)
--secondary: warm white (#faf9f7)
--accent: brass (#b8860b)
--success: green (#38a169)
--warning: amber (#d69e2e)
--error: red (#e53e3e)
```

---

### Testing Strategy

**Unit Tests:** Vitest for utilities and hooks
**Component Tests:** Testing Library
**E2E Tests:** Playwright (deferred to Phase 2)
**Manual Testing:** Real devices (iPhone 12, Pixel 6)

---

### CI/CD Pipeline

**Platform:** GitHub Actions

**Workflows:**
1. `lint-test.yml` — Run on all PRs
2. `deploy-preview.yml` — Deploy to Vercel preview on PR
3. `deploy-prod.yml` — Deploy to Vercel prod on main merge
4. `build-ios.yml` — Build iOS via Fastlane (manual trigger)
5. `build-android.yml` — Build Android via Fastlane (manual trigger)

---

### Questions Resolved

| Question | Answer |
|----------|--------|
| Use Clerk or Convex Auth? | Convex Auth — simpler, no extra cost |
| TypeScript strict mode? | Yes, strict: true |
| CSS-in-JS or Tailwind? | Tailwind — simpler, better performance |
| State management? | React Query + Convex — no Redux needed |
| Form library? | React Hook Form with Zod validation |

---

### Deferred Decisions

- Push notification implementation details (Phase 07)
- Exact material texture assets (Phase 05)
- Production spec CSV column order (Phase 08)
