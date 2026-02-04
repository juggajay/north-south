/**
 * Before/After Comparison Slider
 * Phase 04-09: Version History, Before/After, LOD
 *
 * Features:
 * - Swipeable slider revealing AI render vs 3D configurator
 * - Drag handle with visual indicator
 * - Smooth Framer Motion animations
 * - Works with any two images/components
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MoveHorizontal } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface BeforeAfterSliderProps {
  /** "Before" image (typically AI render) */
  beforeImage: string;
  /** "After" image (typically 3D configurator screenshot) */
  afterImage: string;
  /** Optional before label */
  beforeLabel?: string;
  /** Optional after label */
  afterLabel?: string;
  /** Initial slider position (0-100, default 50) */
  initialPosition?: number;
  /** Container class name */
  className?: string;
}

interface BeforeAfterToggleProps {
  /** Current mode */
  mode: 'before' | 'after';
  /** Change handler */
  onModeChange: (mode: 'before' | 'after') => void;
  /** Optional labels */
  beforeLabel?: string;
  afterLabel?: string;
}

// ============================================================================
// BEFORE/AFTER SLIDER
// ============================================================================

/**
 * Before/After comparison slider with drag interaction
 *
 * Usage:
 * - Drag the center handle to reveal more of before or after
 * - Works with AI renders and 3D screenshots
 * - Responsive to container size
 *
 * @param beforeImage - "Before" image URL (AI render)
 * @param afterImage - "After" image URL (3D configurator)
 * @param beforeLabel - Optional label for before image
 * @param afterLabel - Optional label for after image
 * @param initialPosition - Initial slider position (0-100)
 * @param className - Container class name
 *
 * @example
 * ```tsx
 * <BeforeAfterSlider
 *   beforeImage={aiRender.url}
 *   afterImage={configuratorScreenshot}
 *   beforeLabel="AI Render"
 *   afterLabel="3D Configurator"
 * />
 * ```
 */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initialPosition = 50,
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [containerWidth, setContainerWidth] = useState(0);

  // Motion value for smooth dragging
  const x = useMotionValue(0);
  const clipPercentage = useTransform(x, (value) => {
    if (!containerWidth) return sliderPosition;
    const percentage = (value / containerWidth) * 100;
    return Math.max(0, Math.min(100, sliderPosition + percentage));
  });

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!containerWidth) return;

    // Calculate new position based on drag offset
    const deltaPercentage = (info.offset.x / containerWidth) * 100;
    const newPosition = Math.max(0, Math.min(100, sliderPosition + deltaPercentage));

    setSliderPosition(newPosition);
    x.set(0); // Reset motion value
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg',
        'select-none touch-none',
        className
      )}
    >
      {/* After image (background - always visible) */}
      <div className="relative aspect-video w-full">
        <img
          src={afterImage}
          alt={afterLabel}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* After label */}
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>

      {/* Before image (foreground - clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* Before label */}
        <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
          {beforeLabel}
        </div>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 h-full w-0.5 bg-white shadow-lg"
        style={{
          left: `${sliderPosition}%`,
        }}
      />

      {/* Drag handle */}
      <motion.div
        drag="x"
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          x,
          left: `${sliderPosition}%`,
        }}
        className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-primary">
          <MoveHorizontal className="h-5 w-5 text-primary" />
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// BEFORE/AFTER TOGGLE (SIMPLE MODE)
// ============================================================================

/**
 * Simple toggle between before/after (no slider)
 *
 * Usage:
 * - Tap to switch between before and after views
 * - Good for quick comparisons without slider complexity
 *
 * @param mode - Current mode ('before' or 'after')
 * @param onModeChange - Callback when mode changes
 * @param beforeLabel - Optional label for before mode
 * @param afterLabel - Optional label for after mode
 *
 * @example
 * ```tsx
 * const [mode, setMode] = useState<'before' | 'after'>('before');
 * <BeforeAfterToggle mode={mode} onModeChange={setMode} />
 * ```
 */
export function BeforeAfterToggle({
  mode,
  onModeChange,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterToggleProps) {
  return (
    <div className="flex gap-2 rounded-lg border border-border bg-card p-1">
      <button
        onClick={() => onModeChange('before')}
        className={cn(
          'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          mode === 'before'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {beforeLabel}
      </button>
      <button
        onClick={() => onModeChange('after')}
        className={cn(
          'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          mode === 'after'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {afterLabel}
      </button>
    </div>
  );
}
