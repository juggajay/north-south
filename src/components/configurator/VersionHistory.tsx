/**
 * Version History Panel
 * Phase 04-09: Version History, Before/After, LOD
 *
 * Features:
 * - Timeline list of saved versions with timestamps
 * - Restore functionality
 * - Bottom sheet UI for mobile-friendly access
 * - Controlled open/close via props
 */

'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { History, Clock, Check } from 'lucide-react';
import { useCabinetStore } from '@/stores/useCabinetStore';

// ============================================================================
// TYPES
// ============================================================================

interface VersionHistoryProps {
  designId: Id<'designs'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when version restored */
  onVersionRestored?: () => void;
}

// ============================================================================
// VERSION HISTORY PANEL
// ============================================================================

export function VersionHistory({
  designId,
  open,
  onOpenChange,
  onVersionRestored,
}: VersionHistoryProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const versions = useQuery(api.designVersions.list, { designId, limit: 20 });
  const restoreVersion = useMutation(api.designVersions.restore);

  const handleRestore = async (versionId: Id<'designVersions'>) => {
    setRestoringId(versionId);

    try {
      const restored = await restoreVersion({ designId, versionId });

      if (restored?.config) {
        const restoredConfig = restored.config as any;

        if (restoredConfig.dimensions) {
          useCabinetStore.setState((state) => ({
            config: {
              ...state.config,
              dimensions: restoredConfig.dimensions,
            },
          }));
        }

        if (restoredConfig.finishes) {
          useCabinetStore.setState((state) => ({
            config: {
              ...state.config,
              finishes: restoredConfig.finishes,
            },
          }));
        }

        if (restoredConfig.slots) {
          const slotsMap =
            Array.isArray(restoredConfig.slots)
              ? new Map(restoredConfig.slots)
              : restoredConfig.slots instanceof Map
              ? restoredConfig.slots
              : new Map(Object.entries(restoredConfig.slots || {}));

          useCabinetStore.setState((state) => ({
            config: {
              ...state.config,
              slots: slotsMap,
            },
          }));
        }

        onVersionRestored?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      setRestoringId(null);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[0.25, 0.5, 0.85]}
    >
      <div className="flex flex-col gap-4 px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Version History</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Restore your design to a previous state. Current state will be saved
          before restoring.
        </p>

        {/* Version list */}
        <div className="flex flex-col gap-2">
          {!versions || versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No saved versions yet</p>
              <p className="text-xs text-muted-foreground">Versions are auto-saved as you work</p>
            </div>
          ) : (
            versions.map((version: { _id: Id<'designVersions'>; _creationTime: number; version: number; label?: string; thumbnail?: string; createdAt: number; dimensions: any }, index: number) => {
              const isRestoring = restoringId === version._id;
              const isCurrent = index === 0;

              return (
                <button
                  key={version._id}
                  onClick={() => !isCurrent && handleRestore(version._id)}
                  disabled={isRestoring || isCurrent}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {isCurrent ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Version {version.version}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
                    </div>

                    {version.label && (
                      <p className="text-xs text-muted-foreground">{version.label}</p>
                    )}

                    {version.dimensions && (
                      <p className="text-xs text-muted-foreground">
                        {version.dimensions.width}mm x {version.dimensions.height}mm x {version.dimensions.depth}mm
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(version.createdAt)}
                    </p>
                  </div>

                  {isRestoring && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
