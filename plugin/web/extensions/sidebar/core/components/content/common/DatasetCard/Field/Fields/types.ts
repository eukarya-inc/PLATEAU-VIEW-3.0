export const fieldName = {
  camera: "カメラ",
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
};

// type Component = Camera | Legend | Realtime | Point | Polyline | Polygon | Model | Description;
export type FieldComponent =
  | Camera
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
  | PointStroke;

type FieldBase<T extends keyof typeof fieldName> = {
  type: T;
  group?: string;
};

export type Camera = FieldBase<"camera"> & {
  position: {
    lng: number;
    lat: number;
    height: number;
    pitch: number;
    heading: number;
    roll: number;
  };
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
  title: string;
  group: string;
  id?: number;
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

type PointSize = {
  type: "pointSize";
  group?: string;
  pointSize?: number;
};

type PointIcon = {
  type: "pointIcon";
  group?: string;
};

type PointLabel = {
  type: "pointLabel";
  group?: string;
  field?: string;
  fontSize?: number;
  fontColor?: string;
  height?: number;
  extruded?: boolean;
  useBackground?: boolean;
  backgroundColor?: string;
};

type PointModel = {
  type: "pointModel";
  group?: string;
  modelURL?: string;
  scale?: number;
};

type PointStroke = {
  type: "pointStroke";
  group?: string;
  conditions?: {
    expression: Expression;
    strokeColor: string;
    strokeWidth: number;
  }[];
};

export type Fields = {
  // general
  camera: Camera;
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
  // 3d-model
  // 3d-tile
};

export type BaseFieldProps<T extends keyof Fields> = {
  value: Fields[T];
  editMode?: boolean;
  onUpdate: (property: Fields[T]) => void;
};

type Expression<T extends string | number | boolean = string | number | boolean> =
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
