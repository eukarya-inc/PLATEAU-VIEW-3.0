import { PointFillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointFillConditionValueField";
import { PointFillGradientColorFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointFillGradientValueField";

import { FieldBase } from "./base";
import { ConditionalColorSchemeValue, GradientColorSchemeValue } from "./colorScheme";

export const POINT_COLOR_FIELD = "POINT_COLOR_FIELD";
export type PointColorField = FieldBase<{
  type: typeof POINT_COLOR_FIELD;
  value?: string;
  preset?: {
    defaultValue?: string;
  };
}>;

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
  value?: {
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
  value?: ConditionalColorSchemeValue;
  preset?: PointFillColorConditionFieldPreset;
}>;

export const POINT_FILL_GRADIENT_COLOR_FIELD = "POINT_FILL_GRADIENT_COLOR_FIELD";
export type PointFillGradientColorField = FieldBase<{
  type: typeof POINT_FILL_GRADIENT_COLOR_FIELD;
  value?: GradientColorSchemeValue;
  preset?: PointFillGradientColorFieldPreset;
}>;

export type PointFields =
  | PointColorField
  | PointSizeField
  | PointFillColorValueField
  | PointFillColorConditionField
  | PointFillGradientColorField;
