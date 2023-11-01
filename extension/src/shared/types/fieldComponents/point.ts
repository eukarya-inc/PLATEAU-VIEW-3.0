import { PointFillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointFillConditionValueField";

import { FieldBase } from "./base";

export const POINT_SIZE_FIELD = "POINT_SIZE_FIELD";
export type PointSizeField = FieldBase<{
  type: typeof POINT_SIZE_FIELD;
  value: number;
  preset?: {
    defaultValue?: number;
  };
}>;

export const POINT_FILL_COLOR_VALUE_FIELD = "POINT_FILL_COLOR_VALUE_FIELD";
export type PointFillColorValueField = FieldBase<{
  type: typeof POINT_FILL_COLOR_VALUE_FIELD;
  value: string;
  legendUI?: {
    color: string;
  };
  preset?: {
    defaultValue?: string;
    asLegend?: boolean;
    legendName?: string;
  };
}>;

export const POINT_FILL_COLOR_CONDITION_FIELD = "POINT_FILL_COLOR_CONDITION_FIELD";
export type PointFillColorConditionField = FieldBase<{
  type: typeof POINT_FILL_COLOR_CONDITION_FIELD;
  value: string;
  legendUI?: {
    currentRuleId: string;
    overrideRules: {
      ruleId: string;
      conditionId: string;
      color: string;
    }[];
  };
  layerUI?: {};
  preset?: PointFillColorConditionFieldPreset;
}>;

export type PointFields = PointSizeField | PointFillColorValueField | PointFillColorConditionField;
