import { EditorTimelineCustomizedFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/general/EditorTimelineCustomizedField";

import { FieldBase } from "./base";

export const OPACITY_FIELD = "OPACITY_FIELD";
export type OpacityField = FieldBase<{
  type: typeof OPACITY_FIELD;
  value?: number;
  preset?: {
    defaultValue?: number;
  };
}>;

export const LAYER_DESCRIPTION_FIELD = "LAYER_DESCRIPTION_FIELD";
export type LayerDescriptionField = FieldBase<{
  type: typeof LAYER_DESCRIPTION_FIELD;
  value?: string;
  preset?: {
    description?: string;
  };
}>;

export const LEGEND_DESCRIPTION_FIELD = "LEGEND_DESCRIPTION_FIELD";
export type LegendDescriptionField = FieldBase<{
  type: typeof LEGEND_DESCRIPTION_FIELD;
  value?: string;
  preset?: {
    description?: string;
  };
}>;

export const STYLE_CODE_FIELD = "STYLE_CODE_FIELD";
export type StyleCodeField = FieldBase<{
  type: typeof STYLE_CODE_FIELD;
  value?: string;
  preset?: {
    code?: string;
  };
}>;

export const APPLY_TIME_VALUE_FIELD = "APPLY_TIME_VALUE_FIELD";
export type ApplyTimeValueField = FieldBase<{
  type: typeof APPLY_TIME_VALUE_FIELD;
  value?: {
    timeBasedDisplay?: boolean;
  };
  preset?: {
    propertyName?: string;
  };
}>;

export const TIMELINE_CUSTOMIZED_FIELD = "TIMELINE_CUSTOMIZED_FIELD";
export type TimelineCustomizedField = FieldBase<{
  type: typeof TIMELINE_CUSTOMIZED_FIELD;
  preset?: EditorTimelineCustomizedFieldPreset;
}>;

export const TIMELINE_MONTH_FIELD = "TIMELINE_MONTH_FIELD";
export type TimelineMonthField = FieldBase<{
  type: typeof TIMELINE_MONTH_FIELD;
}>;

export type GeneralFields =
  | OpacityField
  | LayerDescriptionField
  | LegendDescriptionField
  | StyleCodeField
  | ApplyTimeValueField
  | TimelineCustomizedField
  | TimelineMonthField;
