export const fieldName = {
  camera: "カメラ",
  legend: "凡例",
  realtime: "リアルタイム",
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
  | PointColor
  | PointColorGradient
  | PointSize
  | PointIcon
  | PointLabel
  | PointModel
  | PointStroke;

export type Camera = {
  type: "camera";
  group?: string;
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

export type Legend = {
  type: "legend";
  group?: string;
  style: LegendStyleType;
  items?: LegendItem[];
};

// type Realtime = {
//   type: "realtime";
//   group?: string;
//   updateInterval: number; // 1000 * 60 -> 1m
// };

// type Point = {
//   type: "point";
//   group?: string;
//   visible?: Expression;
//   pointColor?: Expression;
//   pointSize?: Expression;
//   image?: Expression;
//   modelUrl?: string;
// };

export type Description = {
  type: "description";
  group?: string;
  content?: string;
  isMarkdown?: boolean;
};

type PointColor = {
  type: "pointColor";
  group?: string;
};
type PointColorGradient = {
  type: "pointColorGradient";
  group?: string;
};
type PointSize = {
  type: "pointSize";
  group?: string;
};
type PointIcon = {
  type: "pointIcon";
  group?: string;
};
type PointLabel = {
  type: "pointLabel";
  group?: string;
};
type PointModel = {
  type: "pointModel";
  group?: string;
};
type PointStroke = {
  type: "pointStroke";
  group?: string;
};

type Fields = {
  // general
  camera: Camera;
  legend: Legend;
  description: Description;
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

// type Expression<T extends string | number | boolean = string | number | boolean> =
//   | T
//   | {
//       conditions: Cond<T>[];
//     }
//   | {
//       gradient: {
//         key: string;
//         defaultValue?: T;
//         steps: { min?: number; max: number; value: T }[];
//       };
//     };

// type Cond<T> =
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
