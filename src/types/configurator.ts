/**
 * TypeScript types for 3D cabinet configurator
 * Phase 04-01: R3F Foundation
 */

// ============================================================================
// CABINET DIMENSIONS
// ============================================================================

/**
 * Cabinet dimensions in millimeters
 */
export interface CabinetDimensions {
  width: number;  // mm, typically 1200-6000
  height: number; // mm, typically 1800-3500
  depth: number;  // mm, typically 300-900
}

// ============================================================================
// MODULE TYPES
// ============================================================================

/**
 * All 12 module types per requirements
 * - Base: 7 types
 * - Overhead: 5 types
 */
export type ModuleType =
  // Base modules
  | 'standard'
  | 'sink-base'
  | 'drawer-stack'
  | 'pull-out-pantry'
  | 'corner-base'
  | 'appliance-tower'
  | 'open-shelving'
  // Overhead modules
  | 'standard-overhead'
  | 'glass-door'
  | 'open-shelf'
  | 'rangehood-space'
  | 'lift-up-door';

// ============================================================================
// MODULE CONFIGURATION
// ============================================================================

/**
 * Interior options for a module (e.g., shelves, dividers, pull-outs)
 */
export interface InteriorOptions {
  shelfCount?: number;        // Adjustable shelf count
  drawerCount?: number;       // Number of drawers (drawer-stack)
  basketCount?: number;       // Number of baskets (pull-out-pantry)
  hasDividers?: boolean;      // Drawer dividers
  pullOut?: boolean;          // Pull-out mechanism
  softClose?: boolean;        // Soft-close hardware
  cutoutForSink?: boolean;    // Sink cutout (sink-base only)
  cutoutForCooktop?: boolean; // Cooktop cutout (rangehood-space)
}

/**
 * Configuration for a single module
 */
export interface ModuleConfig {
  type: ModuleType;
  width: number;                    // mm, module width
  interiorOptions: InteriorOptions;
  addons: string[];                 // Add-on IDs (e.g., lighting, glass inserts)
}

// ============================================================================
// SLOT CONFIGURATION
// ============================================================================

/**
 * A slot in the cabinet layout
 * Slots are pre-defined positions where modules can be placed
 */
export interface SlotConfig {
  id: string;                       // Unique slot ID
  position: 'base' | 'overhead';    // Vertical position
  x: number;                        // X position in mm (left edge)
  module: ModuleConfig | null;      // Module placed in this slot, or null if empty
}

// ============================================================================
// FINISH CONFIGURATION
// ============================================================================

/**
 * Material and hardware finishes
 */
export interface FinishConfig {
  material: string;      // Material ID (e.g., Polytec code)
  hardware: string;      // Hardware ID (e.g., Blum handle style)
  doorProfile: string;   // Door profile ID (e.g., shaker, flat-panel)
}

// ============================================================================
// COMPLETE CABINET CONFIG
// ============================================================================

/**
 * Complete cabinet configuration
 * This is the central data structure for the configurator
 */
export interface CabinetConfig {
  dimensions: CabinetDimensions;
  slots: Map<string, SlotConfig>;  // Map of slot ID to slot config
  finishes: FinishConfig;
}

// ============================================================================
// WIZARD STEPS
// ============================================================================

/**
 * 4-step wizard navigation
 */
export type WizardStep = 'dimensions' | 'layout' | 'finishes' | 'review';

// ============================================================================
// DESIGN VERSION
// ============================================================================

/**
 * A versioned snapshot of a cabinet configuration
 * Used for undo/redo and version history
 */
export interface DesignVersion {
  id: string;               // Unique version ID
  config: CabinetConfig;    // Complete configuration snapshot
  timestamp: number;        // Unix timestamp (ms)
}
