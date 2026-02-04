import { useState } from 'react'
import { useWizardStore } from '@/stores/useWizardStore'
import { StepIndicator } from './StepIndicator'
import { StepNavigation } from './StepNavigation'
import { StepDimensions } from './StepDimensions'
import { StepLayout } from './StepLayout'
import { ModulePicker } from './ModulePicker'
// Future: import { StepFinishes, StepReview } from './...'

interface WizardShellProps {
  aiEstimate?: { width: number; depth: number; height: number }
  onSlotTap?: (slotId: string, slotType: 'base' | 'overhead') => void
}

export function WizardShell({ aiEstimate, onSlotTap }: WizardShellProps) {
  const currentStep = useWizardStore((state) => state.currentStep)
  const [selectedSlot, setSelectedSlot] = useState<{
    id: string
    type: 'base' | 'overhead'
  } | null>(null)

  const handleSlotTap = (slotId: string, slotType: 'base' | 'overhead') => {
    setSelectedSlot({ id: slotId, type: slotType })
    onSlotTap?.(slotId, slotType)
  }

  const handleClosePicker = () => {
    setSelectedSlot(null)
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
