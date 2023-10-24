import { GeneralFields } from "./fields/general";
import { PointFields } from "./fields/point";

export type ComponentBase = GeneralFields | PointFields;

export type Component<T extends ComponentBase["type"] = ComponentBase["type"]> = Extract<
  ComponentBase,
  { type: T }
>;

export type ComponentGroup = {
  id: string;
  default?: boolean;
  components: ComponentBase[];
};