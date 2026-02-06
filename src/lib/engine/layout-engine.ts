/**
 * Layout Engine
 *
 * Deterministic TypeScript function that converts AI intent
 * (walls, style, priorities, budget) into a valid CabinetConfig.
 *
 * No LLM calls — pure constraint-based logic.
 * The AI decides WHAT the user wants; this engine decides HOW to build it.
 */

import type {
  CabinetConfig,
  CabinetDimensions,
  ModuleConfig,
  ModuleType,
  SlotConfig,
  FinishConfig,
  InteriorOptions,
} from '@/types/configurator';

// ============================================================================
// INPUT TYPES
// ============================================================================

/** A wall segment detected from the user's photo */
export interface WallSegment {
  label: string;        // "Long wall", "Side wall", etc.
  lengthMm: number;     // Length in millimetres
  selected: boolean;    // Whether user wants cabinetry here
}

/** Room shape derived from wall segments */
export type RoomShape = 'straight' | 'l-shape' | 'u-shape';

/** Budget tier affects material and module selection */
export type BudgetTier = 'value' | 'mid' | 'premium' | 'unknown';

/** User priorities from the discovery conversation */
export type Priority =
  | 'storage'
  | 'clean-look'
  | 'easy-clean'
  | 'value'
  | 'wow-factor';

/** Complete input from discovery + wall detection */
export interface LayoutIntent {
  walls: WallSegment[];
  purpose: 'kitchen' | 'laundry' | 'pantry' | 'other';
  budgetTier: BudgetTier;
  priorities: Priority[];
  specificRequests: string[];  // "wine rack", "dog bowl space", etc.
  finishes: {
    material: string;     // Product catalog code
    hardware: string;     // Product catalog code
    doorProfile: string;  // Product catalog code
  };
}

/** Output from the layout engine */
export interface LayoutResult {
  config: CabinetConfig;
  shape: RoomShape;
  wallAssignments: WallAssignment[];
  description: string;  // Plain-language summary for the AI to present
}

/** Which modules are on which wall */
export interface WallAssignment {
  wallLabel: string;
  wallLengthMm: number;
  modules: PlacedModule[];
  usedMm: number;
  remainingMm: number;
}

interface PlacedModule {
  slotId: string;
  type: ModuleType;
  widthMm: number;
  position: 'base' | 'overhead';
  label: string;  // Plain-language: "Drawers", "Sink cabinet", etc.
}

// ============================================================================
// MODULE CATALOGUE (widths and constraints)
// ============================================================================

interface ModuleSpec {
  type: ModuleType;
  position: 'base' | 'overhead';
  defaultWidthMm: number;
  minWidthMm: number;
  maxWidthMm: number;
  label: string;         // Plain-language name
  description: string;   // One-line for the user
  required?: boolean;    // Must be placed (e.g. sink for kitchen)
  priority: number;      // Higher = placed first (1-10)
}

const MODULE_SPECS: ModuleSpec[] = [
  // Base modules — ordered by placement priority
  { type: 'sink-base',       position: 'base', defaultWidthMm: 900,  minWidthMm: 600,  maxWidthMm: 1200, label: 'Sink cabinet',     description: 'Space for your sink and plumbing', required: true, priority: 10 },
  { type: 'corner-base',     position: 'base', defaultWidthMm: 900,  minWidthMm: 800,  maxWidthMm: 1000, label: 'Corner carousel',   description: 'Makes corner space usable',        priority: 9 },
  { type: 'appliance-tower', position: 'base', defaultWidthMm: 600,  minWidthMm: 600,  maxWidthMm: 600,  label: 'Tall oven cabinet', description: 'For your oven and microwave',       priority: 8 },
  { type: 'drawer-stack',    position: 'base', defaultWidthMm: 600,  minWidthMm: 450,  maxWidthMm: 900,  label: 'Drawers',          description: 'Great for pots, utensils, cutlery', priority: 7 },
  { type: 'pull-out-pantry', position: 'base', defaultWidthMm: 450,  minWidthMm: 300,  maxWidthMm: 600,  label: 'Pull-out pantry',  description: 'Tall pull-out storage',              priority: 6 },
  { type: 'standard',        position: 'base', defaultWidthMm: 600,  minWidthMm: 300,  maxWidthMm: 900,  label: 'Cabinet',          description: 'Classic storage with shelf',         priority: 5 },
  { type: 'open-shelving',   position: 'base', defaultWidthMm: 400,  minWidthMm: 300,  maxWidthMm: 600,  label: 'Open shelves',     description: 'Display your favourite pieces',      priority: 3 },

  // Overhead modules
  { type: 'rangehood-space',    position: 'overhead', defaultWidthMm: 900,  minWidthMm: 600,  maxWidthMm: 900,  label: 'Rangehood space',   description: 'For your rangehood',      priority: 9 },
  { type: 'standard-overhead',  position: 'overhead', defaultWidthMm: 600,  minWidthMm: 300,  maxWidthMm: 900,  label: 'Wall cabinet',      description: 'Upper storage',           priority: 7 },
  { type: 'glass-door',         position: 'overhead', defaultWidthMm: 450,  minWidthMm: 300,  maxWidthMm: 600,  label: 'Display cabinet',   description: 'Glass door cabinet',      priority: 5 },
  { type: 'open-shelf',         position: 'overhead', defaultWidthMm: 400,  minWidthMm: 300,  maxWidthMm: 600,  label: 'Open shelf',        description: 'Open display shelf',      priority: 4 },
  { type: 'lift-up-door',       position: 'overhead', defaultWidthMm: 600,  minWidthMm: 450,  maxWidthMm: 900,  label: 'Lift-up cabinet',   description: 'Lifts up for easy access', priority: 3 },
];

