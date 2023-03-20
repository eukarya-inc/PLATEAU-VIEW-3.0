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
      id: "node-0",
      name: "a",
      children: [
        {
          id: "node-1",
          name: "b",
          children: [
            {
              id: "node-2",
              name: "c",
              item: { path: ["a", "b", "c"], id: "c" },
            },
          ],
        },
        {
          id: "node-4",
          name: "e",
          item: { path: ["a", "e"], id: "e" },
        },
      ],
    },
    {
      id: "node-3",
      name: "d",
      item: { path: ["d"], id: "d" },
    },
  ]);
});
