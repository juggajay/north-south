import type { PanelItem } from "../csv/generatePanelCSV";
import type { HardwareItem } from "../csv/generateHardwareCSV";

/**
 * Production spec data structure
 */
export interface ProductionSpecData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  cabinets: CabinetItem[];
  panels: PanelItem[];
  hardware: HardwareItem[];
  edgeBanding: EdgeBandingItem[];
  notes?: string;
}

export interface CabinetItem {
  id: string;
  type: string;
  position: number;
  width: number;
  height: number;
  depth: number;
  interiorConfig?: string;
}

export interface EdgeBandingItem {
  material: string;
  thickness: string;
  totalLength: number; // in meters
  panelCount: number;
}

interface OrderData {
  orderNumber: string;
  createdAt: number;
  submission?: {
    name: string;
    email: string;
    siteMeasure: boolean;
    installQuote: boolean;
    notes?: string;
  } | null;
  design?: {
    productType: string;
    config?: {
      dimensions?: { width: number; height: number; depth: number };
      slots?: Array<{
        position: number;
        module?: {
          type: string;
          interiorConfig?: any;
        } | null;
      }>;
      finishes?: {
        material?: { code: string; name: string };
        hardware?: { code: string; name: string; pricePerUnit: number };
        doorProfile?: { code: string; name: string };
      };
    };
  } | null;
}

/**
 * Transform order data from Convex into ProductionSpecData for PDF/CSV generation
 *
 * This function extracts and flattens nested design config into a format
 * suitable for production documentation.
 */
export function transformOrderToSpec(order: OrderData): ProductionSpecData {
  const config = order.design?.config || {};
  const dimensions = config.dimensions || { width: 2400, height: 800, depth: 560 };
  const slots = config.slots || [];
  const finishes = config.finishes || {};

  // Generate cabinets from slots
  const cabinets: CabinetItem[] = slots
    .filter((slot) => slot.module)
    .map((slot, index) => ({
      id: `CAB-${String(index + 1).padStart(2, "0")}`,
      type: slot.module?.type || "Unknown",
      position: slot.position,
      width: 600, // Default slot width
      height: dimensions.height,
      depth: dimensions.depth,
      interiorConfig: formatInteriorConfig(slot.module?.interiorConfig),
    }));

  // Generate panels from cabinets
  // Each cabinet generates: Left Side, Right Side, Back, Top, Bottom, plus shelves/doors
  const panels: PanelItem[] = [];
  const materialCode = finishes.material?.code || "Unknown";

  cabinets.forEach((cab, cabIndex) => {
    const panelPrefix = `P${String(cabIndex + 1).padStart(2, "0")}`;

    // Standard panels for each cabinet
    const standardPanels: Array<Omit<PanelItem, "id" | "cabinetRef">> = [
      { name: "Left Side", width: cab.depth, height: cab.height, thickness: 18, material: materialCode, grainDirection: "vertical" as const, edgeLeft: true },
      { name: "Right Side", width: cab.depth, height: cab.height, thickness: 18, material: materialCode, grainDirection: "vertical" as const, edgeRight: true },
      { name: "Back", width: cab.width - 36, height: cab.height - 18, thickness: 6, material: materialCode },
      { name: "Top Rail", width: cab.width - 36, height: 100, thickness: 18, material: materialCode },
      { name: "Bottom", width: cab.width - 36, height: cab.depth - 18, thickness: 18, material: materialCode, edgeTop: true },
    ];

    standardPanels.forEach((panel, panelIndex) => {
      panels.push({
        ...panel,
        id: `${panelPrefix}-${String(panelIndex + 1).padStart(2, "0")}`,
        cabinetRef: cab.id,
      });
    });
  });

  // Calculate edge banding summary
  const edgeBanding: EdgeBandingItem[] = calculateEdgeBanding(panels, finishes.material?.name || "Unknown");

  // Generate hardware list based on cabinet types
  const hardware: HardwareItem[] = generateHardwareList(cabinets, finishes.hardware);

  return {
    orderNumber: order.orderNumber,
    customerName: order.submission?.name || "Unknown",
    customerEmail: order.submission?.email || "",
    createdAt: new Date(order.createdAt).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    cabinets,
    panels,
    hardware,
    edgeBanding,
    notes: order.submission?.notes,
  };
}

function formatInteriorConfig(config: any): string | undefined {
  if (!config) return undefined;

  const parts: string[] = [];
  if (config.shelfCount) parts.push(`${config.shelfCount} shelves`);
  if (config.drawerCount) parts.push(`${config.drawerCount} drawers`);
  if (config.dividers) parts.push("dividers");
  if (config.ledStrip) parts.push("LED strip");
  if (config.pullOutBin) parts.push("pull-out bin");

  return parts.length > 0 ? parts.join(", ") : undefined;
}

function calculateEdgeBanding(panels: PanelItem[], materialName: string): EdgeBandingItem[] {
  // Count panels with edges
  let totalLength = 0;
  let panelCount = 0;

  panels.forEach((panel) => {
    const edges = [panel.edgeTop, panel.edgeBottom, panel.edgeLeft, panel.edgeRight].filter(Boolean);
    if (edges.length > 0) {
      panelCount++;
      // Calculate edge length in mm, convert to meters
      if (panel.edgeTop || panel.edgeBottom) totalLength += panel.width * edges.filter((_, i) => i < 2).length;
      if (panel.edgeLeft || panel.edgeRight) totalLength += panel.height * edges.filter((_, i) => i >= 2).length;
    }
  });

  if (panelCount === 0) return [];

  return [{
    material: materialName,
    thickness: "1mm",
    totalLength: totalLength / 1000, // Convert to meters
    panelCount,
  }];
}

function generateHardwareList(cabinets: CabinetItem[], hardwareOption: any): HardwareItem[] {
  const hardware: HardwareItem[] = [];

  // Count doors and drawers
  let doorCount = 0;
  let drawerCount = 0;

  cabinets.forEach((cab) => {
    // Estimate based on cabinet type
    if (cab.type.includes("Drawer")) {
      drawerCount += 3; // Assume drawer stack has 3 drawers
    } else if (cab.type.includes("Door") || cab.type === "StandardBase" || cab.type === "StandardOverhead") {
      doorCount += 1;
    }
  });

  // Hinges (2 per door)
  if (doorCount > 0) {
    hardware.push({
      code: hardwareOption?.code || "BLUM-CLIP-110",
      name: "Blum CLIP top 110 hinge",
      supplier: "Blum",
      quantity: doorCount * 2,
      unitPrice: hardwareOption?.pricePerUnit || 1200, // $12 in cents
    });
  }

  // Drawer runners
  if (drawerCount > 0) {
    hardware.push({
      code: "BLUM-TANDEM-500",
      name: "Blum TANDEM 500mm drawer runner (pair)",
      supplier: "Blum",
      quantity: drawerCount,
      unitPrice: 4500, // $45 in cents
    });
  }

  // Soft close (one per door/drawer)
  const softCloseCount = doorCount + drawerCount;
  if (softCloseCount > 0) {
    hardware.push({
      code: "BLUM-BLUMOTION",
      name: "Blum BLUMOTION soft close",
      supplier: "Blum",
      quantity: softCloseCount,
      unitPrice: 800, // $8 in cents
    });
  }

  return hardware;
}
