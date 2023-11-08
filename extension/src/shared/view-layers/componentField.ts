import { SettingComponent } from "../api/types";
import { Component } from "../types/fieldComponents";
import { fieldSettings } from "../view/fields/fieldSettings";

export const makeComponentFieldValue = (component: SettingComponent): Component["value"] => {
  return (
    component.preset?.defaultValue ??
    fieldSettings[component.type]?.defaultValue ??
    fieldSettings[component.type]?.value
  );
};
