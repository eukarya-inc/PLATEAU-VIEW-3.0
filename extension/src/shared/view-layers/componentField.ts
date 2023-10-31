import { SettingComponent } from "../api/types";
import { Component } from "../types/fieldComponents";
import { CONDITIONAL_COLOR_SCHEME } from "../types/fieldComponents/colorScheme";
import { POINT_FILL_COLOR_CONDITION_FIELD } from "../types/fieldComponents/point";
import { fieldSettings } from "../view/fields/fieldSettings";

export const makeComponentFieldValue = (component: SettingComponent): Component["value"] => {
  switch (component.type) {
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
    default:
      return component.preset?.defaultValue ?? fieldSettings[component.type].defaultValue;
  }
};
