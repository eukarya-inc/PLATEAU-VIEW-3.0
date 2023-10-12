import { FieldBase } from "./base";

export const POINT_COLOR_FIELD = "POINT_COLOR_FIELD";
export type PointColorField = FieldBase<{
  type: typeof POINT_COLOR_FIELD;
  value: string;
}>;

export const POINT_SIZE_FIELD = "POINT_SIZE_FIELD";
export type PointSizeField = FieldBase<{
  type: typeof POINT_SIZE_FIELD;
  value: number;
}>;

export type PointFields = PointColorField | PointSizeField;
