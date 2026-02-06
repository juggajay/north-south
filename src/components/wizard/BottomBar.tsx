'use client';

import { Button } from '@/components/ui/button';
import { useWizardStore, canProceedFromCurrentStep } from '@/stores/useWizardStore';
import { usePricing } from '@/hooks/usePricing';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { Skeleton } from '@/components/ui/skeleton';

interface BottomBarProps {
  onPreview: () => void;
  onSubmit: () => void;
}

export function BottomBar({ onPreview, onSubmit }: BottomBarProps) {
  const currentStep = useWizardStore((state) => state.currentStep);
  const nextStep = useWizardStore((state) => state.nextStep);
  const { formatted, isLoading } = usePricing();

  // Subscribe to config so validation re-evaluates reactively
  const _config = useCabinetStore((state) => state.config);
  const canGoNext = canProceedFromCurrentStep(currentStep);

  const isLastStep = currentStep === 3;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t px-4 py-3 z-40">
      <div className="max-w-screen-md mx-auto flex items-center justify-between">
        {/* Left: Price */}
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">Est. total</span>
          {isLoading ? (
            <Skeleton className="h-6 w-24 mt-0.5" />
          ) : (
            <span className="text-lg font-bold text-zinc-900">{formatted.total}</span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col items-end gap-1">
          {isLastStep ? (
            <Button
              onClick={onSubmit}
              disabled={!canGoNext}
              variant="primary"
              size="md"
            >
              Submit for Quote
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canGoNext}
              variant="primary"
              size="md"
            >
              Next
            </Button>
          )}
          <button
            type="button"
            onClick={onPreview}
            className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors py-1"
          >
            Preview 3D
          </button>
        </div>
      </div>
    </div>
  );
}
