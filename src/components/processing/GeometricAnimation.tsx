'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { PipelineStage } from '@/types/ai-pipeline';

interface GeometricAnimationProps {
  stage: PipelineStage;
}

/**
 * Color schemes per stage - gradient progression through the pipeline
 * Blue -> Violet -> Pink -> Amber -> Emerald (completion)
 */
const STAGE_COLORS: Record<PipelineStage, { from: string; to: string }> = {
  analyzing: { from: '#3b82f6', to: '#8b5cf6' }, // blue to violet
  measuring: { from: '#8b5cf6', to: '#ec4899' }, // violet to pink
  styling: { from: '#ec4899', to: '#f59e0b' }, // pink to amber
  creating: { from: '#f59e0b', to: '#10b981' }, // amber to emerald
};

export function GeometricAnimation({ stage }: GeometricAnimationProps) {
  const controls = useAnimation();
  const colors = STAGE_COLORS[stage];

  useEffect(() => {
    controls.start({
      rotate: [0, 90, 180, 270, 360],
      scale: [1, 1.15, 1, 1.15, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    });
  }, [stage, controls]);

  return (
    <div className="flex items-center justify-center h-48 relative">
      {/* Outer rotating ring */}
      <motion.div
        animate={controls}
        className="absolute w-32 h-32 rounded-full border-4 border-dashed"
        style={{ borderColor: colors.from }}
      />

      {/* Middle pulsing diamond */}
      <motion.div
        animate={{
          rotate: [0, -45, 0, 45, 0],
          scale: [0.8, 1, 0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-20 h-20"
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />

      {/* Inner breathing circle */}
      <motion.div
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-12 h-12 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.to}, ${colors.from})`,
        }}
      />

      {/* Orbiting dots */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-32 h-32"
          style={{
            transform: `rotate(${i * 120}deg)`,
          }}
        >
          <motion.div
            className="absolute w-3 h-3 rounded-full"
            style={{
              top: 0,
              left: '50%',
              marginLeft: '-6px',
              backgroundColor: colors.from,
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
