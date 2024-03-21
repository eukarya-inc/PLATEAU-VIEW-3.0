import { ApolloClient, ApolloProvider, NormalizedCacheObject } from "@apollo/client";
import { Theme, ThemeOptions, ThemeProvider, createTheme } from "@mui/material";
import { merge } from "lodash-es";
import { SnackbarProvider } from "notistack";
import { FC, PropsWithChildren, useEffect, useState } from "react";

import { lightTheme, lightThemeOptions } from "../../prototypes/ui-components";
import {
  createSettingClient,
  settingClient,
  createTemplateClient,
  templateClient,
  deleteSettingClient,
  deleteTemplateClient,
} from "../api/clients";
import {
  GEO_API_URL,
  GOOGLE_STREET_VIEW_API_KEY,
  GSI_TILE_URL,
  LOGO,
  PLATEAU_API_URL,
  PROJECT_ID,
  PRIMARY_COLOR,
  setGISTileURL,
  setGeoApiUrl,
  setGoogleStreetViewAPIKey,
  setLogo,
  setPlateauApiUrl,
  setProjectId,
  setPrimaryColor,
  SITE_URL,
  setSiteURL,
  CITY_NAME,
  setCityName,
  INITIAL_PEDESTRIAN_COORDINATES,
  setInitialPededstrianCoordinates,
  PLATEAU_GEOJSON_URL,
  setPlateauGeojsonUrl,
} from "../constants";
import {
  geoClient,
  createGeoClient,
  catalogClient,
  createCatalogClient,
  deleteGeoClient,
} from "../graphql/clients";
import { CameraPosition } from "../reearth/types";

import useInitializeClientHelper from "./useInitializeClientHelper";
import useInitializeStateHelper from "./useInitializeStateHelper";

type Props = {
  inEditor?: boolean;
  // Default settings
  geoUrl?: string;
  gsiTileURL?: string;
  plateauUrl?: string;
  projectId?: string;
  plateauToken?: string;
  catalogUrl?: string;
  catalogURLForAdmin?: string;
  googleStreetViewAPIKey?: string;
  geojsonURL?: string;
  // Custom settings
  cityName?: string;
  customPrimaryColor?: string;
  customLogo?: string;
  customPedestrian?: CameraPosition;
  customSiteUrl?: string;
};

export const WidgetContext: FC<PropsWithChildren<Props>> = ({
  geoUrl,
  gsiTileURL,
  plateauUrl,
  projectId,
  plateauToken,
  catalogUrl,
  catalogURLForAdmin,
  googleStreetViewAPIKey,
  children,
  inEditor,
  cityName,
  customPrimaryColor,
  customLogo,
  customPedestrian,
  customSiteUrl,
  geojsonURL,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // cleanup
  useEffect(
    () => () => {
      setPlateauApiUrl(undefined);
      setProjectId(undefined);
      setGeoApiUrl(undefined);
      setGISTileURL(undefined);
      setGoogleStreetViewAPIKey(undefined);
      setCityName(undefined);
      setSiteURL(undefined);
      setLogo(undefined);
      setInitialPededstrianCoordinates(undefined);
      setPlateauGeojsonUrl(undefined);
      setPrimaryColor(undefined);
      setCustomTheme(undefined);
      deleteGeoClient();
      deleteSettingClient();
      deleteTemplateClient();
      setIsInitialized(false);
    },
    [],
  );

  // Environment variables
  useInitializeStateHelper<typeof cityName>(isInitialized, cityName, CITY_NAME, setCityName);
  useInitializeStateHelper<typeof customSiteUrl>(
    isInitialized,
    customSiteUrl,
    SITE_URL,
    setSiteURL,
  );
  useInitializeStateHelper<typeof customLogo>(isInitialized, customLogo, LOGO, setLogo);
  useInitializeStateHelper<typeof customPedestrian>(
    isInitialized,
    customPedestrian,
    INITIAL_PEDESTRIAN_COORDINATES,
    setInitialPededstrianCoordinates,
  );
  useInitializeStateHelper<typeof plateauUrl>(
    isInitialized,
    plateauUrl,
    PLATEAU_API_URL,
    setPlateauApiUrl,
  );
  useInitializeStateHelper<typeof projectId>(isInitialized, projectId, PROJECT_ID, setProjectId);
  useInitializeStateHelper<typeof geoUrl>(isInitialized, geoUrl, GEO_API_URL, setGeoApiUrl);
  useInitializeStateHelper<typeof gsiTileURL>(
    isInitialized,
    gsiTileURL,
    GSI_TILE_URL,
    setGISTileURL,
  );
  useInitializeStateHelper<typeof googleStreetViewAPIKey>(
    isInitialized,
    googleStreetViewAPIKey,
    GOOGLE_STREET_VIEW_API_KEY,
    setGoogleStreetViewAPIKey,
  );
  useInitializeStateHelper<typeof geojsonURL>(
    isInitialized,
    geojsonURL,
    PLATEAU_GEOJSON_URL,
    setPlateauGeojsonUrl,
  );
  useInitializeStateHelper<typeof customPrimaryColor>(
    isInitialized,
    customPrimaryColor,
    PRIMARY_COLOR,
    setPrimaryColor,
  );

  // Clients
  useInitializeClientHelper<ApolloClient<NormalizedCacheObject> | undefined>(
    isInitialized,
    geoUrl,
    geoClient,
    createGeoClient,
  );
  useInitializeClientHelper<ApolloClient<NormalizedCacheObject> | undefined>(
    isInitialized,
    inEditor ? catalogURLForAdmin || catalogUrl : catalogUrl,
    catalogClient,
    createCatalogClient,
    inEditor ? plateauToken : undefined,
  );

  useEffect(() => {
    if (isInitialized) return;
    if (!settingClient && !templateClient && plateauUrl && projectId && plateauToken) {
      const sidebar = `${plateauUrl}/sidebar`;
      createSettingClient(projectId, sidebar, plateauToken);
      createTemplateClient(projectId, sidebar, plateauToken);
    }
  }, [projectId, plateauUrl, plateauToken, isInitialized]);

  const [customTheme, setCustomTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    if (!customTheme && PRIMARY_COLOR) {
      setCustomTheme(
        createTheme(
          merge<unknown, unknown, ThemeOptions>({}, lightThemeOptions, {
            palette: {
              primary: {
                main: PRIMARY_COLOR,
              },
            },
          }),
        ),
      );
    }
  }, [customTheme]);

  if (!PLATEAU_API_URL || !geoClient || !catalogClient || !GEO_API_URL || !GSI_TILE_URL) {
    if (isInitialized) {
      setIsInitialized(false);
    }
    return null;
  }

  if (!isInitialized) {
    setIsInitialized(true);
  }

  return (
    <ApolloProvider client={catalogClient}>
      <ApolloProvider client={geoClient}>
        <ThemeProvider theme={customTheme ?? lightTheme}>
          <SnackbarProvider maxSnack={1}>{children}</SnackbarProvider>
        </ThemeProvider>
      </ApolloProvider>
    </ApolloProvider>
  );
};
