import { Button } from '@/components/ui/button'
import { useWizardStore } from '@/stores/useWizardStore'
import { canProceedFromCurrentStep } from '@/stores/useWizardStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function StepNavigation() {
  const { currentStep, nextStep, prevStep } = useWizardStore()

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === 3
  const canGoNext = canProceedFromCurrentStep(currentStep)

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={isFirstStep}
        className="min-w-[100px]"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      {!isLastStep && (
        <Button
          onClick={nextStep}
          disabled={!canGoNext}
          className="min-w-[100px]"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  )
}
