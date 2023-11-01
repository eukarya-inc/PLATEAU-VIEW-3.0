import { SettingComponent } from "../../../../../shared/api/types";
import { ComponentBase } from "../../../../../shared/types/fieldComponents";

import {
  FIELD_CATEGORY_GENERAL,
  FIELD_CATEGORY_POINT,
  FIELD_CATEGORY_POLYGON,
  FIELD_CATEGORY_POLYLINE,
  FIELD_CATEGORY_THREE_D_TILES,
  FIELD_GROUP_POINT_FILL_COLOR,
} from "./constants";
import { EditorLayerDescriptionField } from "./general/EditorLayerDescriptionField";
import { EditorLegendDescriptionField } from "./general/EditorLegendDescriptionField";
import { EditorOpacityField } from "./general/EditorOpacityField";
import { EditorStyleCodeField } from "./general/EditorStyleCodeField";
import { EditorPointFillColorValueField } from "./point/EditorPointFillColorValueField";
import { EditorPointFillConditionValueField } from "./point/EditorPointFillConditionValueField";
import { EditorPointFillGradientValueField } from "./point/EditorPointFillGradientValueField";
import { EditorPointSizeField } from "./point/EditorPointSizeField";

export type BasicFieldProps<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  component: SettingComponent<T>;
  onUpdate: (component: SettingComponent<T>) => void;
};

export type FieldType = ComponentBase["type"];

export const fieldCatagories = [
  FIELD_CATEGORY_GENERAL,
  FIELD_CATEGORY_POINT,
  FIELD_CATEGORY_POLYLINE,
  FIELD_CATEGORY_POLYGON,
  FIELD_CATEGORY_THREE_D_TILES,
];

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
    Component: EditorPointFillConditionValueField,
  },
  POINT_SIZE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Size",
    Component: EditorPointSizeField,
  },
  POINT_FILL_GRADIENT_COLOR_FIELD: {
    category: "Point",
    name: "Fill Color (Gradient)",
    Component: EditorPointFillGradientValueField,
  },
};
