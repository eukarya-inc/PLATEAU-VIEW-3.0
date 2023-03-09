import { BaseFieldProps } from "../../types";
import { BuildingColor } from "../types";
import { equalNumber } from "../utils";

type Condition = [condition: string, color: BuildingColor];

const DEFAULT_CONDITION: Condition = ["true", "rgba(209, 82, 209, 0.7)"];
export const DEFAULT_TRANSPARENCY = 0.7;

const conditionalFloodRank = "rank_code";
const FLOOD_RANK_CONDITIONS: Condition[] = [
  [`\${${conditionalFloodRank}} === null`, `rgba(135, 206, 235, ${DEFAULT_TRANSPARENCY})`],
  [`isNaN(\${${conditionalFloodRank}})`, `rgba(135, 206, 235, ${DEFAULT_TRANSPARENCY})`],
  [equalNumber(conditionalFloodRank, 0), `rgba(243, 240, 122, ${DEFAULT_TRANSPARENCY})`],
  [equalNumber(conditionalFloodRank, 1), `rgba(243, 240, 122, ${DEFAULT_TRANSPARENCY})`],
  [equalNumber(conditionalFloodRank, 2), `rgba(255, 184, 141, ${DEFAULT_TRANSPARENCY})`],
  [equalNumber(conditionalFloodRank, 3), `rgba(255, 132, 132, ${DEFAULT_TRANSPARENCY})`],
  [equalNumber(conditionalFloodRank, 4), `rgba(255, 94, 94, ${DEFAULT_TRANSPARENCY})`],
  [equalNumber(conditionalFloodRank, 5), `rgba(237, 87, 181, ${DEFAULT_TRANSPARENCY})`],
  DEFAULT_CONDITION,
];

export const CONDITIONS: Record<BaseFieldProps<"floodColor">["value"]["colorType"], Condition[]> = {
  water: [["true", `rgba(135, 206, 235, ${DEFAULT_TRANSPARENCY})`]],
  rank: FLOOD_RANK_CONDITIONS,
};
