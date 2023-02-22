import { expect, test } from "vitest";

import { getExtension } from "./file";

test("getExtension", () => {
  expect(getExtension("test.geojson")).toBe("geojson");
  expect(getExtension("test.")).toBe("");
  expect(getExtension("test")).toBe("");
});
