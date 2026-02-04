/**
 * Version History Panel & Button
 * Phase 04-09: Version History, Before/After, LOD
 *
 * Features:
 * - Timeline list of saved versions with timestamps
 * - Restore functionality (triggers 3D invalidation)
 * - Bottom sheet UI for mobile-friendly access
 * - Store subscription pattern to avoid useThree requirement
 */

'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { History, Clock, Check } from 'lucide-react';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useThree } from '@react-three/fiber';

// ============================================================================
// TYPES
// ============================================================================

interface VersionHistoryProps {
  designId: Id<'designs'>;
  /** Whether sheet is initially open */
  defaultOpen?: boolean;
  /** Callback when version restored */
  onVersionRestored?: () => void;
}

interface VersionHistoryButtonProps {
  onClick: () => void;
  /** Show count badge */
  count?: number;
}

// ============================================================================
// VERSION HISTORY PANEL
// ============================================================================

/**
 * Version history panel showing timeline of saved versions
 *
 * Usage:
 * - Shows list of versions with timestamps and labels
 * - Tap to restore a previous version
 * - Updates cabinet store and invalidates 3D canvas
 *
 * @param designId - The design to show versions for
 * @param defaultOpen - Whether sheet is initially open
 * @param onVersionRestored - Callback when version restored
 *
 * @example
 * ```tsx
 * <VersionHistory designId={designId} />
 * ```
 */
export function VersionHistory({
  designId,
  defaultOpen = false,
  onVersionRestored,
}: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const versions = useQuery(api.designVersions.list, { designId, limit: 20 });
  const restoreVersion = useMutation(api.designVersions.restore);

  // Cabinet store for updating after restore
  const { config } = useCabinetStore();

  // Get invalidate function if available (inside Canvas context)
  // Falls back gracefully if not available
  let invalidate: (() => void) | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const three = useThree();
    invalidate = three.invalidate;
  } catch {
    // Not inside Canvas context - that's OK
    // Store updates will still work
  }

  const handleRestore = async (versionId: Id<'designVersions'>) => {
    setRestoringId(versionId);

    try {
      const restored = await restoreVersion({ designId, versionId });

      if (restored?.config) {
        // Update cabinet store with restored config
        const restoredConfig = restored.config as any;

        // Restore dimensions
        if (restoredConfig.dimensions) {
          useCabinetStore.setState((state) => ({
            config: {
              ...state.config,
              dimensions: restoredConfig.dimensions,
            },
          }));
        }

        // Restore finishes
        if (restoredConfig.finishes) {
          useCabinetStore.setState((state) => ({
            config: {
              ...state.config,
              finishes: restoredConfig.finishes,
            },
          }));
        }

        // Restore slots (convert array back to Map if needed)
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

        // Invalidate 3D canvas to reflect changes
        if (invalidate) {
          invalidate();
        }

        onVersionRestored?.();
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      setRestoringId(null);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }

    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <>
      <VersionHistoryButton
        onClick={() => setIsOpen(true)}
        count={versions?.length}
      />

      <BottomSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        snapPoints={[0.25, 0.5, 0.85]}
      >
        <div className="flex flex-col gap-4 px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Version History</h2>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            Restore your design to a previous state. Current state will be saved
            before restoring.
          </p>

          {/* Version list */}
          <div className="flex flex-col gap-2">
            {!versions || versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No saved versions yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Versions are auto-saved as you work
                </p>
              </div>
            ) : (
              versions.map((version: { _id: Id<'designVersions'>; _creationTime: number; version: number; label?: string; thumbnail?: string; createdAt: number; dimensions: any }, index: number) => {
                const isRestoring = restoringId === version._id;
                const isCurrent = index === 0; // First version is most recent

                return (
                  <button
                    key={version._id}
                    onClick={() => !isCurrent && handleRestore(version._id)}
                    disabled={isRestoring || isCurrent}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {/* Icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {isCurrent ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
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
                        <p className="text-xs text-muted-foreground">
                          {version.label}
                        </p>
                      )}

                      {version.dimensions && (
                        <p className="text-xs text-muted-foreground">
                          {version.dimensions.width}mm × {version.dimensions.height}mm
                          × {version.dimensions.depth}mm
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(version.createdAt)}
                      </p>
                    </div>

                    {/* Loading indicator */}
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
    </>
  );
}

// ============================================================================
// VERSION HISTORY BUTTON
// ============================================================================

/**
 * Button to trigger version history panel
 *
 * @param onClick - Click handler to open version history
 * @param count - Optional version count badge
 *
 * @example
 * ```tsx
 * <VersionHistoryButton onClick={() => setHistoryOpen(true)} count={5} />
 * ```
 */
export function VersionHistoryButton({ onClick, count }: VersionHistoryButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative"
    >
      <History className="mr-2 h-4 w-4" />
      History
      {count !== undefined && count > 0 && (
        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  );
}
