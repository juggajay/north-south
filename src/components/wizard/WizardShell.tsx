import { useWizardStore } from '@/stores/useWizardStore'
import { StepIndicator } from './StepIndicator'
import { StepNavigation } from './StepNavigation'
import { StepDimensions } from './StepDimensions'
import { StepLayout } from './StepLayout'
import { ModulePicker } from './ModulePicker'
import { StepFinishes } from './StepFinishes'
import { StepReview } from './StepReview'
import { PriceStickyBar } from '@/components/pricing/PriceStickyBar'

interface WizardShellProps {
  aiEstimate?: { width: number; depth: number; height: number }
  onSlotTap?: (slotId: string, slotType: 'base' | 'overhead') => void
}

export function WizardShell({ aiEstimate, onSlotTap }: WizardShellProps) {
  const currentStep = useWizardStore((state) => state.currentStep)
  const selectedSlot = useWizardStore((state) => state.selectedSlot)
  const selectSlot = useWizardStore((state) => state.selectSlot)
  const clearSelectedSlot = useWizardStore((state) => state.clearSelectedSlot)

  const handleSlotTap = (slotId: string, slotType: 'base' | 'overhead') => {
    selectSlot(slotId, slotType)
    onSlotTap?.(slotId, slotType)
  }

  const handleClosePicker = () => {
    clearSelectedSlot()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepDimensions aiEstimate={aiEstimate} />
      case 1:
        return (
          <>
            <StepLayout onSlotTap={handleSlotTap} />
            <ModulePicker
              isOpen={selectedSlot !== null}
              slotId={selectedSlot?.id || null}
              slotType={selectedSlot?.type || null}
              onClose={handleClosePicker}
            />
          </>
        )
      case 2:
        return <StepFinishes />
      case 3:
        return <StepReview />
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

      {/* Sticky price bar - live pricing throughout wizard */}
      <PriceStickyBar />

      <StepNavigation />
    </div>
  )
}
