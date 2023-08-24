import { Camera, LatLngHeight } from "./camera";

export type TerrainProperty = {
  terrain?: boolean;
  terrainType?: "cesium" | "arcgis" | "cesiumion"; // default: cesium
  terrainExaggeration?: number; // default: 1
  terrainExaggerationRelativeHeight?: number; // default: 0
  depthTestAgainstTerrain?: boolean;
  terrainCesiumIonAsset?: string;
  terrainCesiumIonAccessToken?: string;
  terrainCesiumIonUrl?: string;
  terrainUrl?: string;
  terrainNormal?: boolean;
};

export type SceneProperty = {
  default?: {
    camera?: Camera;
    allowEnterGround?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
    // sceneMode?: SceneMode; // default: scene3d
    vr?: boolean;
  } & TerrainProperty; // compat
  cameraLimiter?: {
    cameraLimitterEnabled?: boolean;
    cameraLimitterShowHelper?: boolean;
    cameraLimitterTargetArea?: Camera;
    cameraLimitterTargetWidth?: number;
    cameraLimitterTargetLength?: number;
  };
  //   indicator?: {
  //     indicator_type: IndicatorTypes;
  //     indicator_image?: string;
  //     indicator_image_scale?: number;
  //   };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_maxLevel?: number;
    tile_minLevel?: number;
    tile_opacity?: number;
  }[];
  terrain?: TerrainProperty;
  atmosphere?: {
    enable_sun?: boolean;
    enable_lighting?: boolean;
    ground_atmosphere?: boolean;
    sky_atmosphere?: boolean;
    shadows?: boolean;
    shadowResolution?: 1024 | 2048 | 4096;
    softShadow?: boolean;
    shadowDarkness?: number;
    fog?: boolean;
    fog_density?: number;
    brightness_shift?: number;
    hue_shift?: number;
    surturation_shift?: number;
    globeShadowDarkness?: number;
    globeImageBasedLighting?: boolean;
  };
  timeline?: {
    animation?: boolean;
    visible?: boolean;
    current?: string;
    start?: string;
    stop?: string;
    stepType?: "rate" | "fixed";
    multiplier?: number;
    step?: number;
    rangeType?: "unbounded" | "clamped" | "bounced";
  };
  googleAnalytics?: {
    enableGA?: boolean;
    trackingId?: string;
  };
  theme?: {
    themeType?: "light" | "dark" | "forest" | "custom";
    themeTextColor?: string;
    themeSelectColor?: string;
    themeBackgroundColor?: string;
  };
  ambientOcclusion?: {
    enabled?: boolean;
    quality?: "low" | "medium" | "high" | "extreme";
    intensity?: number;
    ambientOcclusionOnly?: boolean;
  };
  light?: {
    lightType?: "sunLight" | "directionalLight";
    lightDirectionX?: number;
    lightDirectionY?: number;
    lightDirectionZ?: number;
    lightColor?: string;
    lightIntensity?: number;
    specularEnvironmentMaps?: string;
    sphericalHarmonicCoefficients?: [x: number, y: number, z: number][];
    imageBasedLightIntensity?: number;
  };
  render?: {
    antialias?: "low" | "medium" | "high" | "extreme";
    debugFramePerSecond?: boolean;
  };
};

export type Scene = {
  readonly inEditor: boolean;
  readonly built: boolean;
  readonly property?: SceneProperty;
  readonly overrideProperty: (property: SceneProperty) => void;
  readonly captureScreen: (type?: string, encoderOptions?: number) => string | undefined;
  readonly getLocationFromScreen: (
    x: number,
    y: number,
    withTerrain?: boolean,
  ) => LatLngHeight | undefined;
  readonly sampleTerrainHeight: (lng: number, lat: number) => Promise<number | undefined>;
};