function getSpec(type: ModuleType): ModuleSpec {
  const spec = MODULE_SPECS.find(s => s.type === type);
  if (!spec) throw new Error(`Unknown module type: ${type}`);
  return spec;
}

// ============================================================================
// LAYOUT ENGINE
// ============================================================================

/**
 * Generate a complete kitchen layout from user intent.
 *
 * Algorithm:
 * 1. Determine room shape from selected walls
 * 2. Place required modules first (sink, corner if L/U)
 * 3. Fill remaining space based on priorities
 * 4. Generate matching overhead modules
 * 5. Apply finishes
 * 6. Generate plain-language description
 */
export function generateLayout(intent: LayoutIntent): LayoutResult {
  const selectedWalls = intent.walls.filter(w => w.selected);
  if (selectedWalls.length === 0) {
    throw new Error('At least one wall must be selected');
  }

  const shape = detectShape(selectedWalls);
  const totalWidthMm = selectedWalls.reduce((sum, w) => sum + w.lengthMm, 0);

  // Build dimensions from longest wall
  const longestWall = selectedWalls.reduce((a, b) => a.lengthMm > b.lengthMm ? a : b);
  const dimensions: CabinetDimensions = {
    width: totalWidthMm,
    height: 2100,  // Standard kitchen height
    depth: 600,    // Standard base depth
  };

  // Plan base modules for each wall
  const wallAssignments = planWallModules(selectedWalls, shape, intent);

  // Generate overhead modules (mirrors base layout roughly)
  addOverheadModules(wallAssignments, intent);

  // Convert to CabinetConfig
  const slots = new Map<string, SlotConfig>();
  let slotIndex = 0;

  for (const wall of wallAssignments) {
    let xOffset = 0;
    for (const mod of wall.modules) {
      const slotId = `${mod.position}-${slotIndex}`;
      mod.slotId = slotId;

      const moduleConfig: ModuleConfig = {
        type: mod.type,
        width: mod.widthMm,
        interiorOptions: getDefaultInterior(mod.type),
        addons: [],
      };

      slots.set(slotId, {
        id: slotId,
        position: mod.position,
        x: xOffset,
        module: moduleConfig,
      });

      xOffset += mod.widthMm;
      slotIndex++;
    }
  }

  const config: CabinetConfig = {
    dimensions,
    slots,
    finishes: intent.finishes,
  };

  const description = generateDescription(wallAssignments, intent, shape);

  return {
    config,
    shape,
    wallAssignments,
    description,
  };
}

// ============================================================================
// SHAPE DETECTION
// ============================================================================

function detectShape(walls: WallSegment[]): RoomShape {
  if (walls.length === 1) return 'straight';
  if (walls.length === 2) return 'l-shape';
  return 'u-shape';
}

// ============================================================================
// WALL MODULE PLANNING
// ============================================================================

function planWallModules(
  walls: WallSegment[],
  shape: RoomShape,
  intent: LayoutIntent,
): WallAssignment[] {
  const assignments: WallAssignment[] = walls.map(w => ({
    wallLabel: w.label,
    wallLengthMm: w.lengthMm,
    modules: [],
    usedMm: 0,
    remainingMm: w.lengthMm,
  }));

  // For L/U shapes, place corner module at the junction
  if (shape !== 'straight' && assignments.length >= 2) {
    placeCornerModule(assignments);
  }

  // Place required modules on the longest wall
  const longestIdx = assignments.reduce(
    (bestIdx, curr, idx, arr) =>
      curr.remainingMm > arr[bestIdx].remainingMm ? idx : bestIdx,
    0,
  );

  // Place sink (required for kitchens)
  if (intent.purpose === 'kitchen') {
    placeModule(assignments[longestIdx], 'sink-base', 900);
  }

  // Place appliance tower if there's enough space
  if (intent.purpose === 'kitchen') {
    const towerWall = assignments.find(a => a.remainingMm >= 600) ?? assignments[longestIdx];
    if (towerWall.remainingMm >= 600) {
      placeModule(towerWall, 'appliance-tower', 600);
    }
  }

  // Fill remaining space based on priorities
  for (const wall of assignments) {
    fillWallWithPriorityModules(wall, intent);
  }

  return assignments;
}

