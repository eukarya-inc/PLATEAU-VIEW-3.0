import type { Component, ComponentBase } from "../../types/fieldComponents";

export type SettingComponent<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  id: string;
} & Omit<Component<T>, "value" | "legendUI" | "layerUI">;

export type ComponentGroup = {
  id: string;
  name: string;
  default?: boolean; // TODO: remove this. The first element in the array should be the default
  components: SettingComponent<ComponentBase["type"]>[];
};

export type ComponentTemplate = {
  id: string;
  type: "component";
  name: string;
  groups: ComponentGroup[];
};
