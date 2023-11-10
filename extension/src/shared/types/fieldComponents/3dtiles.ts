import { TilesetFillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/3dtiles/EditorTilesetFillColorConditionField";
import { TilesetFillGradientColorFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/3dtiles/EditorTilesetFillColorGradientField";

import { FieldBase } from "./base";
import { ConditionalColorSchemeValue, GradientColorSchemeValue } from "./colorScheme";

export const TILESET_BUILDING_MODEL_COLOR = "TILESET_BUILDING_MODEL_COLOR";
export type TilesetBuildingModelColorField = FieldBase<{
  type: typeof TILESET_BUILDING_MODEL_COLOR;
}>;

export const TILESET_FILL_COLOR_CONDITION_FIELD = "TILESET_FILL_COLOR_CONDITION_FIELD";
export type TilesetFillColorConditionField = FieldBase<{
  type: typeof TILESET_FILL_COLOR_CONDITION_FIELD;
  value?: ConditionalColorSchemeValue;
  preset?: TilesetFillColorConditionFieldPreset;
}>;

export const TILESET_FILL_COLOR_GRADIENT_FIELD = "TILESET_FILL_COLOR_GRADIENT_FIELD";
export type TilesetFillGradientColorField = FieldBase<{
  type: typeof TILESET_FILL_COLOR_GRADIENT_FIELD;
  value?: GradientColorSchemeValue;
  preset?: TilesetFillGradientColorFieldPreset;
}>;

export const TILESET_CLIPPING = "TILESET_CLIPPING";
export type TilesetClippingField = FieldBase<{
  type: typeof TILESET_CLIPPING;
  value: {
    enable: boolean;
    visible: boolean;
    allowEnterGround: boolean;
    direction: "inside" | "outside";
  };
}>;

export const TILESET_BUILDING_MODEL_FILTER = "TILESET_BUILDING_MODEL_FILTER";
export type TilesetBuildingModelFilterField = FieldBase<{
  type: typeof TILESET_BUILDING_MODEL_FILTER;
  value: {
    filters: Record<
      string,
      { value: [min: number, max: number]; range: [min: number, max: number] }
    >;
  };
}>;

export type TilesetFields =
  | TilesetBuildingModelColorField
  | TilesetFillColorConditionField
  | TilesetFillGradientColorField
  | TilesetClippingField
  | TilesetBuildingModelFilterField;
