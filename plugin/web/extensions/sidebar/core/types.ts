type ActionType =
  | "init"
  | "updateOverrides"
  | "screenshot"
  | "screenshot-preview"
  | "screenshot-save"
  | "initDatasetCatalog"
  | "addDatasetToScene"
  | "msgFromSidebar"
  | "msgFromModal"
  | "modal-close"
  | "datacatalog-modal-open"
  | "welcome-modal-open"
  | "minimize";

export type PostMessageProps = { action: ActionType; payload?: any };

export type ReearthApi = {
  default?: {
    camera?: Camera;
    sceneMode?: SceneMode;
    depthTestAgainstTerrain?: boolean;
    allowEnterGround?: boolean;
  };
  terrain?: {
    terrain?: boolean;
    terrainType?: "cesiumion";
    terrainCesiumIonAsset?: string;
    terrainCesiumIonAccessToken?: string;
    terrainCesiumIonUrl?: string;
    terrainExaggeration?: number;
    terrainExaggerationRelativeHeight?: number;
    depthTestAgainstTerrain?: boolean;
  };
  tiles?: Tile[];
};

export type SceneMode = "3d" | "2d";

type Tile = {
  id: string;
  tile_url?: string;
  tile_type: string;
};

export type Camera = {
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
  pitch: number;
  roll: number;
};

export type PublishProject = {
  // Here would be all fields being saved to backend
};
