'use client';

import { useEffect } from 'react';
import { ChevronLeft, EllipsisVertical, Undo2, Redo2 } from 'lucide-react';
import { useWizardStore } from '@/stores/useWizardStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

const STEPS = [
  { id: 0, name: 'Dimensions' },
  { id: 1, name: 'Layout' },
  { id: 2, name: 'Finishes' },
  { id: 3, name: 'Review' },
];

interface TopBarProps {
  isSaving: boolean;
  lastSaved: Date | null;
  onOpenHistory: () => void;
}

export function TopBar({ isSaving, lastSaved, onOpenHistory }: TopBarProps) {
  const currentStep = useWizardStore((state) => state.currentStep);
  const visitedSteps = useWizardStore((state) => state.visitedSteps);
  const goToStep = useWizardStore((state) => state.goToStep);
  const prevStep = useWizardStore((state) => state.prevStep);
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const getSaveStatusText = () => {
    if (isSaving) return 'Saving...';
    if (!lastSaved) return '';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 5) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Saved ${minutes}m ago`;
    return `Saved ${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="h-14 px-4 flex items-center justify-between bg-white border-b max-w-screen-md mx-auto w-full">
      {/* Left: Back button */}
      <button
        type="button"
        onClick={prevStep}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
        style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
        aria-label="Back"
      >
        <ChevronLeft className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Center: Step dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Step {currentStep + 1}/4 &middot; {STEPS[currentStep].name}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {STEPS.map((step) => {
            const isVisited = visitedSteps.has(step.id);
            return (
              <DropdownMenuItem
                key={step.id}
                onClick={() => isVisited && goToStep(step.id)}
                disabled={!isVisited}
              >
                Step {step.id + 1}: {step.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right: Overflow menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="More options"
          >
            <EllipsisVertical className="w-5 h-5 text-zinc-700" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => canUndo && undo()} disabled={!canUndo}>
            <Undo2 className="w-4 h-4 mr-2" />
            Undo
            <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => canRedo && redo()} disabled={!canRedo}>
            <Redo2 className="w-4 h-4 mr-2" />
            Redo
            <DropdownMenuShortcut>Ctrl+Shift+Z</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <span className="text-xs text-muted-foreground">{getSaveStatusText()}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenHistory}>
            Version History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
