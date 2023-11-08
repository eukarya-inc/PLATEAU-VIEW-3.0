import { Component } from "../../types/fieldComponents";

// This settings object is used to generate the UI for each field.
// It will be used in layer inspector and legend panel.
// All filed components should be listed here but some of them may not have UI.
export const fieldSettings: {
  [key in Component["type"]]: {
    defaultValue: string | number;
    hasLayerUI?: boolean;
    hasLegendUI?: boolean;
  };
} = {
  // general
  OPACITY_FIELD: {
    defaultValue: 1,
    hasLayerUI: true,
  },
  LAYER_DESCRIPTION_FIELD: {
    defaultValue: "",
    hasLayerUI: true,
  },
  LEGEND_DESCRIPTION_FIELD: {
    defaultValue: "",
    hasLegendUI: true,
  },
  STYLE_CODE_FIELD: {
    defaultValue: "",
  },
  // point
  POINT_STYLE_FIELD: {
    defaultValue: "image",
  },
  POINT_SIZE_FIELD: {
    defaultValue: 100,
    hasLegendUI: true,
  },
  POINT_FILL_COLOR_VALUE_FIELD: {
    defaultValue: "",
    hasLegendUI: true,
  },
  POINT_FILL_COLOR_CONDITION_FIELD: {
    defaultValue: "",
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POINT_FILL_COLOR_GRADIENT_FIELD: {
    defaultValue: "",
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POINT_VISIBILITY_FILTER_FIELD: {
    defaultValue: "",
    hasLayerUI: true,
  },
  // 3dtiles
  TILESET_BUILDING_MODEL_COLOR: {
    defaultValue: "",
  },
  TILESET_FILL_COLOR_CONDITION_FIELD: {
    defaultValue: "",
    hasLegendUI: true,
    hasLayerUI: true,
  },
  TILESET_FILL_COLOR_GRADIENT_FIELD: {
    defaultValue: "",
    hasLegendUI: true,
    hasLayerUI: true,
  },
};
