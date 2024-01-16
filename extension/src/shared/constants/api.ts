export let PLATEAU_API_URL: string | undefined;
export const setPlateauApiUrl = (url: string) => {
  PLATEAU_API_URL = url;
};

export let GEO_API_URL: string | undefined;
export const setGeoApiUrl = (url: string) => {
  GEO_API_URL = url;
};

export let GSI_TILE_URL: string | undefined;
export const setGISTileURL = (url: string) => {
  GSI_TILE_URL = url;
};

export let GOOGLE_STREET_VIEW_API_KEY: string | undefined;
export const setGoogleStreetViewAPIKey = (key: string) => {
  GOOGLE_STREET_VIEW_API_KEY = key;
};

export let IS_EDITOR_MODE: boolean | undefined;
export const setIsEditorMode = (v: boolean) => {
  IS_EDITOR_MODE = v;
};
