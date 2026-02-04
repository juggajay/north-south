/**
 * Undo/Redo UI Controls
 * Phase 04-08: Undo/Redo & Shareable Links
 *
 * Provides visible undo/redo buttons with keyboard shortcuts.
 * NOTE: This component is OUTSIDE Canvas context - no useThree() here.
 * DimensionSync inside Canvas handles 3D invalidation when store changes.
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { useHistoryStore } from '@/stores/useHistoryStore';

export function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-md"
        onClick={() => undo()}
        disabled={!canUndo}
        aria-label="Undo (Ctrl+Z)"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="size-4" />
      </Button>

      <Button
        variant="outline"
        size="icon-md"
        onClick={() => redo()}
        disabled={!canRedo}
        aria-label="Redo (Ctrl+Shift+Z)"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="size-4" />
      </Button>
    </div>
  );
}
