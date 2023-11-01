import { Component } from "../../types/fieldComponents";

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
};
