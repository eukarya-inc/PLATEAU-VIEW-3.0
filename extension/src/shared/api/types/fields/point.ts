import { FieldBase } from "./base";

export const POINT_COLOR_FIELD = "POINT_COLOR_FIELD";
export type PointColorField = FieldBase<{
  type: typeof POINT_COLOR_FIELD;
  value: string;
}>;

export type PointFields = PointColorField;
