export type LUT = [number, number, number];
export type Camera = {
  lat: number;
  lng: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
  fov: number;
  aspectRatio?: number;
};

export type SceneMode = "3d" | "2d" | "columbus";
export type IndicatorTypes = "default" | "crosshair" | "custom";

export type ViewerProperty = {
  globe?: GlobeProperty;
  terrain?: TerrainProperty;
  shadow?: ShadowProperty;
  scene?: SceneProperty;
  tiles?: TileProperty[];
  tileLabels?: TileLabelProperty[];
  sky?: SkyProperty;
  camera?: CameraProperty;
  ambientOcclusion?: AmbientOcclusionProperty;
  indicator?: IndicatorProperty;
  assets?: AssetsProperty;
  debug?: DebugProperty;
};

export type GlobeProperty = {
  baseColor?: string;
  enableLighting?: boolean;
  atmosphere?: GlobeAtmosphereProperty;
  depthTestAgainstTerrain?: boolean;
  imageBasedLighting?: ImageBasedLighting;
};

export type GlobeAtmosphereProperty = {
  enabled?: boolean;
  lightIntensity?: number;
  brightnessShift?: number;
  hueShift?: number;
  saturationShift?: number;
};

export type ImageBasedLighting = {
  enabled?: boolean;
  intensity?: number;
  specularEnvironmentMaps?: string;
  sphericalHarmonicCoefficients?: [number, number, number][];
};

export type TerrainProperty = {
  enabled?: boolean;
  type?: "cesium" | "arcgis" | "cesiumion";
  url?: string;
  normal?: boolean;
  heightMap?: HeightMapProperty;
};

export type HeightMapProperty = {
  type?: "custom";
  colorLUT?: LUT;
  minHeight?: number;
  maxHeight?: number;
  logarithmic?: boolean;
};

export type ShadowProperty = {
  enabled?: boolean;
  darkness?: number;
  shadowMap?: ShadowMapProperty;
};

export type ShadowMapProperty = {
  size?: 1024 | 2048 | 4096;
  softShadows?: boolean;
  darkness?: number;
  maximumDistance?: number;
};

export type SceneProperty = {
  backgroundColor?: string;
  mode?: SceneMode;
  verticalExaggeration?: number;
  verticalExaggerationRelativeHeight?: number;
  vr?: boolean;
  light?: LightProperty;
  antialias?: "low" | "medium" | "high" | "extreme";
};

export type LightProperty = {
  type?: "sunLight" | "directionalLight";
  direction?: [x: number, y: number, z: number];
  color?: string;
  intensity?: number;
};

export type TileProperty = {
  id: string;
  type?: string;
  url?: string;
  opacity?: number;
  zoomLevel?: number[];
  zoomLevelForURL?: number[];
  heatmap?: boolean;
};

export type TileLabelProperty = {
  id: string;
  labelType: "japan_gsi_optimal_bvmap";
  style: Record<string, any>;
};

export type SkyProperty = {
  skyBox?: SkyBoxProperty;
  sun?: SunProperty;
  moon?: MoonProperty;
  fog?: FogProperty;
  skyAtmosphere?: SkyAtmosphereProperty;
};

export type SkyBoxProperty = {
  show?: boolean;
};

export type SunProperty = {
  show?: boolean;
};

export type MoonProperty = {
  show?: boolean;
};

export type FogProperty = {
  enabled?: boolean;
  density?: number;
};

export type SkyAtmosphereProperty = {
  show?: boolean;
  lightIntensity?: number;
  saturationShift?: number;
  brightnessShift?: number;
};

export type CameraProperty = {
  camera?: Camera;
  allowEnterGround?: boolean;
  limiter?: CameraLimiterProperty;
};

export type CameraLimiterProperty = {
  enabled?: boolean;
  targetArea?: Camera;
  targetWidth?: number;
  targetLength?: number;
  showHelper?: boolean;
};

export type AmbientOcclusionProperty = {
  enabled?: boolean;
  quality?: "low" | "medium" | "high" | "extreme";
  intensity?: number;
  ambientOcclusionOnly?: boolean;
};

export type IndicatorProperty = {
  type: IndicatorTypes;
  image?: string;
  imageScale?: number;
};

export type AssetsProperty = {
  cesium?: {
    tiles?: {
      ionAccessToken?: string;
    };
    terrian?: {
      ionAccessToken?: string;
      ionAsset?: string;
      ionUrl?: string;
    };
  };
};

export type DebugProperty = {
  showGlobeWireframe?: boolean;
  showFramesPerSecond?: boolean;
};

export type Viewer = {
  readonly property?: ViewerProperty;
  readonly overrideProperty?: (property: ViewerProperty) => void;
};
