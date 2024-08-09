import { expect, test } from "vitest";

import { versionCompare } from "./reearth";

test("Version compare", () => {
  expect(versionCompare("2.0.0", "1.0.0")).toBeGreaterThan(0);
  expect(versionCompare("1.0.0", "2.0.0")).toBeLessThan(0);
  expect(versionCompare("1.0.0", "1.0.0")).toBe(0);
  expect(versionCompare("1.0.0", "1.0.1")).toBeLessThan(0);
  expect(versionCompare("1.0.1", "1.0.0")).toBeGreaterThan(0);
  expect(versionCompare("1.0.0", "1.1.0")).toBeLessThan(0);
  expect(versionCompare("1.1.0", "1.0.0")).toBeGreaterThan(0);
  expect(versionCompare("1.0.0", "1.0.0")).toBe(0);
  expect(versionCompare("", "1.0.0")).toBeLessThan(0);
});
