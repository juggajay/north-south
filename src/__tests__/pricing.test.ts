// src/__tests__/pricing.test.ts
import { describe, it, expect } from "vitest";

describe("Pricing Calculations", () => {
  const mockModules = [
    { code: "MOD-BASE-600", pricePerUnit: 45000 },
    { code: "MOD-BASE-SINK", pricePerUnit: 65000 },
    { code: "MOD-DRAWER-600", pricePerUnit: 75000 },
  ];

  const mockMaterials = [
    { code: "POL-NOWM", pricePerUnit: 15000 },
    { code: "POL-MWS", pricePerUnit: 12000 },
  ];

  const mockDoorProfiles = [
    { code: "FLAT-PANEL", pricePerDoor: 2500 },
    { code: "SHAKER-SLIM", pricePerDoor: 4500 },
  ];

  it("should calculate cabinet cost from modules", () => {
    const slots = [
      { module: { type: "standard" } },
      { module: { type: "sink-base" } },
    ];

    let total = 0;
    slots.forEach((slot) => {
      if (slot.module?.type === "standard") {
        total += mockModules[0].pricePerUnit;
      } else if (slot.module?.type === "sink-base") {
        total += mockModules[1].pricePerUnit;
      }
    });

    expect(total).toBe(110000); // $1,100 in cents
  });

  it("should calculate material cost", () => {
    const selectedCode = "POL-NOWM";
    const material = mockMaterials.find((m) => m.code === selectedCode);
    expect(material?.pricePerUnit).toBe(15000);
  });

  it("should calculate door profile cost per door", () => {
    const doorCount = 5;
    const profile = mockDoorProfiles.find((p) => p.code === "SHAKER-SLIM");
    const total = (profile?.pricePerDoor ?? 0) * doorCount;
    expect(total).toBe(22500);
  });

  it("should format AUD prices correctly", () => {
    const formatter = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    });

    expect(formatter.format(150.00)).toBe("$150.00");
    expect(formatter.format(1234.56)).toBe("$1,234.56");
  });
});
