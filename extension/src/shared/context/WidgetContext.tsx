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
  PLATEAU_API_URL,
  setGISTileURL,
  setGeoApiUrl,
  setGoogleStreetViewAPIKey,
  setPlateauApiUrl,
} from "../constants";
import { geoClient, createGeoClient, catalogClient, createCatalogClient } from "../graphql/clients";

type Props = {
  geoUrl?: string;
  gsiTileURL?: string;
  plateauUrl?: string;
  projectId?: string;
  plateauToken?: string;
  catalogUrl?: string;
  catalogURLForAdmin?: string;
  googleStreetViewAPIKey?: string;
  inEditor?: boolean;
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
}) => {
  useEffect(() => {
    if (!PLATEAU_API_URL && plateauUrl) {
      setPlateauApiUrl(plateauUrl);
    }
  }, [plateauUrl]);

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
    if (!geoClient && geoUrl) {
      createGeoClient(geoUrl);
    }
  }, [geoUrl]);

  useEffect(() => {
    const url = inEditor ? catalogURLForAdmin || catalogUrl : catalogUrl;
    if (url) {
      createCatalogClient(url, inEditor ? plateauToken : undefined);
    }
  }, [catalogUrl, catalogURLForAdmin, plateauToken, inEditor]);

  useEffect(() => {
    if (!settingClient && !templateClient && plateauUrl && projectId && plateauToken) {
      const sidebar = `${plateauUrl}/sidebar`;
      createSettingClient(projectId, sidebar, plateauToken);
      createTemplateClient(projectId, sidebar, plateauToken);
    }
  }, [projectId, plateauUrl, plateauToken]);

  if (!PLATEAU_API_URL || !geoClient || !catalogClient || !GEO_API_URL || !GSI_TILE_URL) {
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
