import { SettingComponent } from "../../../../../shared/api/types";
import { ComponentBase } from "../../../../../shared/types/fieldComponents";
import {
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_SIZE_FIELD,
} from "../../../../../shared/types/fieldComponents/point";

import { EditorTilesetBuildingModelColorField } from "./3dtiles/EditorTilesetBuildingModelColorField";
import { EditorTilesetBuildingModelFilterField } from "./3dtiles/EditorTilesetBuildingModelFilterField";
import { EditorTilesetClippingField } from "./3dtiles/EditorTilesetClippingField";
import { EditorTilesetFillColorConditionField } from "./3dtiles/EditorTilesetFillColorConditionField";
import { EditorTilesetFillColorGradientField } from "./3dtiles/EditorTilesetFillColorGradientField";
import { EditorTilesetFloodModelColorField } from "./3dtiles/EditorTilesetFloodModelColorField";
import { EditorTilesetFloodModelFilterField } from "./3dtiles/EditorTilesetFloodModelFilterField";
import { EditorFillColorConditionField } from "./common/EditorFillColorConditionField";
import { EditorFillColorGradientField } from "./common/EditorFillColorGradientField";
import { EditorFillColorValueField } from "./common/EditorFillColorValueField";
import { EditorVisibilityFilterField } from "./common/EditorVisibilityFilterField";
import {
  FIELD_CATEGORY_GENERAL,
  FIELD_CATEGORY_POINT,
  FIELD_CATEGORY_POLYGON,
  FIELD_CATEGORY_POLYLINE,
  FIELD_CATEGORY_THREE_D_TILES,
  FIELD_GROUP_POINT_FILL_COLOR,
  FIELD_GROUP_POINT_USE_IMAGE,
  FIELD_GROUP_POINT_VISIBILITY,
  FIELD_GROUP_POLYGON_FILL_COLOR,
  FIELD_GROUP_POLYGON_VISIBILITY,
  FIELD_GROUP_POLYLINE_FILL_COLOR,
  FIELD_GROUP_POLYLINE_VISIBILITY,
  FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
  FIELD_GROUP_THREE_D_TILES_FILTER,
} from "./constants";
import { EditorLayerDescriptionField } from "./general/EditorLayerDescriptionField";
import { EditorLegendDescriptionField } from "./general/EditorLegendDescriptionField";
import { EditorOpacityField } from "./general/EditorOpacityField";
import { EditorStyleCodeField } from "./general/EditorStyleCodeField";
import { EditorPointImageSizeField } from "./point/EditorPointImageSizeField";
import { EditorPointSizeField } from "./point/EditorPointSizeField";
import { EditorPointStyleField } from "./point/EditorPointStyleField";
import { EditorPointUse3DModelField } from "./point/EditorPointUse3DModelField";
import { EditorPointUseImageConditionField } from "./point/EditorPointUseImageConditionField";
import { EditorPointUseImageValueField } from "./point/EditorPointUseImageValueField";
import { EditorPolygonStrokeColorField } from "./polygon/EditorPolygonStrokeColorField";
import { EditorPolygonStrokeWeightField } from "./polygon/EditorPolygonStrokeWeightField";
import { EditorPolylineStrokeWeightField } from "./polyline/EditorPolygonStrokeWeightField";

export type BasicFieldProps<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  component: SettingComponent<T>;
  onUpdate: (component: SettingComponent<T>) => void;
};

export type FieldType = ComponentBase["type"];

