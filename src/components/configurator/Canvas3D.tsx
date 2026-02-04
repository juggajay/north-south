/**
 * Canvas3D wrapper with mobile performance optimizations
 * Phase 04-01: R3F Foundation
 *
 * Features:
 * - Adaptive DPR (1-1.5) based on device performance
 * - Demand frameloop (render only when needed)
 * - Performance monitoring with automatic degradation
 * - Mobile-optimized settings (no AA, high-performance WebGL)
 * - Touch-action: none for gesture handling
 */

'use client';

import { Canvas } from '@react-three/fiber';
import { Html, PerformanceMonitor } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Canvas3DProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading 3D...</p>
      </div>
    </Html>
  );
}

// ============================================================================
// CANVAS3D COMPONENT
// ============================================================================

/**
 * Canvas3D wrapper with mobile-first performance settings
 *
 * @param children - 3D scene content
 * @param className - Optional Tailwind classes for container
 *
 * @example
 * ```tsx
 * <Canvas3D className="h-[400px]">
 *   <mesh>
 *     <boxGeometry args={[1, 1, 1]} />
 *     <meshStandardMaterial color="orange" />
 *   </mesh>
 * </Canvas3D>
 * ```
 */
export function Canvas3D({ children, className }: Canvas3DProps) {
  const [dpr, setDpr] = useState<number>(1.5);

  return (
    <div
      className={cn('touch-action-none', className)}
      style={{ touchAction: 'none' }}
    >
      <Canvas
        // Device pixel ratio: cap at 1.5 for mobile performance
        dpr={[1, dpr]}
        // WebGL settings
        gl={{
          powerPreference: 'high-performance',
          antialias: false, // Disabled for mobile perf
        }}
        // Render only when invalidated (saves battery)
        frameloop="demand"
        // Camera: 3/4 view per CONTEXT.md
        camera={{
          position: [2, 1, 3],
          fov: 50,
        }}
      >
        <Suspense fallback={<Loader />}>
          <PerformanceMonitor
            // Increase DPR if performance is good
            onIncline={() => setDpr(1.5)}
            // Decrease DPR if performance degrades
            onDecline={() => setDpr(1)}
          >
            {/* Basic lighting setup */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* User content */}
            {children}
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </div>
  );
}
