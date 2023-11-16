import { FillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorConditionField";
import { FillColorValueFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorValueField";

import { FieldBase } from "./base";
import { ConditionalColorSchemeValue, ValueColorSchemeValue } from "./colorScheme";

export const POLYGON_STROKE_COLOR_FIELD = "POLYGON_STROKE_COLOR_FIELD";
export type PolygonStrokeColorField = FieldBase<{
  type: typeof POLYGON_STROKE_COLOR_FIELD;
  preset?: {
    defaultValue?: string;
  };
}>;

export const POLYGON_STROKE_WEIGHT_FIELD = "POLYGON_STROKE_WEIGHT_FIELD";
export type PolygonStrokeWeightField = FieldBase<{
  type: typeof POLYGON_STROKE_WEIGHT_FIELD;
  preset?: {
    defaultValue?: number;
  };
}>;

export const POLYGON_FILL_COLOR_VALUE_FIELD = "POLYGON_FILL_COLOR_VALUE_FIELD";
export type PolygonFillColorValueField = FieldBase<{
  type: typeof POLYGON_FILL_COLOR_VALUE_FIELD;
  value?: ValueColorSchemeValue;
  preset?: FillColorValueFieldPreset;
}>;

export const POLYGON_FILL_COLOR_CONDITION_FIELD = "POLYGON_FILL_COLOR_CONDITION_FIELD";
export type PolygonFillColorConditionField = FieldBase<{
  type: typeof POLYGON_FILL_COLOR_CONDITION_FIELD;
  value?: ConditionalColorSchemeValue;
  preset?: FillColorConditionFieldPreset;
}>;

export type PolygonFields =
  | PolygonStrokeColorField
  | PolygonStrokeWeightField
  | PolygonFillColorConditionField
  | PolygonFillColorValueField;
