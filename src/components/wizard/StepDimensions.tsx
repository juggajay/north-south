import { SliderControl, DepthSelector } from '@/components/ui/slider-control'
import { useCabinetStore } from '@/stores/useCabinetStore'

const DEPTH_OPTIONS = [400, 500, 560, 600, 650]

interface StepDimensionsProps {
  aiEstimate?: { width: number; depth: number; height: number }
}

export function StepDimensions({ aiEstimate }: StepDimensionsProps) {
  const dimensions = useCabinetStore((state) => state.config.dimensions)
  const setDimension = useCabinetStore((state) => state.setDimension)

  // No useThree() here! DimensionSync inside Canvas handles invalidation.

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Set Dimensions</h2>
        <p className="text-sm text-zinc-500">
          {aiEstimate
            ? 'We estimated these dimensions from your photo. Adjust as needed.'
            : 'Enter your cabinet dimensions.'}
        </p>
      </div>

      <SliderControl
        label="Width"
        value={dimensions.width}
        min={1200}
        max={3600}
        step={100}
        onChange={(v) => setDimension('width', v)}
      />

      <DepthSelector
        value={dimensions.depth}
        options={DEPTH_OPTIONS}
        onChange={(v) => setDimension('depth', v)}
      />

      <SliderControl
        label="Height"
        value={dimensions.height}
        min={1800}
        max={2400}
        step={100}
        onChange={(v) => setDimension('height', v)}
      />

      {aiEstimate && (
        <p className="text-xs text-zinc-400 text-center">
          AI estimated: {aiEstimate.width} x {aiEstimate.depth} x {aiEstimate.height}mm
        </p>
      )}
    </div>
  )
}
