import { Story } from "../storytelling/types";

import { Data } from "./core/types";

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
  | "updateDatasetInScene"
  | "removeDatasetFromScene"
  | "removeAllDatasetsFromScene"
  | "catalogModalOpen"
  | "triggerCatalogOpen"
  | "triggerHelpOpen"
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
  | "minimize"
  | "buildingSearchOpen"
  | "groupSelectOpen"
  | "saveGroups"
  | "cameraFlyTo"
  | "storyPlay";

export type PostMessageProps = { action: ActionType; payload?: any };

export type Project = {
  sceneOverrides: ReearthApi;
  selectedDatasets: Data[];
  userStory?: Story;
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

type PluginActionType = "storyShare";

export type PluginMessage = {
  data: {
    action: PluginActionType;
    payload: any;
  };
  sender: string;
};
