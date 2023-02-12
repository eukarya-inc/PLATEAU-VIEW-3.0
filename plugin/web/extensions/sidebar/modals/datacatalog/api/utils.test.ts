import { expect, test } from "vitest";

import { makeTree } from "./utils";

test("makeTree", () => {
  expect(
    makeTree([
      { path: ["a", "b", "c"], id: "c" },
      { path: ["d"], id: "d" },
      { path: ["a", "e"], id: "e" },
    ]),
  ).toEqual([
    {
      name: "a",
      children: [
        {
          name: "b",
          children: [
            {
              name: "c",
              item: { path: ["a", "b", "c"], id: "c" },
            },
          ],
        },
        {
          name: "e",
          item: { path: ["a", "e"], id: "e" },
        },
      ],
    },
    {
      name: "d",
      item: { path: ["d"], id: "d" },
    },
  ]);
});
