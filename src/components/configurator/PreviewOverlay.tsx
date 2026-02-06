'use client';

import { useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useCabinetStore } from '@/stores/useCabinetStore';

interface PreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function PreviewOverlay({ isOpen, onClose, canvasContainerRef }: PreviewOverlayProps) {
  const dimensions = useCabinetStore((state) => state.config.dimensions);
  const slots = useCabinetStore((state) => state.config.slots);
  const finishes = useCabinetStore((state) => state.config.finishes);
  const dragRef = useRef(false);

  const moduleCount = Array.from(slots.values()).filter((s) => s.module).length;

  // Move canvas into fullscreen overlay on open, hide on close
  const setCanvasFullscreen = useCallback(
    (fullscreen: boolean) => {
      const el = canvasContainerRef.current;
      if (!el) return;
      if (fullscreen) {
        el.style.position = 'fixed';
        el.style.inset = '0';
        el.style.left = '0';
        el.style.zIndex = '50';
        el.style.visibility = 'visible';
      } else {
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        el.style.inset = '';
        el.style.zIndex = '';
        el.style.visibility = 'hidden';
      }
    },
    [canvasContainerRef]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence
      onExitComplete={() => setCanvasFullscreen(false)}
    >
      {isOpen && (
        <motion.div
          key="preview-overlay"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onAnimationStart={() => setCanvasFullscreen(true)}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 3D canvas occupies full area (managed via ref) */}
          <div className="flex-1" />

          {/* Summary strip at bottom */}
          <div className="px-4 py-3 bg-black/60 backdrop-blur-sm">
            <p className="text-sm text-white/80 text-center">
              {finishes.material || 'No material'} &middot; {dimensions.width}mm W &middot; {moduleCount} module{moduleCount !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
