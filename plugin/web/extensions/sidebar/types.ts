import { CatalogRawItem } from "./core/processCatalog";

type ActionType =
  | "init"
  | "initDataCatalog"
  | "initPopup"
  | "initWelcome"
  | "storageSave"
  | "storageFetch"
  | "storageKeys"
  | "storageDelete"
  | "updateProject"
  | "screenshot"
  | "screenshotPreview"
  | "screenshotSave"
  | "addDatasetToScene"
  | "catalogModalOpen"
  | "mapModalOpen"
  | "clipModalOpen"
  | "modalClose"
  | "msgFromModal"
  | "helpPopupOpen"
  | "popupClose"
  | "msgToPopup"
  | "msgFromPopup"
  | "mobileDropdownOpen"
  | "msgToMobileDropdown"
  | "checkIfMobile"
  | "extendPopup"
  | "minimize";

export type PostMessageProps = { action: ActionType; payload?: any };

export type Project = {
  sceneOverrides: ReearthApi;
  selectedDatasets: CatalogRawItem[];
};

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

type SceneMode = "3d" | "2d";

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
