import { BaseFieldProps } from "../../types";
import { BuildingColor } from "../types";
import { equalNumber, equalString } from "../utils";

type Condition = [condition: string, color: BuildingColor];

const DEFAULT_CONDITION: Condition = ["true", "rgba(209, 82, 209, 0.7)"];
export const DEFAULT_TRANSPARENCY = 0.7;

const conditionalFloodRank = "rank_code";
const conditionalFloodRankOrgCode = "rank_org_code";
const conditionalFloodRankOrg = "rank_org";
const FLOOD_RANK_CONDITIONS: Condition[] = [
  [
    `${equalNumber(conditionalFloodRankOrgCode, 0)} || ${equalString(
      conditionalFloodRankOrg,
      "0",
    )} || ${equalNumber(conditionalFloodRank, 0)}`,
    `rgba(243, 240, 122, ${DEFAULT_TRANSPARENCY})`,
  ],
  [
    `${equalNumber(conditionalFloodRankOrgCode, 1)} || ${equalString(
      conditionalFloodRankOrg,
      "1",
    )} || ${equalNumber(conditionalFloodRank, 1)}`,
    `rgba(243, 240, 122, ${DEFAULT_TRANSPARENCY})`,
  ],
  [
    `${equalNumber(conditionalFloodRankOrgCode, 2)} || ${equalString(
      conditionalFloodRankOrg,
      "2",
    )} || ${equalNumber(conditionalFloodRank, 2)}`,
    `rgba(255, 184, 141, ${DEFAULT_TRANSPARENCY})`,
  ],
  [
    `${equalNumber(conditionalFloodRankOrgCode, 3)} || ${equalString(
      conditionalFloodRankOrg,
      "3",
    )} || ${equalNumber(conditionalFloodRank, 3)}`,
    `rgba(255, 132, 132, ${DEFAULT_TRANSPARENCY})`,
  ],
  [
    `${equalNumber(conditionalFloodRankOrgCode, 4)} || ${equalString(
      conditionalFloodRankOrg,
      "4",
    )} || ${equalNumber(conditionalFloodRank, 4)}`,
    `rgba(255, 94, 94, ${DEFAULT_TRANSPARENCY})`,
  ],
  [
    `${equalNumber(conditionalFloodRankOrgCode, 5)} || ${equalString(
      conditionalFloodRankOrg,
      "5",
    )} || ${equalNumber(conditionalFloodRank, 5)}`,
    `rgba(237, 87, 181, ${DEFAULT_TRANSPARENCY})`,
  ],
  DEFAULT_CONDITION,
];

export const CONDITIONS: Record<
  BaseFieldProps<"floodColor">["value"]["userSettings"]["colorType"],
  Condition[]
> = {
  water: [["true", `rgba(135, 206, 235, ${DEFAULT_TRANSPARENCY})`]],
  rank: FLOOD_RANK_CONDITIONS,
};
