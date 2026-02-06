import type { ModuleType } from '@/types/configurator';

export interface ModuleDef {
  type: ModuleType;
  name: string;
  description: string;
}

// Base modules (7 types)
export const BASE_MODULES: ModuleDef[] = [
  { type: 'standard', name: 'Standard Cabinet', description: 'Shelf and door' },
  { type: 'sink-base', name: 'Sink Base', description: 'Open for plumbing' },
  { type: 'drawer-stack', name: 'Drawer Stack', description: '3-4 drawers' },
  { type: 'pull-out-pantry', name: 'Pull-out Pantry', description: 'Tall pull-out' },
  { type: 'corner-base', name: 'Corner Cabinet', description: 'L-shaped corner' },
  { type: 'appliance-tower', name: 'Appliance Tower', description: 'Oven/microwave' },
  { type: 'open-shelving', name: 'Open Shelving', description: 'No doors' },
];

// Overhead modules (5 types)
export const OVERHEAD_MODULES: ModuleDef[] = [
  { type: 'standard-overhead', name: 'Standard Overhead', description: 'Single door' },
  { type: 'glass-door', name: 'Glass Door', description: 'Display cabinet' },
  { type: 'open-shelf', name: 'Open Shelf', description: 'No doors' },
  { type: 'rangehood-space', name: 'Rangehood Space', description: 'For rangehood' },
  { type: 'lift-up-door', name: 'Lift-up Door', description: 'Lifts upward' },
];
