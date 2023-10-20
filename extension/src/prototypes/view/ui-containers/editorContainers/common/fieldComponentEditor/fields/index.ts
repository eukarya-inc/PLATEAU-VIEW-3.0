import {
  OPACITY_FIELD,
  LAYER_DESCRIPTION_FIELD,
  LEGEND_DESCRIPTION_FIELD,
  STYLE_CODE_FIELD,
} from "../../../../../../../shared/types/fieldComponents/general";
import {
  POINT_COLOR_FIELD,
  POINT_SIZE_FIELD,
  POINT_FILL_COLOR_VALUE_FIELD,
} from "../../../../../../../shared/types/fieldComponents/point";

import { EditorLayerDescriptionField } from "./general/EditorLayerDescriptionField";
import { EditorLegendDescriptionField } from "./general/EditorLegendDescriptionField";
import { EditorOpacityField } from "./general/EditorOpacityField";
import { EditorStyleCodeField } from "./general/EditorStyleCodeField";
import { EditorPointColorField } from "./point/EditorPointColorField";
import { EditorPointFillColorValueField } from "./point/EditorPointFillColorValueField";
import { EditorPointSizeField } from "./point/EditorPointSizeField";

export const fieldCatagories = ["General", "Point"];

export const editorFieldComponentTree: {
  name: string;
  components: { type: FieldType; name: string }[];
}[] = [
  {
    name: "General",
    components: [
      {
        type: OPACITY_FIELD,
        name: "Opacity Field",
      },
      {
        type: LAYER_DESCRIPTION_FIELD,
        name: "Layer Description Field",
      },
      {
        type: LEGEND_DESCRIPTION_FIELD,
        name: "Legend Description Field",
      },
      {
        type: STYLE_CODE_FIELD,
        name: "Style Code Field",
      },
    ],
  },
  {
    name: "Point",
    components: [
      {
        type: POINT_COLOR_FIELD,
        name: "Point Color Field",
      },
      {
        type: POINT_SIZE_FIELD,
        name: "Point Size Field",
      },
      {
        type: POINT_FILL_COLOR_VALUE_FIELD,
        name: "Point Fill Color Value Field",
      },
    ],
  },
];

export type BasicFieldProps = {};

export type FieldType =
  | typeof OPACITY_FIELD
  | typeof LAYER_DESCRIPTION_FIELD
  | typeof LEGEND_DESCRIPTION_FIELD
  | typeof STYLE_CODE_FIELD
  | typeof POINT_COLOR_FIELD
  | typeof POINT_SIZE_FIELD
  | typeof POINT_FILL_COLOR_VALUE_FIELD;

export const fields: {
  [key in FieldType]: {
    category: string;
    name: string;
    Component: React.ComponentType<BasicFieldProps>;
  };
} = {
  // general
  OPACITY_FIELD: {
    category: "General",
    name: "Opacity Field",
    Component: EditorOpacityField,
  },
  LAYER_DESCRIPTION_FIELD: {
    category: "General",
    name: "Layer Description Field",
    Component: EditorLayerDescriptionField,
  },
  LEGEND_DESCRIPTION_FIELD: {
    category: "General",
    name: "Legend Description Field",
    Component: EditorLegendDescriptionField,
  },
  STYLE_CODE_FIELD: {
    category: "General",
    name: "Style Code Field",
    Component: EditorStyleCodeField,
  },
  // point
  POINT_COLOR_FIELD: {
    category: "Point",
    name: "Point Color Field",
    Component: EditorPointColorField,
  },
  POINT_SIZE_FIELD: {
    category: "Point",
    name: "Point Size Field",
    Component: EditorPointSizeField,
  },
  POINT_FILL_COLOR_VALUE_FIELD: {
    category: "Point",
    name: "Point Fill Color Value Field",
    Component: EditorPointFillColorValueField,
  },
};
