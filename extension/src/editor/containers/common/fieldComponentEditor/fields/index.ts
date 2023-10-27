import { SettingComponent } from "../../../../../shared/api/types";
import { ComponentBase } from "../../../../../shared/types/fieldComponents";

import { EditorLayerDescriptionField } from "./general/EditorLayerDescriptionField";
import { EditorLegendDescriptionField } from "./general/EditorLegendDescriptionField";
import { EditorOpacityField } from "./general/EditorOpacityField";
import { EditorStyleCodeField } from "./general/EditorStyleCodeField";
import { EditorPointColorField } from "./point/EditorPointColorField";
import { EditorPointFillColorValueField } from "./point/EditorPointFillColorValueField";
import { EditorPointFillConditionValueField } from "./point/EditorPointFillConditionValueField";
import { EditorPointSizeField } from "./point/EditorPointSizeField";

export type BasicFieldProps<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  component: SettingComponent<T>;
  onUpdate: (component: SettingComponent<T>) => void;
};

export type FieldType = ComponentBase["type"];

export const fieldCatagories = ["General", "Point"];

export const fields: {
  [key in ComponentBase["type"]]: {
    category: string;
    name: string;
    Component: React.FC<BasicFieldProps<key>>;
  };
} = {
  // general
  OPACITY_FIELD: {
    category: "General",
    name: "Opacity (Temp)",
    Component: EditorOpacityField,
  },
  LAYER_DESCRIPTION_FIELD: {
    category: "General",
    name: "Layer Description",
    Component: EditorLayerDescriptionField,
  },
  LEGEND_DESCRIPTION_FIELD: {
    category: "General",
    name: "Legend Description",
    Component: EditorLegendDescriptionField,
  },
  STYLE_CODE_FIELD: {
    category: "General",
    name: "Style Code",
    Component: EditorStyleCodeField,
  },
  // point
  POINT_COLOR_FIELD: {
    category: "Point",
    name: "Color",
    Component: EditorPointColorField,
  },
  POINT_SIZE_FIELD: {
    category: "Point",
    name: "Size",
    Component: EditorPointSizeField,
  },
  POINT_FILL_COLOR_VALUE_FIELD: {
    category: "Point",
    name: "Fill Color (Value)",
    Component: EditorPointFillColorValueField,
  },
  POINT_FILL_COLOR_CONDITION_FIELD: {
    category: "Point",
    name: "Fill Color (Condition)",
    Component: EditorPointFillConditionValueField,
  },
};