export const fields: {
  [key in ComponentBase["type"]]: {
    category: string;
    group?: string;
    name: string;
    Component: React.FC<BasicFieldProps<key>>;
  };
} = {
  // general
  OPACITY_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Transparency",
    Component: EditorOpacityField,
  },
  LAYER_DESCRIPTION_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Layer Description",
    Component: EditorLayerDescriptionField,
  },
  LEGEND_DESCRIPTION_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Legend Description",
    Component: EditorLegendDescriptionField,
  },
  STYLE_CODE_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Style Code",
    Component: EditorStyleCodeField,
  },
  // point
  POINT_VISIBILITY_FILTER_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_VISIBILITY,
    name: "Filter",
    Component: EditorVisibilityFilterField as React.FC<
      BasicFieldProps<"POINT_VISIBILITY_FILTER_FIELD">
    >,
  },
  POINT_FILL_COLOR_VALUE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Value",
    Component: EditorFillColorValueField as React.FC<
      BasicFieldProps<"POINT_FILL_COLOR_VALUE_FIELD">
    >,
  },
  POINT_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Condition",
    Component: EditorFillColorConditionField as React.FC<
      BasicFieldProps<"POINT_FILL_COLOR_CONDITION_FIELD">
    >,
  },
  POINT_FILL_COLOR_GRADIENT_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Gradient",
    Component: EditorFillColorGradientField,
  },
  POINT_USE_IMAGE_VALUE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_USE_IMAGE,
    name: "Value",
    Component: EditorPointUseImageValueField,
  },
  POINT_USE_IMAGE_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_USE_IMAGE,
    name: "Condition",
    Component: EditorPointUseImageConditionField,
  },
  POINT_IMAGE_SIZE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Image Size",
    Component: EditorPointImageSizeField,
  },
  POINT_STYLE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Style",
    Component: EditorPointStyleField,
  },
  POINT_SIZE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Point Size",
    Component: EditorPointSizeField,
  },
  POINT_USE_3D_MODEL: {
    category: FIELD_CATEGORY_POINT,
    name: "Use 3D Model",
    Component: EditorPointUse3DModelField,
  },
  // Polyline
  POLYLINE_STROKE_WEIGHT_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    name: "Stroke Weight",
    Component: EditorPolylineStrokeWeightField,
  },
  POLYLINE_FILL_COLOR_VALUE_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    group: FIELD_GROUP_POLYLINE_FILL_COLOR,
    name: "Value",
    Component: EditorFillColorValueField as React.FC<
      BasicFieldProps<"POLYLINE_FILL_COLOR_VALUE_FIELD">
    >,
  },
  POLYLINE_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    group: FIELD_GROUP_POLYLINE_FILL_COLOR,
    name: "Condition",
    Component: EditorFillColorConditionField as React.FC<
      BasicFieldProps<"POLYLINE_FILL_COLOR_CONDITION_FIELD">
    >,
  },
  POLYLINE_VISIBILITY_FILTER_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    group: FIELD_GROUP_POLYLINE_VISIBILITY,
    name: "Filter",
    Component: EditorVisibilityFilterField as React.FC<
      BasicFieldProps<"POLYLINE_VISIBILITY_FILTER_FIELD">
    >,
  },
  // Polygon
  POLYGON_STROKE_COLOR_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    name: "Stroke Color",
    Component: EditorPolygonStrokeColorField,
  },
  POLYGON_STROKE_WEIGHT_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    name: "Stroke Weight",
    Component: EditorPolygonStrokeWeightField,
  },
  POLYGON_FILL_COLOR_VALUE_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    group: FIELD_GROUP_POLYGON_FILL_COLOR,
    name: "Value",
    Component: EditorFillColorValueField as React.FC<
      BasicFieldProps<"POLYGON_FILL_COLOR_VALUE_FIELD">
    >,
  },
  POLYGON_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    group: FIELD_GROUP_POLYGON_FILL_COLOR,
    name: "Condition",
    Component: EditorFillColorConditionField as React.FC<
      BasicFieldProps<"POLYGON_FILL_COLOR_CONDITION_FIELD">
    >,
  },
  POLYGON_VISIBILITY_FILTER_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    group: FIELD_GROUP_POLYGON_VISIBILITY,
    name: "Filter",
    Component: EditorVisibilityFilterField as React.FC<
      BasicFieldProps<"POLYGON_VISIBILITY_FILTER_FIELD">
    >,
  },
  // 3dtiles
  TILESET_BUILDING_MODEL_COLOR: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Building model",
    Component: EditorTilesetBuildingModelColorField,
  },
  TILESET_FLOOD_MODEL_COLOR: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Flood model",
    Component: EditorTilesetFloodModelColorField,
  },
  TILESET_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Condition",
    Component: EditorTilesetFillColorConditionField,
  },
  TILESET_FILL_COLOR_GRADIENT_FIELD: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Gradient",
    Component: EditorTilesetFillColorGradientField,
  },
  TILESET_CLIPPING: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    name: "Clipping",
    Component: EditorTilesetClippingField,
  },
  TILESET_BUILDING_MODEL_FILTER: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILTER,
    name: "Building model",
    Component: EditorTilesetBuildingModelFilterField,
  },
  TILESET_FLOOD_MODEL_FILTER: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILTER,
    name: "Flood model",
    Component: EditorTilesetFloodModelFilterField,
  },
};

export type FieldComponentTreeItem = {
  label: string;
  value: string;
  group?: string;
  isFolder?: boolean;
  children?: FieldComponentTreeItem[];
};

export type FieldComponentTree = FieldComponentTreeItem[];

export const getFiledComponentTree = () => {
  const tree: FieldComponentTreeItem[] = [];

  Object.entries(fields).forEach(([key, { category, group, name }]) => {
    if (!tree.find(item => item.value === category)) {
      tree.push({
        label: category,
        value: category,
        isFolder: true,
        children: [],
      });
    }
    const categoryItem = tree.find(item => item.value === category);
    if (group && !categoryItem?.children?.find(item => item.value === group)) {
      categoryItem?.children?.push({
        label: group,
        value: group,
        isFolder: true,
        children: [],
      });
    }
    if (group) {
      const groupItem = categoryItem?.children?.find(item => item.value === group);
      groupItem?.children?.push({
        label: name,
        value: key,
        group,
      });
    } else {
      categoryItem?.children?.push({
        label: name,
        value: key,
      });
    }
  });

  return tree;
};

// Specal rule for style code field
// Style code field is conflict with these fields
export const AppearanceFields = [
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_SIZE_FIELD,
];
