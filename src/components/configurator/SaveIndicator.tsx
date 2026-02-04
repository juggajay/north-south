/**
 * Save Status Indicator
 * Phase 04-08: Undo/Redo & Shareable Links
 *
 * Shows "Saving...", "Saved", or error state with timestamp
 */

'use client';

export interface SaveIndicatorProps {
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Timestamp of last successful save */
  lastSaved: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  const getTimeAgo = (date: Date | null): string => {
    if (!date) return '';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span>Saved {getTimeAgo(lastSaved)}</span>
      </div>
    );
  }

  return null;
}
