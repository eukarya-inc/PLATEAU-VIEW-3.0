import { GeneralFields } from "./general";
import { PointFields } from "./point";

export type ComponentBase = GeneralFields | PointFields;

export type Component<T extends ComponentBase["type"] = ComponentBase["type"]> = Extract<
  ComponentBase,
  { type: T }
>;
