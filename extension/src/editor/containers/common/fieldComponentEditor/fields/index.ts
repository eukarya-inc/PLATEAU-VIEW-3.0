import { SettingComponent } from "../../../../../shared/api/types";
import { ComponentBase } from "../../../../../shared/types/fieldComponents";
import {
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_SIZE_FIELD,
} from "../../../../../shared/types/fieldComponents/point";

import { EditorTilesetBuildingModelColorField } from "./3dtiles/EditorTilesetBuildingModelColorField";
import { EditorTilesetClippingField } from "./3dtiles/EditorTilesetClippingField";
import { EditorTilesetFillColorConditionField } from "./3dtiles/EditorTilesetFillColorConditionField";
import { EditorTilesetFillColorGradientField } from "./3dtiles/EditorTilesetFillColorGradientField";
import {
  FIELD_CATEGORY_GENERAL,
  FIELD_CATEGORY_POINT,
  FIELD_CATEGORY_THREE_D_TILES,
  FIELD_GROUP_POINT_FILL_COLOR,
  FIELD_GROUP_POINT_VISIBILITY,
  FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
} from "./constants";
import { EditorLayerDescriptionField } from "./general/EditorLayerDescriptionField";
import { EditorLegendDescriptionField } from "./general/EditorLegendDescriptionField";
import { EditorOpacityField } from "./general/EditorOpacityField";
import { EditorStyleCodeField } from "./general/EditorStyleCodeField";
import { EditorPointFillColorConditionField } from "./point/EditorPointFillColorConditionField";
import { EditorPointFillColorGradientField } from "./point/EditorPointFillColorGradientField";
import { EditorPointFillColorValueField } from "./point/EditorPointFillColorValueField";
import { EditorPointSizeField } from "./point/EditorPointSizeField";
import { EditorPointStyleField } from "./point/EditorPointStyleField";
import { EditorPointVisibilityFilterField } from "./point/EditorPointVisibilityFilterField";

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
    Component: EditorPointVisibilityFilterField,
  },
  POINT_FILL_COLOR_VALUE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Value",
    Component: EditorPointFillColorValueField,
  },
  POINT_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Condition",
    Component: EditorPointFillColorConditionField,
  },
  POINT_FILL_COLOR_GRADIENT_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Gradient",
    Component: EditorPointFillColorGradientField,
  },
  POINT_STYLE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Style",
    Component: EditorPointStyleField,
  },
  POINT_SIZE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Size",
    Component: EditorPointSizeField,
  },
  // 3dtiles
  TILESET_BUILDING_MODEL_COLOR: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Building model",
    Component: EditorTilesetBuildingModelColorField,
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
