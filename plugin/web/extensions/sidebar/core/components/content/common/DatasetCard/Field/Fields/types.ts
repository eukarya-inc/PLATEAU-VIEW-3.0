import { Template as TemplateType } from "@web/extensions/sidebar/core/types";
import { ReearthApi } from "@web/extensions/sidebar/types";

export const generalFieldName = {
  idealZoom: "カメラ",
  legend: "凡例",
  realtime: "リアルタイム",
  story: "ストーリー",
  timeline: "タイムライン",
  currentTime: "現在時刻",
  switchGroup: "グループの切り替え",
  buttonLink: "リンク",
  styleCode: "スタイルコード",
  switchDataset: "データセットの切り替え",
  switchField: "フィールドの切り替え",
  point: "ポイント",
  description: "説明",
  template: "テンプレート",
  eventField: "イベント",
};

export const pointFieldName = {
  pointColor: "色",
  pointColorGradient: "色（グラデーション）",
  pointSize: "サイズ",
  pointIcon: "アイコン",
  pointLabel: "ラベル",
  pointModel: "モデル",
  pointStroke: "ストローク",
  pointCSV: "ポイントに変換（CSV）",
};

export const polygonFieldName = {
  polygonColor: "ポリゴン色",
  polygonColorGradient: "ポリゴン色（グラデーション）",
  polygonStroke: "ポリゴンストローク",
};

export const threeDFieldName = {
  clipping: "クリッピング",
  buildingFilter: "フィルター（建築物）",
  buildingTransparency: "透明度",
  buildingColor: "色分け（建築物）",
  buildingShadow: "影",
  floodColor: "色分け（浸水想定区域）",
  floodFilter: "フィルター（浸水想定区域）",
};

export const polylineFieldName = {
  polylineColor: "ポリライン色",
  polylineColorGradient: "ポリライン色（グラデーション）",
  polylineStrokeWeight: "ポリラインストローク",
};

export const fieldName = {
  ...generalFieldName,
  ...pointFieldName,
  ...polygonFieldName,
  ...threeDFieldName,
  ...polylineFieldName,
};

export type FieldComponent =
  | IdealZoom
  | Legend
  | StyleCode
  | ButtonLink
  | Description
  | SwitchGroup
  | ButtonLink
  | Story
  | Realtime
  | Timeline
  | CurrentTime
  | SwitchDataset
  | SwitchField
  | EventField
  | Template
  | PointColor
  | PointColorGradient
  | PointSize
  | PointIcon
  | PointLabel
  | PointModel
  | PointStroke
  | PointCSV
  | PolylineColor
  | PolylineColorGradient
  | PolylineStrokeWeight
  | PolygonColor
  | PolygonColorGradient
  | PolygonStroke
  | Clipping
  | BuildingFilter
  | BuildingTransparency
  | BuildingColor
  | BuildingShadow
  | FloodColor
  | FloodFilter;

type FieldBase<T extends keyof typeof fieldName> = {
  id: string;
  type: T;
  group?: string;
  override?: any;
  cleanseOverride?: any;
  updatedAt?: Date;
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
  title?: string;
  color?: string;
  url?: string;
};

export type Legend = FieldBase<"legend"> & {
  style: LegendStyleType;
  items?: LegendItem[];
};

type CurrentTime = FieldBase<"currentTime"> & {
  date: string;
  time: string;
};

type Realtime = FieldBase<"realtime"> & {
  updateInterval: number; // 1000 * 60 -> 1m
};

export type Timeline = FieldBase<"timeline"> & {
  timeBasedDisplay: boolean;
  timeFieldName: string;
};

export type Description = FieldBase<"description"> & {
  content?: string;
  isMarkdown?: boolean;
};

export type StyleCode = FieldBase<"styleCode"> & {
  src: string;
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

export type SwitchDataset = FieldBase<"switchDataset"> & {
  uiStyle?: "dropdown" | "radio";
  selected?: ConfigData;
};

export type SwitchField = FieldBase<"switchField"> & {
  field?: string;
  selected?: string;
  uiStyle?: "dropdown" | "radio";
};

export type ButtonLink = FieldBase<"buttonLink"> & {
  title?: string;
  link?: string;
};

export type StoryItem = {
  id: string;
  title?: string;
  scenes?: string;
};

export type Story = FieldBase<"story"> & {
  stories?: StoryItem[];
};

type Template = FieldBase<"template"> & {
  templateID?: string;
  components?: FieldComponent[];
};

type EventField = FieldBase<"eventField"> & {
  eventType: string;
  triggerEvent: string;
  urlType: "manual" | "fromData";
  url?: string;
  field?: string;
};

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
  sizeInMeters: boolean;
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

type PointCSV = FieldBase<"pointCSV"> & {
  lng?: string;
  lat?: string;
  height?: string;
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
  height?: [from: number, to: number];
  abovegroundFloor?: [from: number, to: number];
  basementFloor?: [from: number, to: number];
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

type FloodColor = FieldBase<"floodColor"> & { colorType: "water" | "rank" };

type FloodFilter = FieldBase<"floodFilter"> & { rank?: [from: number, to: number] };

type PolylineColor = FieldBase<"polylineColor"> & {
  items?: {
    condition: Cond<number>;
    color: string;
  }[];
};

type PolylineColorGradient = FieldBase<"polylineColorGradient"> & {
  field?: string;
  startColor?: string;
  endColor?: string;
  step?: number;
};

type PolylineStrokeWeight = FieldBase<"polylineStrokeWeight"> & {
  strokeWidth: number;
};

export type Fields = {
  // general
  idealZoom: IdealZoom;
  legend: Legend;
  description: Description;
  styleCode: StyleCode;
  switchGroup: SwitchGroup;
  buttonLink: ButtonLink;
  story: Story;
  currentTime: CurrentTime;
  realtime: Realtime;
  timeline: Timeline;
  switchDataset: SwitchDataset;
  switchField: SwitchField;
  eventField: EventField;
  // point
  pointColor: PointColor;
  pointColorGradient: PointColorGradient;
  pointSize: PointSize;
  pointIcon: PointIcon;
  pointLabel: PointLabel;
  pointModel: PointModel;
  pointStroke: PointStroke;
  pointCSV: PointCSV;
  // polyline
  polylineColor: PolylineColor;
  polylineColorGradient: PolylineColorGradient;
  polylineStrokeWeight: PolylineStrokeWeight;
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
  floodColor: FloodColor;
  floodFilter: FloodFilter;
  // template
  template: Template;
};

export type BaseFieldProps<T extends keyof Fields> = {
  value: Fields[T];
  dataID?: string;
  editMode?: boolean;
  isActive?: boolean;
  activeIDs?: string[];
  templates?: TemplateType[];
  configData?: ConfigData[];
  onUpdate: (property: Fields[T]) => void;
  onSceneUpdate: (updatedProperties: Partial<ReearthApi>) => void;
  onCurrentGroupUpdate?: (fieldGroupID: string) => void;
};

export type ConfigData = { name: string; type: string; url: string; layers?: string[] };

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
  operator: "===" | ">=" | "<=" | ">" | "<" | "!==";
  operand: T;
  value: T;
};
