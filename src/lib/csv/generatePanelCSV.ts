import { jsonToCSV } from "react-papaparse";

/**
 * Panel item for CSV export
 */
export interface PanelItem {
  id: string;
  name: string;
  cabinetRef: string;
  width: number;
  height: number;
  thickness: number;
  material: string;
  grainDirection?: "horizontal" | "vertical" | "none";
  edgeTop?: boolean;
  edgeBottom?: boolean;
  edgeLeft?: boolean;
  edgeRight?: boolean;
}

/**
 * Export panel schedule as CSV
 *
 * IMPORTANT per RESEARCH.md:
 * - Excel can interpret dimensions like "3/4" as dates
 * - Prefix numeric strings with single quote if needed
 * - jsonToCSV handles escaping commas/quotes automatically
 */
export function downloadPanelCSV(panels: PanelItem[], orderNumber: string): void {
  // Flatten to CSV-friendly format
  const data = panels.map((panel, index) => ({
    "Row": index + 1,
    "Panel ID": panel.id,
    "Name": panel.name,
    "Cabinet Ref": panel.cabinetRef,
    "Width (mm)": panel.width,
    "Height (mm)": panel.height,
    "Thickness (mm)": panel.thickness,
    "Material": panel.material,
    "Grain": panel.grainDirection || "N/A",
    "Edge Top": panel.edgeTop ? "Yes" : "No",
    "Edge Bottom": panel.edgeBottom ? "Yes" : "No",
    "Edge Left": panel.edgeLeft ? "Yes" : "No",
    "Edge Right": panel.edgeRight ? "Yes" : "No",
  }));

  const csv = jsonToCSV(data);
  triggerDownload(csv, `${orderNumber}-panel-schedule.csv`);
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
