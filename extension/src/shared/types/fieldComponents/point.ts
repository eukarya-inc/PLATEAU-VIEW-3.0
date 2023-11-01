import { PointFillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointFillColorConditionField";
import { PointFillGradientColorFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointFillColorGradientField";

import { FieldBase } from "./base";
import { ConditionalColorSchemeValue, GradientColorSchemeValue } from "./colorScheme";

export const POINT_SIZE_FIELD = "POINT_SIZE_FIELD";
export type PointSizeField = FieldBase<{
  type: typeof POINT_SIZE_FIELD;
  value?: number;
  preset?: {
    defaultValue?: number;
  };
}>;

export const POINT_FILL_COLOR_VALUE_FIELD = "POINT_FILL_COLOR_VALUE_FIELD";
export type PointFillColorValueField = FieldBase<{
  type: typeof POINT_FILL_COLOR_VALUE_FIELD;
  value?: string;
  preset?: {
    defaultValue?: string;
    asLegend?: boolean;
    legendName?: string;
  };
}>;

export const POINT_FILL_COLOR_CONDITION_FIELD = "POINT_FILL_COLOR_CONDITION_FIELD";
export type PointFillColorConditionField = FieldBase<{
  type: typeof POINT_FILL_COLOR_CONDITION_FIELD;
  value?: ConditionalColorSchemeValue;
  preset?: PointFillColorConditionFieldPreset;
}>;

export const POINT_FILL_COLOR_GRADIENT_FIELD = "POINT_FILL_COLOR_GRADIENT_FIELD";
export type PointFillGradientColorField = FieldBase<{
  type: typeof POINT_FILL_COLOR_GRADIENT_FIELD;
  value?: GradientColorSchemeValue;
  preset?: PointFillGradientColorFieldPreset;
}>;

export type PointFields =
  | PointSizeField
  | PointFillColorValueField
  | PointFillColorConditionField
  | PointFillGradientColorField;
