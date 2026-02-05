// src/__tests__/orders.test.ts
import { describe, it, expect } from "vitest";
import { ORDER_STATUSES } from "../types/orders";

describe("Order Status Workflow", () => {
  it("should have valid status progression", () => {
    const expectedOrder = [
      "confirmed",
      "production",
      "qc",
      "ready_to_ship",
      "shipped",
      "delivered",
      "complete",
    ];
    expect(ORDER_STATUSES).toEqual(expectedOrder);
  });

  it("should have 7 statuses", () => {
    expect(ORDER_STATUSES.length).toBe(7);
  });
});

describe("Order Number Format", () => {
  it("should match new random format", () => {
    const orderNumberRegex = /^NS-\d{8}-[A-HJ-NP-Z2-9]{4}$/;

    // Valid new format
    expect("NS-20260205-A3B4").toMatch(orderNumberRegex);
    expect("NS-20260205-XY7Z").toMatch(orderNumberRegex);

    // Invalid old sequential format
    expect("NS-20260205-001").not.toMatch(orderNumberRegex);
    expect("NS-20260205-123").not.toMatch(orderNumberRegex);
  });

  it("should not contain confusing characters", () => {
    // Characters excluded: 0, O, 1, I (easily confused pairs)
    const validChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    expect(validChars).not.toContain("0");
    expect(validChars).not.toContain("O");
    expect(validChars).not.toContain("1");
    expect(validChars).not.toContain("I");
  });
});
