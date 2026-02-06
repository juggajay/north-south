import { SliderControl, DepthSelector } from '@/components/ui/slider-control'
import { useCabinetStore } from '@/stores/useCabinetStore'

const DEPTH_OPTIONS = [400, 500, 560, 600, 650]

interface StepDimensionsProps {
  aiEstimate?: { width: number; depth: number; height: number }
}

export function StepDimensions({ aiEstimate }: StepDimensionsProps) {
  const dimensions = useCabinetStore((state) => state.config.dimensions)
  const setDimension = useCabinetStore((state) => state.setDimension)

  return (
    <div className="space-y-10 px-6 py-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Set Your Dimensions</h2>
        {aiEstimate && (
          <p className="text-sm text-zinc-500 mt-1">
            AI suggests: {aiEstimate.width} x {aiEstimate.depth}mm
          </p>
        )}
        {!aiEstimate && (
          <p className="text-sm text-zinc-500 mt-1">
            Enter your cabinet dimensions.
          </p>
        )}
      </div>

      <SliderControl
        label="Width"
        value={dimensions.width}
        min={1200}
        max={3600}
        step={100}
        onChange={(v) => setDimension('width', v)}
      />

      <SliderControl
        label="Height"
        value={dimensions.height}
        min={1800}
        max={2400}
        step={100}
        onChange={(v) => setDimension('height', v)}
      />

      <DepthSelector
        value={dimensions.depth}
        options={DEPTH_OPTIONS}
        onChange={(v) => setDimension('depth', v)}
      />
    </div>
  )
}