function placeCornerModule(assignments: WallAssignment[]): void {
  // Corner goes at the end of the first wall / start of the second
  const cornerSpec = getSpec('corner-base');
  const cornerWidth = cornerSpec.defaultWidthMm;

  // Deduct space from both walls meeting at the corner
  if (assignments[0].remainingMm >= cornerWidth / 2 && assignments[1].remainingMm >= cornerWidth / 2) {
    const placed: PlacedModule = {
      slotId: '', // Assigned later
      type: 'corner-base',
      widthMm: cornerWidth,
      position: 'base',
      label: cornerSpec.label,
    };
    assignments[0].modules.push(placed);
    assignments[0].usedMm += cornerWidth / 2;
    assignments[0].remainingMm -= cornerWidth / 2;
    assignments[1].usedMm += cornerWidth / 2;
    assignments[1].remainingMm -= cornerWidth / 2;
  }
}

function placeModule(wall: WallAssignment, type: ModuleType, widthMm: number): boolean {
  const spec = getSpec(type);
  const width = Math.min(Math.max(widthMm, spec.minWidthMm), spec.maxWidthMm);

  if (wall.remainingMm < width) return false;

  wall.modules.push({
    slotId: '',
    type,
    widthMm: width,
    position: spec.position,
    label: spec.label,
  });
  wall.usedMm += width;
  wall.remainingMm -= width;
  return true;
}

function fillWallWithPriorityModules(wall: WallAssignment, intent: LayoutIntent): void {
  const hasStorage = intent.priorities.includes('storage');
  const hasCleanLook = intent.priorities.includes('clean-look');
  const hasWowFactor = intent.priorities.includes('wow-factor');

  // Define the fill order based on priorities
  const fillOrder: ModuleType[] = [];

  if (hasStorage) {
    fillOrder.push('drawer-stack', 'pull-out-pantry', 'standard', 'drawer-stack');
  } else if (hasCleanLook) {
    fillOrder.push('drawer-stack', 'standard', 'drawer-stack', 'standard');
  } else if (hasWowFactor) {
    fillOrder.push('drawer-stack', 'open-shelving', 'standard', 'drawer-stack');
  } else {
    // Balanced default
    fillOrder.push('drawer-stack', 'standard', 'drawer-stack', 'standard');
  }

  // Check specific requests
  if (intent.specificRequests.some(r => r.toLowerCase().includes('wine'))) {
    fillOrder.unshift('open-shelving'); // Wine rack goes in open shelving slot
  }

  // Fill available space
  let fillIdx = 0;
  const minModuleWidth = 300;

  while (wall.remainingMm >= minModuleWidth && fillIdx < fillOrder.length) {
    const type = fillOrder[fillIdx];
    const spec = getSpec(type);
    const width = Math.min(spec.defaultWidthMm, wall.remainingMm);

    if (width >= spec.minWidthMm) {
      placeModule(wall, type, width);
    }
    fillIdx++;
  }

  // If there's still space, fill with standard cabinets
  while (wall.remainingMm >= 300) {
    const width = Math.min(600, wall.remainingMm);
    if (width >= 300) {
      placeModule(wall, 'standard', width);
    } else {
      break;
    }
  }
}

// ============================================================================
// OVERHEAD MODULE PLANNING
// ============================================================================

function addOverheadModules(assignments: WallAssignment[], intent: LayoutIntent): void {
  for (const wall of assignments) {
    const baseModules = wall.modules.filter(m => m.position === 'base');
    let overheadBudgetMm = wall.wallLengthMm;

    // Skip overhead above appliance tower (it's tall)
    const hasTower = baseModules.some(m => m.type === 'appliance-tower');

    for (const baseMod of baseModules) {
      if (overheadBudgetMm < 300) break;

      // No overhead above corner (handled separately) or tower
      if (baseMod.type === 'corner-base' || baseMod.type === 'appliance-tower') {
        continue;
      }

      // Rangehood above cooktop area (near sink typically)
      if (baseMod.type === 'sink-base') {
        // Put rangehood space above or near sink area
        const rhWidth = Math.min(900, overheadBudgetMm);
        if (rhWidth >= 600) {
          wall.modules.push({
            slotId: '',
            type: 'rangehood-space',
            widthMm: rhWidth,
            position: 'overhead',
            label: 'Rangehood space',
          });
          overheadBudgetMm -= rhWidth;
          continue;
        }
      }

      // Match overhead to base width where possible
      const ohWidth = Math.min(baseMod.widthMm, overheadBudgetMm);
      if (ohWidth >= 300) {
        // Add a display cabinet if wow-factor is a priority
        const ohType: ModuleType =
          intent.priorities.includes('wow-factor') && wall.modules.filter(m => m.type === 'glass-door').length === 0
            ? 'glass-door'
            : 'standard-overhead';

        wall.modules.push({
          slotId: '',
          type: ohType,
          widthMm: ohWidth,
          position: 'overhead',
          label: getSpec(ohType).label,
        });
        overheadBudgetMm -= ohWidth;
      }
    }
  }
}

