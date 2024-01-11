import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { FC, PropsWithChildren, useEffect } from "react";

import { lightTheme } from "../../prototypes/ui-components";
import {
  createSettingClient,
  settingClient,
  createTemplateClient,
  templateClient,
} from "../api/clients";
import {
  GEO_API_URL,
  GOOGLE_STREET_VIEW_API_KEY,
  GSI_TILE_URL,
  IS_EDITOR_MODE,
  setGISTileURL,
  setGeoApiUrl,
  setGoogleStreetViewAPIKey,
  setIsEditorMode,
} from "../constants";
import { geoClient, createGeoClient, catalogClient, createCatalogClient } from "../graphql/clients";

type Props = {
  geoUrl?: string;
  gsiTileURL?: string;
  plateauUrl?: string;
  projectId?: string;
  plateauToken?: string;
  catalogUrl?: string;
  googleStreetViewAPIKey?: string;
  isEditorMode?: boolean;
};

export const WidgetContext: FC<PropsWithChildren<Props>> = ({
  geoUrl,
  gsiTileURL,
  plateauUrl,
  projectId,
  plateauToken,
  catalogUrl,
  googleStreetViewAPIKey,
  isEditorMode,
  children,
}) => {
  useEffect(() => {
    if (!GEO_API_URL && geoUrl) {
      setGeoApiUrl(geoUrl);
    }
  }, [geoUrl]);

  useEffect(() => {
    if (!GSI_TILE_URL && gsiTileURL) {
      setGISTileURL(gsiTileURL);
    }
  }, [gsiTileURL]);

  useEffect(() => {
    if (!GOOGLE_STREET_VIEW_API_KEY && googleStreetViewAPIKey) {
      setGoogleStreetViewAPIKey(googleStreetViewAPIKey);
    }
  }, [googleStreetViewAPIKey]);

  useEffect(() => {
    if (!IS_EDITOR_MODE) {
      setIsEditorMode(!!isEditorMode);
    }
  }, [isEditorMode]);

  useEffect(() => {
    if (!geoClient && geoUrl) {
      createGeoClient(geoUrl);
    }
  }, [geoUrl]);

  useEffect(() => {
    if (!catalogClient && catalogUrl) {
      createCatalogClient(catalogUrl, isEditorMode ? plateauToken : undefined);
    }
  }, [catalogUrl, plateauToken, isEditorMode]);

  useEffect(() => {
    if (!settingClient && !templateClient && plateauUrl && projectId && plateauToken) {
      const sidebar = `${plateauUrl}/sidebar`;
      createSettingClient(projectId, sidebar, plateauToken);
      createTemplateClient(projectId, sidebar, plateauToken);
    }
  }, [projectId, plateauUrl, plateauToken]);

  if (!geoClient || !catalogClient || !GEO_API_URL || !GSI_TILE_URL) {
    return null;
  }

  return (
    <ApolloProvider client={catalogClient}>
      <ApolloProvider client={geoClient}>
        <ThemeProvider theme={lightTheme}>
          <SnackbarProvider maxSnack={1}>{children}</SnackbarProvider>
        </ThemeProvider>
      </ApolloProvider>
    </ApolloProvider>
  );
};
