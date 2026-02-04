import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit = 'mm',
  onChange,
}: SliderControlProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        <span className="text-sm font-semibold text-zinc-900">
          {value}{unit}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([newValue]) => onChange(newValue)}
          className="flex-1"
        />

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between text-xs text-zinc-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

interface DepthSelectorProps {
  value: number
  options: number[]
  onChange: (value: number) => void
}

export function DepthSelector({ value, options, onChange }: DepthSelectorProps) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-zinc-700">Depth</span>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "py-2 px-3 rounded-md text-sm font-medium border",
              value === option
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <span className="text-xs text-zinc-500">mm</span>
    </div>
  )
}
