import { Component } from "../../types/fieldComponents";
import {
  CONDITIONAL_COLOR_SCHEME,
  GRADIENT_COLOR_SCHEME,
  VALUE_COLOR_SCHEME,
} from "../../types/fieldComponents/colorScheme";

// This settings object is used to generate the UI for each field.
// It will be used in layer inspector and legend panel.
// All filed components should be listed here but some of them may not have UI.
export const fieldSettings: {
  [key in Component["type"]]: {
    defaultValue?: string | number;
    value?: Component<key>["value"];
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
    value: {
      type: VALUE_COLOR_SCHEME,
      color: undefined,
    },
    hasLegendUI: true,
  },
  POINT_FILL_COLOR_CONDITION_FIELD: {
    value: {
      type: CONDITIONAL_COLOR_SCHEME,
      currentRuleId: undefined,
      overrideRules: [],
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POINT_FILL_COLOR_GRADIENT_FIELD: {
    value: {
      type: GRADIENT_COLOR_SCHEME,
      currentRuleId: undefined,
      currentColorMapName: undefined,
      currentMax: undefined,
      currentMin: undefined,
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POINT_VISIBILITY_FILTER_FIELD: {
    defaultValue: "",
    hasLayerUI: true,
  },
  // 3dtiles
  TILESET_BUILDING_MODEL_COLOR: {},
  TILESET_FLOOD_MODEL_COLOR: {},
  TILESET_FILL_COLOR_CONDITION_FIELD: {
    value: {
      type: CONDITIONAL_COLOR_SCHEME,
      currentRuleId: undefined,
      overrideRules: [],
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  TILESET_FILL_COLOR_GRADIENT_FIELD: {
    value: {
      type: GRADIENT_COLOR_SCHEME,
      currentRuleId: undefined,
      currentColorMapName: undefined,
      currentMax: undefined,
      currentMin: undefined,
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  TILESET_CLIPPING: {
    value: {
      enable: false,
      visible: true,
      allowEnterGround: false,
      direction: "inside",
    },
    hasLayerUI: true,
  },
  TILESET_BUILDING_MODEL_FILTER: {
    value: {
      filters: {},
    },
    hasLayerUI: true,
  },
  TILESET_FLOOD_MODEL_FILTER: {
    value: {
      filters: {},
    },
    hasLayerUI: true,
  },
};
