/**
 * Types for Production Spec PDF Generation
 *
 * These types define the structure of production specification data
 * used to generate PDF documents for factory/workshop use.
 */

/**
 * Order information displayed in header
 */
export interface OrderInfo {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  dueDate?: string;
}

/**
 * Cabinet in the production schedule
 */
export interface CabinetItem {
  cabinetId: string;
  type: string; // e.g., "Base Cabinet", "Overhead Cabinet"
  width: number; // mm
  height: number; // mm
  depth: number; // mm
  quantity: number;
  notes?: string;
}

/**
 * Panel in the cutting schedule
 */
export interface PanelItem {
  panelId: string;
  cabinetId: string;
  type: string; // e.g., "Side", "Top", "Bottom", "Back", "Shelf"
  material: string;
  width: number; // mm
  height: number; // mm
  thickness: number; // mm
  quantity: number;
  edgeBanding?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  qrCode: string; // QR code for panel identification
}

/**
 * Edge banding requirement
 */
export interface EdgeBandingItem {
  material: string;
  color: string;
  thickness: string; // e.g., "2mm"
  totalLength: number; // mm
}

/**
 * Hardware item in BOM
 */
export interface HardwareItem {
  code: string;
  description: string;
  supplier: string;
  quantity: number;
  notes?: string;
}

/**
 * Drilling position for a hole
 */
export interface HolePosition {
  x: number; // mm from left edge
  y: number; // mm from bottom edge
  diameter: number; // mm
  depth: number; // mm
  type: string; // e.g., "shelf-pin", "hinge", "handle"
}

/**
 * Drilling schedule for a panel
 */
export interface DrillingItem {
  panelId: string;
  cabinetId: string;
  panelType: string;
  holes: HolePosition[];
  notes?: string;
}

/**
 * Assembly group showing which panels form a cabinet
 */
export interface AssemblyGroup {
  cabinetId: string;
  cabinetType: string;
  panels: {
    panelId: string;
    role: string; // e.g., "Left Side", "Right Side", "Top", "Bottom", "Back"
  }[];
  hardware: string[]; // Hardware codes required for this cabinet
  assemblyOrder?: string[]; // Optional step-by-step assembly order
  notes?: string;
}

/**
 * Complete production specification data
 */
export interface ProductionSpecData {
  order: OrderInfo;
  cabinets: CabinetItem[];
  panels: PanelItem[];
  edgeBanding: EdgeBandingItem[];
  hardware: HardwareItem[];
  drilling: DrillingItem[];
  assembly: AssemblyGroup[];
}
