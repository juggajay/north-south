'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PipelineProgress } from '@/types/ai-pipeline';
import { StepIndicator } from './StepIndicator';
import { GeometricAnimation } from './GeometricAnimation';
import { ErrorFallback } from './ErrorFallback';

interface ProcessingScreenProps {
  progress: PipelineProgress;
  error?: string;
  onRetry: () => void;
  onRetake?: () => void;
}

export function ProcessingScreen({
  progress,
  error,
  onRetry,
  onRetake,
}: ProcessingScreenProps) {
  const isRoomDetectionError =
    error?.toLowerCase().includes('room') ||
    error?.toLowerCase().includes('detect');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-zinc-900 z-50 flex flex-col"
    >
      {/* Header spacer for status bar */}
      <div className="h-safe-top" />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {error ? (
            <ErrorFallback
              key="error"
              error={error}
              isRoomDetectionError={isRoomDetectionError}
              onRetry={onRetry}
              onRetake={onRetake}
            />
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              {/* Title */}
              <motion.h1
                className="text-2xl font-semibold text-white text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Creating your designs
              </motion.h1>

              {/* Geometric animation */}
              <GeometricAnimation stage={progress.stage} />

              {/* Step indicator */}
              <div className="mt-8">
                <StepIndicator
                  currentStage={progress.stage}
                  completedStages={progress.stagesComplete}
                />
              </div>

              {/* Subtle message */}
              <motion.p
                className="text-gray-500 text-sm text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Analyzing your space and preparing styled options
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-bottom" />
    </motion.div>
  );
}
