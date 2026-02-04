import { useWizardStore } from '@/stores/useWizardStore'
import { StepIndicator } from './StepIndicator'
import { StepNavigation } from './StepNavigation'
import { StepDimensions } from './StepDimensions'
// Future: import { StepLayout, StepFinishes, StepReview } from './...'

interface WizardShellProps {
  aiEstimate?: { width: number; depth: number; height: number }
}

export function WizardShell({ aiEstimate }: WizardShellProps) {
  const currentStep = useWizardStore((state) => state.currentStep)

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepDimensions aiEstimate={aiEstimate} />
      case 1:
        return <div className="p-4 text-zinc-500">Layout step (Plan 05)</div>
      case 2:
        return <div className="p-4 text-zinc-500">Finishes step (Plan 07)</div>
      case 3:
        return <div className="p-4 text-zinc-500">Review step (Plan 07)</div>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      <StepIndicator />

      <div className="flex-1 overflow-y-auto">
        {renderStepContent()}
      </div>

      {/* Sticky price bar placeholder */}
      <div className="px-4 py-2 bg-white border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Estimated total</span>
          <span className="text-lg font-semibold text-zinc-900">$--,---</span>
        </div>
      </div>

      <StepNavigation />
    </div>
  )
}
