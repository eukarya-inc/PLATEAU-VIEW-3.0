// default settings
export let PLATEAU_API_URL: string | undefined;
export const setPlateauApiUrl = (url: string) => {
  PLATEAU_API_URL = url;
};

export let PROJECT_ID: string | undefined;
export const setProjectId = (id: string) => {
  PROJECT_ID = id;
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

// municipality settings
export let MUNICIPALITY_SITE_URL: string | undefined;
export const setMunicipalitySiteURL = (url: string) => {
  MUNICIPALITY_SITE_URL = url;
};

export let MUNICIPALITY_PROJECT_ID: string | undefined;
export const setMunicipalityProjectId = (id: string) => {
  MUNICIPALITY_PROJECT_ID = id;
};

// appearance settings
export let PRIMARY_COLOR: string | undefined;
export const setPrimaryColor = (color: string) => {
  PRIMARY_COLOR = color;
};

export let LOGO: string | undefined;
export const setLogo = (url: string) => {
  LOGO = url;
};
