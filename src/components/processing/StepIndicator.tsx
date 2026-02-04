'use client';

import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { PipelineStage } from '@/types/ai-pipeline';

/**
 * Stage configuration - labels are contractual from CONTEXT.md locked decisions
 * These must match the PipelineStage type values in src/types/ai-pipeline.ts
 */
const STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'analyzing', label: 'Analyzing' },
  { id: 'measuring', label: 'Measuring' },
  { id: 'styling', label: 'Styling' },
  { id: 'creating', label: 'Creating' },
];

interface StepIndicatorProps {
  currentStage: PipelineStage;
  completedStages: PipelineStage[];
}

export function StepIndicator({ currentStage, completedStages }: StepIndicatorProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex justify-between items-center max-w-sm mx-auto px-4">
      {STAGES.map((stage, index) => {
        const isComplete = completedStages.includes(stage.id);
        const isCurrent = stage.id === currentStage;
        const isPending = !isComplete && !isCurrent;

        return (
          <div key={stage.id} className="flex flex-col items-center flex-1 relative">
            {/* Connector line (except for first item) */}
            {index > 0 && (
              <div className="absolute top-5 right-1/2 w-full h-0.5 -z-10 bg-gray-700">
                <motion.div
                  className="h-full bg-emerald-500 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: index <= currentIndex ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </div>
            )}

            {/* Step circle */}
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              animate={{
                backgroundColor: isComplete
                  ? '#10b981' // emerald-500
                  : isCurrent
                    ? '#3b82f6' // blue-500
                    : 'transparent',
                borderColor: isComplete
                  ? '#10b981'
                  : isCurrent
                    ? '#3b82f6'
                    : '#374151', // gray-700
                scale: isCurrent ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              )}
              {isCurrent && (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              )}
              {isPending && (
                <span className="text-sm text-gray-500 font-medium">
                  {index + 1}
                </span>
              )}
            </motion.div>

            {/* Label */}
            <motion.span
              className="text-xs mt-2 font-medium"
              animate={{
                color: isComplete || isCurrent ? '#f9fafb' : '#9ca3af',
              }}
              transition={{ duration: 0.3 }}
            >
              {stage.label}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}
