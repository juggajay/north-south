/**
 * Wizard navigation store
 * Phase 04-01: R3F Foundation
 *
 * Manages 4-step wizard navigation with strict validation-based progression
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WizardStep } from '@/types/configurator';
import { useCabinetStore } from './useCabinetStore';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface WizardState {
  // Current state
  currentStep: number;                    // 0-3: dimensions, layout, finishes, review
  visitedSteps: Set<number>;              // Steps that have been visited (unlocked)
  validationErrors: Map<string, string>;  // Field-level validation errors
  selectedSlot: { id: string; type: 'base' | 'overhead' } | null; // Currently selected slot for module picker

  // Actions
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setValidationError: (field: string, error: string) => void;
  clearErrors: () => void;
  selectSlot: (slotId: string, slotType: 'base' | 'overhead') => void;
  clearSelectedSlot: () => void;
}

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

/**
 * Check if user can proceed from current step
 * Strict validation before Next button enables
 */
function canProceed(step: number): boolean {
  const cabinetState = useCabinetStore.getState();
  const { dimensions, slots, finishes } = cabinetState.config;

  switch (step) {
    case 0: // Dimensions step
      return (
        dimensions.width >= 1200 &&
        dimensions.height >= 1800 &&
        dimensions.depth > 0
      );

    case 1: // Layout step
      // At least one module must be placed
      const hasModule = Array.from(slots.values()).some(
        (slot) => slot.module !== null
      );
      return hasModule;

    case 2: // Finishes step
      // Material must be selected
      return finishes.material !== '';

    case 3: // Review step
      // Review is always valid (read-only)
      return true;

    default:
      return false;
  }
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

/**
 * Wizard navigation store
 *
 * Rules:
 * - Users can only advance if canProceed(currentStep) returns true
 * - Once a step is visited, it becomes freely revisitable
 * - Step 0 is always visited by default
 */
export const useWizardStore = create<WizardState>()(
  immer((set, get) => ({
    // Initial state
    currentStep: 0,
    visitedSteps: new Set([0]), // Step 0 starts visited
    validationErrors: new Map(),
    selectedSlot: null,

    // Go to a specific step
    goToStep: (step) =>
      set((state) => {
        // Can only go to visited steps or the next unvisited step if valid
        const canGoToStep =
          state.visitedSteps.has(step) ||
          (step === state.currentStep + 1 && canProceed(state.currentStep));

        if (canGoToStep && step >= 0 && step <= 3) {
          state.currentStep = step;
          state.visitedSteps.add(step);
        } else {
          console.warn(`Cannot navigate to step ${step}. Validation may have failed.`);
        }
      }),

    // Go to next step
    nextStep: () =>
      set((state) => {
        const nextStep = state.currentStep + 1;
        if (nextStep <= 3 && canProceed(state.currentStep)) {
          state.currentStep = nextStep;
          state.visitedSteps.add(nextStep);
          state.validationErrors.clear(); // Clear errors when moving forward
        } else {
          console.warn(
            `Cannot proceed to step ${nextStep}. Validation failed for step ${state.currentStep}.`
          );
        }
      }),

    // Go to previous step
    prevStep: () =>
      set((state) => {
        const prevStep = state.currentStep - 1;
        if (prevStep >= 0) {
          state.currentStep = prevStep;
          state.validationErrors.clear(); // Clear errors when going back
        }
      }),

    // Set a validation error for a specific field
    setValidationError: (field, error) =>
      set((state) => {
        state.validationErrors.set(field, error);
      }),

    // Clear all validation errors
    clearErrors: () =>
      set((state) => {
        state.validationErrors.clear();
      }),

    // Select a slot for module picker
    selectSlot: (slotId, slotType) =>
      set((state) => {
        state.selectedSlot = { id: slotId, type: slotType };
      }),

    // Clear selected slot (close module picker)
    clearSelectedSlot: () =>
      set((state) => {
        state.selectedSlot = null;
      }),
  }))
);

// ============================================================================
// HELPER: CHECK IF CAN PROCEED
// ============================================================================

/**
 * Helper function to check if user can proceed from current step
 * Use this to enable/disable Next button
 *
 * Example:
 * ```tsx
 * const currentStep = useWizardStore(state => state.currentStep);
 * const canGoNext = canProceedFromCurrentStep(currentStep);
 * return <Button disabled={!canGoNext}>Next</Button>
 * ```
 */
export function canProceedFromCurrentStep(step: number): boolean {
  return canProceed(step);
}

// ============================================================================
// HELPER: GET STEP NAME
// ============================================================================

/**
 * Get the step name from step index
 */
export function getStepName(step: number): WizardStep {
  const steps: WizardStep[] = ['dimensions', 'layout', 'finishes', 'review'];
  return steps[step] || 'dimensions';
}
