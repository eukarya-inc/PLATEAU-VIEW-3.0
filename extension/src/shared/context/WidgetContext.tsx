import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { FC, PropsWithChildren, useEffect } from "react";

import { lightTheme } from "../../prototypes/ui-components";
import {
  createSettingClient,
  settingClient,
  createTemplateClient,
  templateClient,
} from "../api/clients";
import { GEO_API_URL, GSI_TILE_URL, setGISTileURL, setGeoApiUrl } from "../constants";
import { geoClient, createGeoClient, catalogClient, createCatalogClient } from "../graphql/clients";

type Props = {
  geoUrl?: string;
  gsiTileURL?: string;
  plateauUrl?: string;
  projectId?: string;
  plateauToken?: string;
  catalogUrl?: string;
};

export const WidgetContext: FC<PropsWithChildren<Props>> = ({
  geoUrl,
  gsiTileURL,
  plateauUrl,
  projectId,
  plateauToken,
  catalogUrl,
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
    if (!geoClient && geoUrl) {
      createGeoClient(geoUrl);
    }
  }, [geoUrl]);

  useEffect(() => {
    if (!catalogClient && catalogUrl) {
      createCatalogClient(catalogUrl);
    }
  }, [catalogUrl]);

  useEffect(() => {
    if (!settingClient && !templateClient && plateauUrl && projectId && plateauToken) {
      createSettingClient(projectId, plateauUrl, plateauToken);
      createTemplateClient(projectId, plateauUrl, plateauToken);
    }
  }, [projectId, plateauUrl, plateauToken]);

  if (!geoClient || !catalogClient || !GEO_API_URL || !GSI_TILE_URL) {
    return null;
  }

  return (
    <ApolloProvider client={catalogClient}>
      <ApolloProvider client={geoClient}>
        <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
      </ApolloProvider>
    </ApolloProvider>
  );
};
