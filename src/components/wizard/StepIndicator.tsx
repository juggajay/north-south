import { useWizardStore } from '@/stores/useWizardStore'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 0, name: 'Dimensions', shortName: '1' },
  { id: 1, name: 'Layout', shortName: '2' },
  { id: 2, name: 'Finishes', shortName: '3' },
  { id: 3, name: 'Review', shortName: '4' },
]

export function StepIndicator() {
  const { currentStep, visitedSteps, goToStep } = useWizardStore()

  const handleStepClick = (stepId: number) => {
    // Per CONTEXT.md: "later steps unlock once visited, then freely revisitable"
    // Visited steps are clickable for direct navigation
    if (visitedSteps.has(stepId)) {
      goToStep(stepId)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = visitedSteps.has(step.id) && currentStep > step.id
        const isAccessible = visitedSteps.has(step.id)

        return (
          <div key={step.id} className="flex items-center">
            {index > 0 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                isAccessible ? "bg-zinc-900" : "bg-zinc-200"
              )} />
            )}
            <div className="flex flex-col items-center">
              {/* Step circle - clickable if visited (per unlocking progression) */}
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  isActive && "bg-zinc-900 text-white",
                  isCompleted && "bg-zinc-900 text-white",
                  !isActive && !isCompleted && isAccessible && "border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-100 cursor-pointer",
                  !isAccessible && "border-2 border-zinc-300 text-zinc-300 cursor-not-allowed"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.shortName}
              </button>
              <span className={cn(
                "text-xs mt-1",
                isActive ? "text-zinc-900 font-medium" : "text-zinc-500"
              )}>
                {step.name}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
