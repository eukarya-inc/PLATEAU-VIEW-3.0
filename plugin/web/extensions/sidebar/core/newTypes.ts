export type Root = {
  data: Data[];
  templates: Template[];
};

export type Data = {
  id: string;
  dataId: string;
  type: string;
  name?: string; // Might want to make raw type without this
  public: boolean; // Might want to make raw type without this
  visible?: boolean; // Might want to make raw type without this
  // either template or components
  template?: string; // user-defined template ID or builtin template ID
  components?: Component[];
};

// ****** Components ******

// type Component = Camera | Legend | Realtime | Point | Polyline | Polygon | Model | Description;
type Component = Camera | Legend | Realtime | Point | Description;

type Camera = {
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

type Legend = {
  type: "legend";
  group?: string;
  key: string;
  // If false, legend will be auto-generated from data
  override?: boolean;
  items?: LegendItem[];
};

type LegendItem = {
  value: string;
  title?: string;
  color?: string;
  image?: string;
  hidden?: boolean;
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
  markdownKey: string;
};

// ****** Template ******

export type Template = {
  id: string;
  modelId: string;
  name?: string;
  components?: Component[];
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
