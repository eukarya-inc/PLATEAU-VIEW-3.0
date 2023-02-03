export const fieldName = {
  camera: "カメラ",
  legend: "凡例",
  realtime: "リアルタイム",
  point: "ポイント",
  description: "説明",
};

// type Component = Camera | Legend | Realtime | Point | Polyline | Polygon | Model | Description;
export type FieldComponent = Camera | Legend | Description;

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

type Fields = {
  camera: Camera;
  legend: Legend;
  description: Description;
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
