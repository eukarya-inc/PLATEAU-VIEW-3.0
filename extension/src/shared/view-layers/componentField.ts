import { SettingComponent } from "../api/types";
import { Component } from "../types/fieldComponents";
import {
  TILESET_FILL_COLOR_CONDITION_FIELD,
  TILESET_FILL_COLOR_GRADIENT_FIELD,
} from "../types/fieldComponents/3dtiles";
import {
  CONDITIONAL_COLOR_SCHEME,
  GRADIENT_COLOR_SCHEME,
  VALUE_COLOR_SCHEME,
} from "../types/fieldComponents/colorScheme";
import {
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_FILL_COLOR_VALUE_FIELD,
} from "../types/fieldComponents/point";
import { fieldSettings } from "../view/fields/fieldSettings";

export const makeComponentFieldValue = (component: SettingComponent): Component["value"] => {
  switch (component.type) {
    // Point
    case POINT_FILL_COLOR_VALUE_FIELD: {
      return {
        type: VALUE_COLOR_SCHEME,
        color: undefined,
      };
    }
    case POINT_FILL_COLOR_CONDITION_FIELD: {
      return {
        type: CONDITIONAL_COLOR_SCHEME,
        currentRuleId: undefined,
        overrideRules: [],
        storeable: {
          omitPropertyNames: ["value.currentRuleId"],
        },
      };
    }
    case POINT_FILL_COLOR_GRADIENT_FIELD: {
      return {
        type: GRADIENT_COLOR_SCHEME,
        currentRuleId: undefined,
        currentColorMapName: undefined,
        currentMax: undefined,
        currentMin: undefined,
        storeable: {
          omitPropertyNames: ["value.currentRuleId"],
        },
      };
    }
    // Tileset
    case TILESET_FILL_COLOR_CONDITION_FIELD: {
      return {
        type: CONDITIONAL_COLOR_SCHEME,
        currentRuleId: undefined,
        overrideRules: [],
        storeable: {
          omitPropertyNames: ["value.currentRuleId"],
        },
      };
    }
    case TILESET_FILL_COLOR_GRADIENT_FIELD: {
      return {
        type: GRADIENT_COLOR_SCHEME,
        currentRuleId: undefined,
        currentColorMapName: undefined,
        currentMax: undefined,
        currentMin: undefined,
        storeable: {
          omitPropertyNames: ["value.currentRuleId"],
        },
      };
    }
    default:
      return component.preset?.defaultValue ?? fieldSettings[component.type]?.defaultValue;
  }
};
