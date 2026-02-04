'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Ruler, Sparkles } from 'lucide-react';
import type { Render, Dimensions } from '@/types/ai-pipeline';

interface RenderCarouselProps {
  renders: Render[];
  dimensions: Dimensions;
  onBack: () => void;
  onCustomize: (render: Render) => void;
}

/**
 * Full-screen swipeable render carousel
 *
 * Displays AI-generated renders in a carousel with:
 * - Spring-based swipe gestures
 * - Pagination dots with active indicator
 * - Style label in header
 * - Dimension display with confidence tier
 * - "Customize this" CTA button
 * - Disclaimer about estimates
 */
export function RenderCarousel({
  renders,
  dimensions,
  onBack,
  onCustomize,
}: RenderCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Swipe threshold for navigation
  const SWIPE_THRESHOLD = 50;

  const currentRender = renders[currentIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      const newIndex = currentIndex + newDirection;
      if (newIndex >= 0 && newIndex < renders.length) {
        setDirection(newDirection);
        setCurrentIndex(newIndex);
      }
    },
    [currentIndex, renders.length]
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // Check if swipe is strong enough
      if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
        if (offset.x > 0) {
          // Swiped right - go to previous
          paginate(-1);
        } else {
          // Swiped left - go to next
          paginate(1);
        }
      }
    },
    [paginate]
  );

  // Format dimensions for display
  const dimensionText = `${dimensions.width} x ${dimensions.depth} x ${dimensions.height}mm`;

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        {/* Style label */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <motion.h1
            key={currentRender?.styleLabel}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-white"
          >
            {currentRender?.styleLabel || 'Loading...'}
          </motion.h1>
        </div>

        {/* Navigation arrows (desktop/tablet) */}
        <div className="flex gap-2">
          <button
            onClick={() => paginate(-1)}
            disabled={currentIndex === 0}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed sm:flex"
            aria-label="Previous render"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => paginate(1)}
            disabled={currentIndex === renders.length - 1}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed sm:flex"
            aria-label="Next render"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Carousel content */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {currentRender?.imageUrl ? (
              <img
                src={currentRender.imageUrl}
                alt={`${currentRender.styleLabel} render`}
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-zinc-800">
                <Sparkles className="h-12 w-12 text-zinc-600" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex flex-col gap-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-8 pt-12">
        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {renders.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to render ${index + 1}`}
            />
          ))}
        </div>

        {/* Dimension badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Ruler className="h-4 w-4 text-white/70" />
            <span className="text-sm text-white/90">{dimensionText}</span>
            <span
              className={`ml-1 text-xs ${
                dimensions.confidence === 'precision' ||
                dimensions.confidence === 'enhanced'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {dimensions.tierLabel}
            </span>
          </div>
        </div>

        {/* Customize CTA */}
        <button
          onClick={() => currentRender && onCustomize(currentRender)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:bg-zinc-200"
        >
          <Sparkles className="h-5 w-5" />
          Customize this
        </button>

        {/* Disclaimer */}
        <p className="text-center text-xs text-white/50">
          Dimensions are estimates. Final measurements confirmed during site visit.
        </p>
      </div>
    </div>
  );
}
