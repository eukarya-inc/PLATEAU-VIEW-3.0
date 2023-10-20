import { ComponentBase } from "../../types/fieldComponents";

export type SettingComponent = Omit<ComponentBase, "value" | "legendUI" | "layerUI">;

export type ComponentGroup = {
  id: string;
  name: string;
  default?: boolean; // TODO: remove this. The first element in the array should be the default
  components: SettingComponent[];
};

export type ComponentTemplate = { id: string; name: string; groups: ComponentGroup[] };
