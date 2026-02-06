import { useWizardStore } from '@/stores/useWizardStore'
import { TopBar } from './TopBar'
import { BottomBar } from './BottomBar'
import { StepDimensions } from './StepDimensions'
import { StepLayout } from './StepLayout'
import { StepFinishes } from './StepFinishes'
import { StepReview } from './StepReview'

interface WizardShellProps {
  aiEstimate?: { width: number; depth: number; height: number }
  onSlotTap?: (slotId: string, slotType: 'base' | 'overhead') => void
  isSaving: boolean
  lastSaved: Date | null
  onOpenHistory: () => void
  onPreview: () => void
  onSubmit: () => void
}

export function WizardShell({
  aiEstimate,
  onSlotTap,
  isSaving,
  lastSaved,
  onOpenHistory,
  onPreview,
  onSubmit,
}: WizardShellProps) {
  const currentStep = useWizardStore((state) => state.currentStep)
  const selectSlot = useWizardStore((state) => state.selectSlot)

  const handleSlotTap = (slotId: string, slotType: 'base' | 'overhead') => {
    selectSlot(slotId, slotType)
    onSlotTap?.(slotId, slotType)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepDimensions aiEstimate={aiEstimate} />
      case 1:
        return <StepLayout onSlotTap={handleSlotTap} />
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
      <TopBar
        isSaving={isSaving}
        lastSaved={lastSaved}
        onOpenHistory={onOpenHistory}
      />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-screen-sm mx-auto">
          {renderStepContent()}
        </div>
      </div>

      <BottomBar
        onPreview={onPreview}
        onSubmit={onSubmit}
      />
    </div>
  )
}
