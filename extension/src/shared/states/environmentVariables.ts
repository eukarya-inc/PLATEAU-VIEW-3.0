import { atom, useAtom } from "jotai";

import type { CameraPosition } from "../reearth/types";

// default settings
const plateauApiUrl = atom<string | undefined>(undefined);
export const usePlateauApiUrl = () => useAtom(plateauApiUrl);

const projectId = atom<string | undefined>(undefined);
export const useProjectId = () => useAtom(projectId);

const geoApiUrl = atom<string | undefined>(undefined);
export const useGeoApiUrl = () => useAtom(geoApiUrl);

const gsiTileUrl = atom<string | undefined>(undefined);
export const useGsiTileUrl = () => useAtom(gsiTileUrl);

const googleStreetViewApiKey = atom<string | undefined>(undefined);
export const useGoogleStreetViewApiKey = () => useAtom(googleStreetViewApiKey);

const estatUrl = atom<string | undefined>(undefined);
export const useEstatUrl = () => useAtom(estatUrl);

const hideFeedback = atom(false);
export const useHideFeedback = () => useAtom(hideFeedback);

const isCityProject = atom(false);
export const useIsCityProject = () => useAtom(isCityProject);

// custom settings

const cityName = atom<string | undefined>(undefined);
export const useCityName = () => useAtom(cityName);

const cityCode = atom<string | undefined>(undefined);
export const useCityCode = () => useAtom(cityCode);

const primaryColor = atom<string | undefined>(undefined);
export const usePrimaryColor = () => useAtom(primaryColor);

const mainLogo = atom<string | undefined>(undefined);
export const useMainLogo = () => useAtom(mainLogo);

const menuLogo = atom<string | undefined>(undefined);
export const useMenuLogo = () => useAtom(menuLogo);

const siteUrl = atom<string | undefined>(undefined);
export const useSiteUrl = () => useAtom(siteUrl);

const initialPedestrianCoordinates = atom<CameraPosition | undefined>(undefined);
export const useInitialPedestrianCoordinates = () => useAtom(initialPedestrianCoordinates);

const plateauGeojsonUrl = atom<string | undefined>(undefined);
export const usePlateauGeojsonUrl = () => useAtom(plateauGeojsonUrl);
