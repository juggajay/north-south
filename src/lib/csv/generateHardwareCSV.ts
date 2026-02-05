import { jsonToCSV } from "react-papaparse";

/**
 * Hardware item for CSV export
 */
export interface HardwareItem {
  code: string;
  name: string;
  supplier: string;
  quantity: number;
  unitPrice: number; // in cents
  notes?: string;
}

/**
 * Export hardware list (BOM) as CSV
 */
export function downloadHardwareCSV(hardware: HardwareItem[], orderNumber: string): void {
  const data = hardware.map((item, index) => ({
    "Row": index + 1,
    "Code": item.code,
    "Description": item.name,
    "Supplier": item.supplier,
    "Quantity": item.quantity,
    "Unit Price (AUD)": (item.unitPrice / 100).toFixed(2),
    "Total (AUD)": ((item.quantity * item.unitPrice) / 100).toFixed(2),
    "Notes": item.notes || "",
  }));

  // Add total row
  const totalCents = hardware.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  data.push({
    "Row": "",
    "Code": "",
    "Description": "TOTAL",
    "Supplier": "",
    "Quantity": "",
    "Unit Price (AUD)": "",
    "Total (AUD)": (totalCents / 100).toFixed(2),
    "Notes": "",
  } as any);

  const csv = jsonToCSV(data);
  triggerDownload(csv, `${orderNumber}-hardware-list.csv`);
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
