import { FieldBase } from "./base";

export const OPACITY_FIELD = "OPACITY_FIELD";
export type OpacityField = FieldBase<{
  type: typeof OPACITY_FIELD;
  value: number;
  preset?: {
    value?: number;
  };
}>;

export const LAYER_DESCRIPTION_FIELD = "LAYER_DESCRIPTION_FIELD";
export type LayerDescriptionField = FieldBase<{
  type: typeof LAYER_DESCRIPTION_FIELD;
  value: string;
  preset?: {
    description?: string;
  };
}>;

export const LEGEND_DESCRIPTION_FIELD = "LEGEND_DESCRIPTION_FIELD";
export type LegendDescriptionField = FieldBase<{
  type: typeof LEGEND_DESCRIPTION_FIELD;
  value: string;
  preset?: {
    description?: string;
  };
}>;

export const STYLE_CODE_FIELD = "STYLE_CODE_FIELD";
export type StyleCodeField = FieldBase<{
  type: typeof STYLE_CODE_FIELD;
  value: string;
  preset?: {
    code?: string;
  };
}>;

export type GeneralFields =
  | OpacityField
  | LayerDescriptionField
  | LegendDescriptionField
  | StyleCodeField; // | ColorSchemeField
