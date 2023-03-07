import { BuildingColor } from "../types";
import { compareGreaterThan, defaultConditionalNumber, equalNumber } from "../utils";

type Condition = [condition: string, color: BuildingColor];

const DEFAULT_CONDITION: Condition = ["true", "rgba(255, 255, 255, 1)"];

const conditionalFloodRank = "rank_code";
export const FLOOD_CONDITIONS: Condition[] = [
  [`\${${conditionalFloodRank}} === null`, "rgba(135, 206, 235, 1)"],
  [`isNaN(\${${conditionalFloodRank}})`, "rgba(135, 206, 235, 1)"],
  [equalNumber(conditionalFloodRank, 2), "rgba(243, 240, 122, 1)"],
  [equalNumber(conditionalFloodRank, 3), "rgba(255, 184, 141, 1)"],
  [equalNumber(conditionalFloodRank, 4), "rgba(255, 132, 132, 1)"],
  [equalNumber(conditionalFloodRank, 5), "rgba(255, 94, 94, 1)"],
  [equalNumber(conditionalFloodRank, 6), "rgba(237, 87, 181, 1)"],
  [
    compareGreaterThan(defaultConditionalNumber(conditionalFloodRank, 0), 7),
    "rgba(209, 82, 209, 1)",
  ],
  DEFAULT_CONDITION,
];
