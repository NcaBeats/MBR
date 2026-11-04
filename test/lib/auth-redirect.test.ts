import { describe, test, expect } from "vitest";

import {
  destinationFor,
  homeForRole,
  safeInternalPath,
} from "@/lib/auth-redirect";

describe("safeInternalPath", () => {
  test("acepta rutas internas", () => {
    expect(safeInternalPath("/cart")).toBe("/cart");
    expect(safeInternalPath("/checkout?step=1")).toBe("/checkout?step=1");
  });

  test("rechaza URLs externas y protocol-relative", () => {
    expect(safeInternalPath("https://evil.com")).toBeNull();
    expect(safeInternalPath("//evil.com")).toBeNull();
    expect(safeInternalPath("/\\evil.com")).toBeNull();
    expect(safeInternalPath("cart")).toBeNull();
  });

  test("rechaza vacios", () => {
    expect(safeInternalPath(null)).toBeNull();
    expect(safeInternalPath(undefined)).toBeNull();
    expect(safeInternalPath("")).toBeNull();
  });
});

describe("homeForRole", () => {
  test("mapea cada rol a su panel", () => {
    expect(homeForRole("ADMIN")).toBe("/admin");
    expect(homeForRole("VENDEDOR")).toBe("/studio/games");
    expect(homeForRole("CLIENTE")).toBe("/");
  });
});

describe("destinationFor", () => {
  test("prioriza next cuando es seguro", () => {
    expect(destinationFor("CLIENTE", "/cart")).toBe("/cart");
  });

  test("cae al home del rol si next es invalido", () => {
    expect(destinationFor("ADMIN", "https://evil.com")).toBe("/admin");
    expect(destinationFor("CLIENTE", null)).toBe("/");
  });
});
