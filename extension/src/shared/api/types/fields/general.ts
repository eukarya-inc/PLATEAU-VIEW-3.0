import { FieldBase } from "./base";

export const OPACITY_FIELD = "OPACITY_FIELD";
export type OpacityField = FieldBase<{
  type: typeof OPACITY_FIELD;
  value: number;
}>;

export type GeneralFields = OpacityField;
