"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TimelineStepProps {
  step: {
    id: string;
    name: string;
    description?: string;
  };
  isCompleted: boolean;
  isCurrent: boolean;
  timestamp?: number;
  isLast?: boolean;
}

export function TimelineStep({
  step,
  isCompleted,
  isCurrent,
  timestamp,
  isLast = false,
}: TimelineStepProps) {
  return (
    <div className="relative flex gap-4">
      {/* Vertical line connector */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-4 top-8 w-0.5 h-full",
            isCompleted ? "bg-zinc-900" : "bg-zinc-200"
          )}
        />
      )}

      {/* Step circle */}
      <div className="relative z-10 flex-shrink-0">
        <motion.div
          initial={isCompleted ? { scale: 0.8, opacity: 0 } : false}
          animate={isCompleted ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isCompleted && "bg-zinc-900",
            isCurrent && !isCompleted && "border-2 border-zinc-900 bg-white",
            !isCompleted && !isCurrent && "border-2 border-zinc-200 bg-white"
          )}
        >
          {isCompleted ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isCurrent ? "bg-zinc-900" : "bg-zinc-200"
              )}
            />
          )}
        </motion.div>
      </div>

      {/* Step content */}
      <div className="flex-1 pb-8">
        {/* Step name and timestamp */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className={cn(
                "font-medium",
                isCurrent || isCompleted
                  ? "text-zinc-900"
                  : "text-zinc-400"
              )}
            >
              {step.name}
            </h3>

            {/* Show timestamp for completed steps only */}
            {isCompleted && timestamp && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="text-sm text-zinc-500 mt-1"
              >
                {new Date(timestamp).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </motion.p>
            )}
          </div>
        </div>

        {/* Expanded card for current step */}
        {isCurrent && step.description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-3"
          >
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4">
              <p className="text-sm text-zinc-600">{step.description}</p>
            </div>
          </motion.div>
        )}

        {/* Muted description for future steps */}
        {!isCompleted && !isCurrent && step.description && (
          <p className="text-sm text-zinc-400 mt-1">{step.description}</p>
        )}
      </div>
    </div>
  );
}
