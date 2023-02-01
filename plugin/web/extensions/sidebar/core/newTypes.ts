export type Root = {
  data: Data[];
  templates: Template[];
};

export type Data = {
  id: string;
  dataId: string;
  type: string;
  name?: string; // Might want to make raw type without this
  // public: boolean; // Might want to make raw type without this
  visible?: boolean; // Might want to make raw type without this
  modelType: "usecase" | "plateau" | "dataset";
  // either template or components
  template?: string; // user-defined template ID or builtin template ID
  components?: FieldComponent[];
};

// ****** Components ******

export const fieldName = {
  camera: "カメラ",
  legend: "凡例",
  realtime: "リアルタイム",
  point: "ポイント",
  description: "説明",
};

// type Component = Camera | Legend | Realtime | Point | Polyline | Polygon | Model | Description;
export type FieldComponent = Camera | Legend | Realtime | Point | Description;

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

type LegendStyleType = "square" | "circle" | "line" | "icon";

type LegendItem = {
  title: string;
  color: string;
  url?: string;
};

type Legend = {
  type: "legend";
  group?: string;
  style: LegendStyleType;
  items?: LegendItem[];
};

type Realtime = {
  type: "realtime";
  group?: string;
  updateInterval: number; // 1000 * 60 -> 1m
};

type Point = {
  type: "point";
  group?: string;
  visible?: Expression;
  pointColor?: Expression;
  pointSize?: Expression;
  image?: Expression;
  modelUrl?: string;
};

type Description = {
  type: "description";
  group?: string;
  content?: string;
  isMarkdown?: boolean;
};

// ****** Template ******

export type Template = {
  id: string;
  modelId: string;
  name?: string;
  components?: FieldComponent[];
};

// ****** Expression ******

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

type Cond<T> =
  | {
      key: string;
      operator: "=" | ">=" | "<=" | ">" | "<" | "!=";
      operand: string;
      value: T;
    }
  | {
      and: Cond<T>[];
    }
  | {
      or: Cond<T>[];
    };
