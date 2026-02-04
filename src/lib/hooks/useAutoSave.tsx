import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { Id } from '../../../convex/_generated/dataModel';

export interface AutoSaveConfig {
  dimensions?: any;
  slots?: any;
  finishes?: any;
  [key: string]: any;
}

export interface AutoSaveOptions {
  /** Debounce delay in milliseconds (default: 1000) */
  debounceMs?: number;
  /** Create version snapshot every N saves (default: 10) */
  versionSnapshotInterval?: number;
  /** Callback when save starts */
  onSaveStart?: () => void;
  /** Callback when save succeeds */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

export interface AutoSaveReturn {
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Timestamp of last successful save */
  lastSaved: Date | null;
  /** Number of successful saves in this session */
  saveCount: number;
  /** Manually trigger a save (bypasses debounce) */
  saveNow: () => Promise<void>;
  /** Reset save count (useful when starting a new design) */
  resetCount: () => void;
}

/**
 * Auto-save hook with debounced Convex sync
 *
 * Features:
 * - Debounces saves at 1000ms (configurable)
 * - Creates version snapshots periodically
 * - Provides save status indicators
 * - Error handling with callbacks
 *
 * @param designId - The design ID to auto-save
 * @param config - The configuration object to save
 * @param options - Auto-save options
 *
 * @example
 * ```tsx
 * const { isSaving, lastSaved, saveNow } = useAutoSave(designId, {
 *   dimensions: cabinetState.dimensions,
 *   slots: Array.from(cabinetState.slots.entries()),
 *   finishes: cabinetState.finishes,
 * });
 * ```
 */
export function useAutoSave(
  designId: Id<'designs'> | null,
  config: AutoSaveConfig,
  options: AutoSaveOptions = {}
): AutoSaveReturn {
  const {
    debounceMs = 1000,
    versionSnapshotInterval = 10,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveCountRef = useRef(0);

  const updateDesign = useMutation(api.designs.update);
  const createVersion = useMutation(api.designVersions.create);

  const performSave = useCallback(
    async (configToSave: AutoSaveConfig) => {
      if (!designId) return;

      setIsSaving(true);
      onSaveStart?.();

      try {
        // Update the design
        await updateDesign({ id: designId, config: configToSave });
        saveCountRef.current += 1;

        // Create version snapshot every N saves
        if (saveCountRef.current % versionSnapshotInterval === 0) {
          await createVersion({
            designId,
            config: configToSave,
            label: `Auto-save checkpoint ${saveCountRef.current}`,
          });
        }

        setLastSaved(new Date());
        onSaveSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Auto-save failed');
        console.error('Auto-save failed:', err);
        onSaveError?.(err);
      } finally {
        setIsSaving(false);
      }
    },
    [designId, updateDesign, createVersion, versionSnapshotInterval, onSaveStart, onSaveSuccess, onSaveError]
  );

  const debouncedSave = useDebouncedCallback(performSave, debounceMs);

  // Auto-save when config changes
  useEffect(() => {
    if (designId && config) {
      debouncedSave(config);
    }
  }, [designId, config, debouncedSave]);

  // Manual save (bypasses debounce)
  const saveNow = useCallback(async () => {
    debouncedSave.cancel(); // Cancel any pending debounced save
    await performSave(config);
  }, [debouncedSave, performSave, config]);

  // Reset save count
  const resetCount = useCallback(() => {
    saveCountRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    isSaving,
    lastSaved,
    saveCount: saveCountRef.current,
    saveNow,
    resetCount,
  };
}

/**
 * Save status indicator component
 *
 * Shows "Saving...", "Saved", or error state with timestamp
 *
 * @example
 * ```tsx
 * const autoSave = useAutoSave(designId, config);
 * return <SaveIndicator {...autoSave} />;
 * ```
 */
export function SaveIndicator({
  isSaving,
  lastSaved,
}: Pick<AutoSaveReturn, 'isSaving' | 'lastSaved'>) {
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
