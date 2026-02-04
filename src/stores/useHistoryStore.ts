/**
 * History store (undo/redo wrapper)
 * Phase 04-01: R3F Foundation
 *
 * Exposes undo/redo functionality from useCabinetStore's temporal middleware
 */

import { useTemporalStore } from 'zundo';
import { useCabinetStore } from './useCabinetStore';

// ============================================================================
// HISTORY STORE
// ============================================================================

/**
 * History store exposing undo/redo from cabinet store's temporal middleware
 *
 * This is a thin wrapper around the temporal middleware for better ergonomics
 *
 * Usage:
 * ```tsx
 * const { undo, redo, canUndo, canRedo } = useHistoryStore();
 *
 * return (
 *   <>
 *     <Button onClick={undo} disabled={!canUndo}>Undo</Button>
 *     <Button onClick={redo} disabled={!canRedo}>Redo</Button>
 *   </>
 * );
 * ```
 */
export const useHistoryStore = () => {
  const temporalStore = useTemporalStore(useCabinetStore);

  return {
    // Actions
    undo: temporalStore.undo,
    redo: temporalStore.redo,
    clear: temporalStore.clear,

    // State
    canUndo: temporalStore.pastStates.length > 0,
    canRedo: temporalStore.futureStates.length > 0,
    pastStatesCount: temporalStore.pastStates.length,
    futureStatesCount: temporalStore.futureStates.length,
  };
};

// ============================================================================
// HELPER: GET HISTORY STATE
// ============================================================================

/**
 * Get history state without subscribing to changes
 * Useful for conditional rendering or logic checks
 */
export const getHistoryState = () => {
  const temporalStore = useTemporalStore.getState();
  return {
    canUndo: temporalStore.pastStates.length > 0,
    canRedo: temporalStore.futureStates.length > 0,
    pastStatesCount: temporalStore.pastStates.length,
    futureStatesCount: temporalStore.futureStates.length,
  };
};
