import { Feature, Polygon, MultiPolygon } from "geojson";

export type Sketch = {
  readonly setType: (type: ReearthSketchType | undefined) => void;
  readonly createDataOnly: (dataOnly: boolean) => void;
  readonly allowRightClickToAbort: (allow: boolean) => void;
  readonly allowAutoResetInteractionMode: (allow: boolean) => void;
};

export type ReearthSketchType =
  | "marker"
  | "polyline"
  | "circle"
  | "rectangle"
  | "polygon"
  | "extrudedCircle"
  | "extrudedRectangle"
  | "extrudedPolygon";

export type SketchFeature = Feature<
  Polygon | MultiPolygon,
  {
    id: string;
    type?: ReearthSketchType;
    positions?: Array<[number, number, number]>;
    extrudedHeight?: number;
  }
>;