// ============================================================================
// DEFAULT INTERIOR OPTIONS
// ============================================================================

function getDefaultInterior(type: ModuleType): InteriorOptions {
  switch (type) {
    case 'drawer-stack':
      return { drawerCount: 3, softClose: true };
    case 'pull-out-pantry':
      return { basketCount: 4, pullOut: true, softClose: true };
    case 'sink-base':
      return { cutoutForSink: true };
    case 'standard':
      return { shelfCount: 1, softClose: true };
    case 'corner-base':
      return { pullOut: true, softClose: true };
    case 'appliance-tower':
      return { shelfCount: 2 };
    case 'open-shelving':
      return { shelfCount: 3 };
    case 'standard-overhead':
      return { shelfCount: 1, softClose: true };
    case 'glass-door':
      return { shelfCount: 2, softClose: true };
    case 'open-shelf':
      return { shelfCount: 2 };
    case 'rangehood-space':
      return {};
    case 'lift-up-door':
      return { shelfCount: 1 };
    default:
      return {};
  }
}

// ============================================================================
// DESCRIPTION GENERATOR
// ============================================================================

function generateDescription(
  assignments: WallAssignment[],
  intent: LayoutIntent,
  shape: RoomShape,
): string {
  const shapeLabel =
    shape === 'straight' ? 'a straight run' :
    shape === 'l-shape' ? 'an L-shape' :
    'a U-shape';

  const allModules = assignments.flatMap(a => a.modules);
  const baseModules = allModules.filter(m => m.position === 'base');
  const overheadModules = allModules.filter(m => m.position === 'overhead');

  // Count module types for the description
  const drawerCount = baseModules.filter(m => m.type === 'drawer-stack').length;
  const hasCorner = baseModules.some(m => m.type === 'corner-base');
  const hasPantry = baseModules.some(m => m.type === 'pull-out-pantry');
  const hasTower = baseModules.some(m => m.type === 'appliance-tower');

  const parts: string[] = [];
  parts.push(`I've designed ${shapeLabel} layout for your ${intent.purpose}`);

  const wallDesc = assignments
    .map(a => `${(a.wallLengthMm / 1000).toFixed(1)}m`)
    .join(' + ');
  parts.push(`across ${wallDesc} of wall space.`);

  // Highlight key features
  const features: string[] = [];
  if (drawerCount > 0) features.push(`${drawerCount} sets of drawers near where you'll prep food`);
  if (hasCorner) features.push('a corner carousel so nothing gets lost in the corner');
  if (hasPantry) features.push('a pull-out pantry for easy access to everything');
  if (hasTower) features.push('a tall cabinet for your oven');
  if (overheadModules.length > 0) features.push(`${overheadModules.length} wall cabinets above for extra storage`);

  if (features.length > 0) {
    parts.push(`I've included ${features.join(', ')}.`);
  }

  return parts.join(' ');
}

// ============================================================================
// UTILITY: Convert layout result to serializable format (for Convex storage)
// ============================================================================

export interface SerializedConfig {
  dimensions: CabinetDimensions;
  slots: Array<{ id: string; position: 'base' | 'overhead'; x: number; module: ModuleConfig | null }>;
  finishes: FinishConfig;
}

/** Convert CabinetConfig (with Map) to plain object for storage */
export function serializeConfig(config: CabinetConfig): SerializedConfig {
  return {
    dimensions: { ...config.dimensions },
    slots: Array.from(config.slots.values()).map(slot => ({
      id: slot.id,
      position: slot.position,
      x: slot.x,
      module: slot.module ? { ...slot.module } : null,
    })),
    finishes: { ...config.finishes },
  };
}

/** Restore CabinetConfig from serialized format */
export function deserializeConfig(data: SerializedConfig): CabinetConfig {
  const slots = new Map<string, SlotConfig>();
  for (const slot of data.slots) {
    slots.set(slot.id, {
      id: slot.id,
      position: slot.position,
      x: slot.x,
      module: slot.module,
    });
  }
  return {
    dimensions: { ...data.dimensions },
    slots,
    finishes: { ...data.finishes },
  };
}
