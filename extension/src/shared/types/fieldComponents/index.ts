import { TilesetFields } from "./3dtiles";
import { GeneralFields } from "./general";
import { PointFields } from "./point";

export type ComponentBase = GeneralFields | PointFields | TilesetFields;

export type Component<T extends ComponentBase["type"] = ComponentBase["type"]> = Extract<
  ComponentBase,
  { type: T }
>;
