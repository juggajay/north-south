/**
 * Cabinet configuration store
 * Phase 04-01: R3F Foundation
 *
 * Manages cabinet dimensions, slots, and finishes with undo/redo history
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { enableMapSet } from 'immer';
import type {
  CabinetConfig,
  CabinetDimensions,
  ModuleConfig,
  FinishConfig,
  SlotConfig,
} from '@/types/configurator';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface CabinetState {
  // Configuration state
  config: CabinetConfig;

  // Actions
  setDimension: (key: keyof CabinetDimensions, value: number) => void;
  setModule: (slotId: string, module: ModuleConfig) => void;
  removeModule: (slotId: string) => void;
  setFinish: (key: keyof FinishConfig, value: string) => void;
  resetConfig: () => void;
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const DEFAULT_DIMENSIONS: CabinetDimensions = {
  width: 2400,   // 2.4m typical width
  height: 2100,  // 2.1m typical height
  depth: 600,    // 600mm standard depth
};

const DEFAULT_FINISHES: FinishConfig = {
  material: '',      // No default material
  hardware: '',      // No default hardware
  doorProfile: '',   // No default profile
};

const DEFAULT_CONFIG: CabinetConfig = {
  dimensions: DEFAULT_DIMENSIONS,
  slots: new Map<string, SlotConfig>(),
  finishes: DEFAULT_FINISHES,
};

// Enable Immer's MapSet plugin for Map/Set support
enableMapSet();

// ============================================================================
// STORE DEFINITION
// ============================================================================

/**
 * Cabinet configuration store with undo/redo history
 *
 * Usage:
 * - In React components: `const store = useCabinetStore()`
 * - In useFrame (avoid reactive subscriptions): `useCabinetStore.getState()`
 */
export const useCabinetStore = create<CabinetState>()(
  // Temporal middleware for undo/redo (wraps immer)
  temporal(
    // Immer middleware for immutable updates
    immer((set) => ({
      // Initial state
      config: DEFAULT_CONFIG,

      // Set a single dimension
      setDimension: (key, value) =>
        set((state) => {
          state.config.dimensions[key] = value;
        }),

      // Set or update a module in a slot
      setModule: (slotId, module) =>
        set((state) => {
          const existingSlot = state.config.slots.get(slotId);
          if (existingSlot) {
            // Update existing slot
            existingSlot.module = module;
            state.config.slots.set(slotId, existingSlot);
          } else {
            // Create new slot entry (slots are generated dynamically by SlotSystem)
            const position = slotId.startsWith('base') ? 'base' : 'overhead';
            const newSlot: SlotConfig = {
              id: slotId,
              position: position as 'base' | 'overhead',
              x: 0, // Actual position calculated by SlotSystem
              module,
            };
            state.config.slots.set(slotId, newSlot);
          }
        }),

      // Remove a module from a slot
      removeModule: (slotId) =>
        set((state) => {
          const slot = state.config.slots.get(slotId);
          if (slot) {
            slot.module = null;
            state.config.slots.set(slotId, slot);
          }
        }),

      // Set a finish property
      setFinish: (key, value) =>
        set((state) => {
          state.config.finishes[key] = value;
        }),

      // Reset configuration to defaults
      resetConfig: () =>
        set((state) => {
          state.config = structuredClone(DEFAULT_CONFIG);
        }),
    })),
    {
      // Temporal options
      limit: 20, // Maximum 20 undo states
      // Custom equality check (much faster than JSON.stringify)
      equality: (a, b) => {
        // Compare dimensions
        const dimA = a.config.dimensions;
        const dimB = b.config.dimensions;
        if (dimA.width !== dimB.width) return false;
        if (dimA.height !== dimB.height) return false;
        if (dimA.depth !== dimB.depth) return false;

        // Compare finishes
        const finA = a.config.finishes;
        const finB = b.config.finishes;
        if (finA.material !== finB.material) return false;
        if (finA.hardware !== finB.hardware) return false;
        if (finA.doorProfile !== finB.doorProfile) return false;

        // Compare slots - check size first
        const slotsA = a.config.slots;
        const slotsB = b.config.slots;
        if (slotsA.size !== slotsB.size) return false;

        // Compare slot contents
        for (const [key, slotA] of slotsA) {
          const slotB = slotsB.get(key);
          if (!slotB) return false;

          // Compare module presence
          if (!slotA.module && !slotB.module) continue;
          if (!slotA.module || !slotB.module) return false;

          // Compare module type
          if (slotA.module.type !== slotB.module.type) return false;
        }

        return true;
      },
    }
  )
);

// ============================================================================
// HELPER: GETSTATE FOR USEFRAME
// ============================================================================

/**
 * Get the current state without subscribing to changes
 * Use this in useFrame to avoid reactive subscriptions in render loop
 *
 * Example:
 * ```tsx
 * useFrame(() => {
 *   const state = useCabinetStore.getState();
 *   // Use state.config without causing re-renders
 * });
 * ```
 */
export const getCabinetState = () => useCabinetStore.getState();
