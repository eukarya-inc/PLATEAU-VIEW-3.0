import { BaseFieldProps } from "../../types";

export const MAX_HEIGHT = 200;
export const MAX_ABOVEGROUND_FLOOR = 50;
export const MAX_BASEMENT_FLOOR = 5;

export type FilteringField = {
  id: keyof OptionsState;
  label: string;
  featurePropertyName: string;
  order: number;
  value: [from: number, to: number];
  min?: number;
  max: number;
};

export type OptionsState = {
  [K in keyof Omit<
    BaseFieldProps<"buildingFilter">["value"],
    "id" | "group" | "type" | "override" | "cleanseOverride"
  >]?: FilteringField;
};

export const FILTERING_FIELD_DEFINITION: Record<keyof OptionsState, FilteringField> = {
  height: {
    id: "height",
    label: "高さで絞り込み",
    featurePropertyName: "計測高さ",
    order: 1,
    value: [0, MAX_HEIGHT],
    max: MAX_HEIGHT,
  },
  abovegroundFloor: {
    id: "abovegroundFloor",
    label: "地上階数で絞り込み",
    featurePropertyName: "地上階数",
    order: 2,
    value: [1, MAX_ABOVEGROUND_FLOOR],
    min: 1,
    max: MAX_ABOVEGROUND_FLOOR,
  },
  basementFloor: {
    id: "basementFloor",
    label: "地下階数で絞り込み",
    featurePropertyName: "地下階数",
    order: 3,
    value: [0, MAX_BASEMENT_FLOOR],
    max: MAX_BASEMENT_FLOOR,
  },
};
