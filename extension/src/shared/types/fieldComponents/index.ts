import { TilesetFields } from "./3dtiles";
import { GeneralFields } from "./general";
import { PointFields } from "./point";
import { PolygonFields } from "./polygon";

export type ComponentBase = GeneralFields | PointFields | PolygonFields | TilesetFields;

export type Component<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  [K in T]: Extract<ComponentBase, { type: K }>;
}[T];
