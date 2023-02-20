import { expect, test } from "vitest";

import { getRGBAFromString } from "./utils";

test("getRGBAFromString", () => {
  expect(getRGBAFromString("rgba(100, 24, 255, 1)")).toEqual([100, 24, 255, 1]);
});
