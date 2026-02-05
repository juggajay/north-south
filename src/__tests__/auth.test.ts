// src/__tests__/auth.test.ts
import { describe, it, expect } from "vitest";

const ADMIN_DOMAIN = "@northsouthcarpentry.com";

// Test admin email domain logic (mirrors convex/lib/auth.ts)
describe("Admin Email Validation", () => {
  const isAdminEmail = (email: string | undefined): boolean => {
    if (!email) return false;
    return email.endsWith(ADMIN_DOMAIN);
  };

  it("should identify admin emails", () => {
    expect(isAdminEmail("admin@northsouthcarpentry.com")).toBe(true);
    expect(isAdminEmail("john@northsouthcarpentry.com")).toBe(true);
    expect(isAdminEmail("a@northsouthcarpentry.com")).toBe(true);
  });

  it("should reject non-admin emails", () => {
    expect(isAdminEmail("user@gmail.com")).toBe(false);
    expect(isAdminEmail("admin@other-company.com")).toBe(false);
    expect(isAdminEmail("northsouthcarpentry.com@gmail.com")).toBe(false);
    expect(isAdminEmail("fake@northsouthcarpentry.com.fake.com")).toBe(false);
  });

  it("should handle edge cases", () => {
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
    expect(isAdminEmail("@northsouthcarpentry.com")).toBe(true); // technically valid
  });
});
