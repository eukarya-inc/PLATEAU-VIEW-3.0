import { Component } from "../../types/fieldComponents";
import {
  CONDITIONAL_COLOR_SCHEME,
  GRADIENT_COLOR_SCHEME,
  VALUE_COLOR_SCHEME,
} from "../../types/fieldComponents/colorScheme";
import { CONDITIONAL_IMAGE_SCHEME } from "../../types/fieldComponents/imageScheme";

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
      useDefault: true,
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
      useDefault: true,
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POINT_VISIBILITY_CONDITION_FIELD: {},
  POINT_VISIBILITY_FILTER_FIELD: {
    defaultValue: "",
    hasLayerUI: true,
  },
  POINT_USE_IMAGE_VALUE_FIELD: {
    defaultValue: "",
    hasLegendUI: true,
  },
  POINT_USE_IMAGE_CONDITION_FIELD: {
    value: {
      type: CONDITIONAL_IMAGE_SCHEME,
      currentRuleId: undefined,
      overrideRules: [],
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POINT_IMAGE_SIZE_FIELD: {},
  POINT_USE_3D_MODEL: {},
  // Polygon
  POLYGON_FILL_COLOR_VALUE_FIELD: {
    value: {
      type: VALUE_COLOR_SCHEME,
      color: undefined,
    },
    hasLegendUI: true,
  },
  POLYGON_FILL_COLOR_CONDITION_FIELD: {
    value: {
      type: CONDITIONAL_COLOR_SCHEME,
      currentRuleId: undefined,
      overrideRules: [],
      useDefault: true,
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POLYGON_STROKE_COLOR_FIELD: {},
  POLYGON_STROKE_WEIGHT_FIELD: {},
  POLYGON_VISIBILITY_CONDITION_FIELD: {},
  POLYGON_VISIBILITY_FILTER_FIELD: {
    defaultValue: "",
    hasLayerUI: true,
  },
  // Polygon
  POLYLINE_FILL_COLOR_VALUE_FIELD: {
    value: {
      type: VALUE_COLOR_SCHEME,
      color: undefined,
    },
    hasLegendUI: true,
  },
  POLYLINE_FILL_COLOR_CONDITION_FIELD: {
    value: {
      type: CONDITIONAL_COLOR_SCHEME,
      currentRuleId: undefined,
      overrideRules: [],
      useDefault: true,
      storeable: {
        omitPropertyNames: ["value.currentRuleId"],
      },
    },
    hasLegendUI: true,
    hasLayerUI: true,
  },
  POLYLINE_STROKE_WEIGHT_FIELD: {},
  POLYLINE_VISIBILITY_CONDITION_FIELD: {},
  POLYLINE_VISIBILITY_FILTER_FIELD: {
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
      useDefault: false,
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
      useDefault: false,
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
