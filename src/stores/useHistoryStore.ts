/**
 * History store (undo/redo wrapper)
 * Phase 04-01: R3F Foundation
 *
 * Exposes undo/redo functionality from useCabinetStore's temporal middleware
 */

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
  // Access the temporal store from the cabinet store
  const undo = useCabinetStore.temporal.getState().undo;
  const redo = useCabinetStore.temporal.getState().redo;
  const clear = useCabinetStore.temporal.getState().clear;
  const pastStates = useCabinetStore.temporal.getState().pastStates;
  const futureStates = useCabinetStore.temporal.getState().futureStates;

  return {
    // Actions
    undo,
    redo,
    clear,

    // State
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
    pastStatesCount: pastStates.length,
    futureStatesCount: futureStates.length,
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
  const temporalStore = useCabinetStore.temporal.getState();
  return {
    canUndo: temporalStore.pastStates.length > 0,
    canRedo: temporalStore.futureStates.length > 0,
    pastStatesCount: temporalStore.pastStates.length,
    futureStatesCount: temporalStore.futureStates.length,
  };
};
