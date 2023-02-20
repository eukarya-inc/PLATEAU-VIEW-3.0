import { Group } from "@web/extensions/sidebar/core/types";

export const fieldName = {
  idealZoom: "カメラ",
  legend: "凡例",
  realtime: "リアルタイム",
  switchGroup: "スイッチグループ",
  buttonLink: "リンクボタン",
  point: "ポイント",
  description: "説明",
  pointColor: "色",
  pointColorGradient: "色（Gradient)",
  pointSize: "サイズ",
  pointIcon: "アイコン",
  pointLabel: "ラベル",
  pointModel: "モデル",
  pointStroke: "ストロック",
  polygonColor: "ポリゴン色",
  polygonColorGradient: "ポリゴン色（Gradient）",
  polygonStroke: "ポリゴンストロック",
  clipping: "クリッピング",
  buildingFilter: "建物フィルター",
  buildingTransparency: "透明度",
  buildingColor: "色分け",
  buildingShadow: "影",
};

// type Component = Camera | Legend | Realtime | Point | Polyline | Polygon | Model | Description;
export type FieldComponent =
  | IdealZoom
  | Legend
  | Description
  | SwitchGroup
  | ButtonLink
  | PointColor
  | PointColorGradient
  | PointSize
  | PointIcon
  | PointLabel
  | PointModel
  | PointStroke
  | PolygonColor
  | PolygonColorGradient
  | PolygonStroke
  | Clipping
  | BuildingFilter
  | BuildingTransparency
  | BuildingColor
  | BuildingShadow;

type FieldBase<T extends keyof typeof fieldName> = {
  id: string;
  type: T;
  group?: string;
};

type CameraPosition = {
  lng: number;
  lat: number;
  height: number;
  pitch: number;
  heading: number;
  roll: number;
};

export type IdealZoom = FieldBase<"idealZoom"> & {
  position: CameraPosition;
};

export type LegendStyleType = "square" | "circle" | "line" | "icon";

export type LegendItem = {
  title: string;
  color: string;
  url?: string;
};

export type Legend = FieldBase<"legend"> & {
  style: LegendStyleType;
  items?: LegendItem[];
};

// type Realtime = {
//   type: "realtime";
//   group?: string;
//   updateInterval: number; // 1000 * 60 -> 1m
// };

export type Description = FieldBase<"description"> & {
  content?: string;
  isMarkdown?: boolean;
};

export type GroupItem = {
  id: string;
  title: string;
  fieldGroupID: string;
};

export type SwitchGroup = FieldBase<"switchGroup"> & {
  title: string;
  groups: GroupItem[];
};

export type ButtonLink = FieldBase<"buttonLink"> & {
  title?: string;
  link?: string;
};

// MAYBE POINT TYPE IS JUST TO CONCEPTUALIZE THE JSONNNN
// type Point = {
//   type: "point";
//   group?: string;
//   visible?: Expression;
//   pointColor?: Expression[];
//   // pointSize?: Expression;
//   pointSize?: number;
//   image?: Expression;
//   modelUrl?: string;
// };

type PointColor = FieldBase<"pointColor"> & {
  pointColors?: {
    condition: Cond<number>;
    color: string;
  }[];
};

type PointColorGradient = FieldBase<"pointColorGradient"> & {
  field?: string;
  startColor?: string;
  endColor?: string;
  step?: number;
};

type PointSize = FieldBase<"pointSize"> & {
  pointSize?: number;
};

type PointIcon = FieldBase<"pointIcon"> & {
  url?: string;
  size: number;
};

type PointLabel = FieldBase<"pointLabel"> & {
  field?: string;
  fontSize?: number;
  fontColor?: string;
  height?: number;
  extruded?: boolean;
  useBackground?: boolean;
  backgroundColor?: string;
};

type PointModel = FieldBase<"pointModel"> & {
  modelURL?: string;
  scale?: number;
};

type PointStroke = FieldBase<"pointStroke"> & {
  items?: {
    strokeColor: string;
    strokeWidth: number;
    condition: Cond<string | number>;
  }[];
};

type PolygonColor = FieldBase<"polygonColor"> & {
  items?: {
    condition: Cond<number>;
    color: string;
  }[];
};

type PolygonColorGradient = FieldBase<"polygonColorGradient"> & {
  field?: string;
  startColor?: string;
  endColor?: string;
  step?: number;
};

type PolygonStroke = FieldBase<"polygonStroke"> & {
  items?: {
    strokeColor: string;
    strokeWidth: number;
    condition: Cond<string | number>;
  }[];
};

type Clipping = FieldBase<"clipping"> & {
  enabled: boolean;
  show: boolean;
  aboveGroundOnly: boolean;
  direction: "inside" | "outside";
};

type BuildingFilter = FieldBase<"buildingFilter"> & {
  height: [from: number, to: number];
  abovegroundFloor: [from: number, to: number];
  basementFloor: [from: number, to: number];
};

type BuildingShadow = FieldBase<"buildingShadow"> & {
  shadow: "disabled" | "enabled" | "cast_only" | "receive_only";
};

type BuildingTransparency = FieldBase<"buildingTransparency"> & {
  transparency: number;
};

type BuildingColor = FieldBase<"buildingColor"> & {
  colorType: string;
};

export type Fields = {
  // general
  idealZoom: IdealZoom;
  legend: Legend;
  description: Description;
  switchGroup: SwitchGroup;
  buttonLink: ButtonLink;
  // point
  pointColor: PointColor;
  pointColorGradient: PointColorGradient;
  pointSize: PointSize;
  pointIcon: PointIcon;
  pointLabel: PointLabel;
  pointModel: PointModel;
  pointStroke: PointStroke;
  // polyline
  // polygon
  polygonColor: PolygonColor;
  polygonColorGradient: PolygonColorGradient;
  polygonStroke: PolygonStroke;
  // 3d-model
  // 3d-tile
  clipping: Clipping;
  buildingFilter: BuildingFilter;
  buildingTransparency: BuildingTransparency;
  buildingColor: BuildingColor;
  buildingShadow: BuildingShadow;
};

export type BaseFieldProps<T extends keyof Fields> = {
  value: Fields[T];
  dataID?: string;
  editMode?: boolean;
  isActive?: boolean;
  fieldGroups?: Group[];
  onUpdate: (property: Fields[T]) => void;
  onCurrentGroupChange: (fieldGroupID: string) => void;
};

export type Expression<T extends string | number | boolean = string | number | boolean> =
  | T
  | {
      conditions: Cond<T>[];
    }
  | {
      gradient: {
        key: string;
        defaultValue?: T;
        steps: { min?: number; max: number; value: T }[];
      };
    };

export type Cond<T> = {
  key: string;
  operator: "=" | ">=" | "<=" | ">" | "<" | "!=";
  operand: string;
  value: T;
};
// export type Cond<T> =
//   | {
//       key: string;
//       operator: "=" | ">=" | "<=" | ">" | "<" | "!=";
//       operand: string;
//       value: T;
//     }
//   | {
//       and: Cond<T>[];
//     }
//   | {
//       or: Cond<T>[];
//     };
