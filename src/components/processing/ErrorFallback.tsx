'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: string;
  isRoomDetectionError?: boolean;
  onRetry: () => void;
  onRetake?: () => void;
}

export function ErrorFallback({
  error,
  isRoomDetectionError,
  onRetry,
  onRetake,
}: ErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      {isRoomDetectionError ? (
        <>
          <h2 className="text-xl font-semibold text-white mb-2">
            We couldn&apos;t detect a room
          </h2>
          <p className="text-gray-400 mb-6 max-w-xs">
            Tips: Make sure walls are visible, improve lighting, and stand back
            to capture more of the space.
          </p>
          <div className="flex gap-3">
            {onRetake && (
              <Button onClick={onRetake} variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
            )}
            <Button onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6 max-w-xs">{error}</p>
          <Button onClick={onRetry} className="min-w-32">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </>
      )}
    </motion.div>
  );
}
