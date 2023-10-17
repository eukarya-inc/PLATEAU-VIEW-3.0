import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { FC, PropsWithChildren, useEffect } from "react";

import { lightTheme } from "../../prototypes/ui-components";
import { geoClient, createGeoClient, plateauClient, createPlateauClient } from "../graphql/clients";

type Props = {
  geoUrl?: string;
  plateauUrl?: string;
};

export const WidgetContext: FC<PropsWithChildren<Props>> = ({ geoUrl, plateauUrl, children }) => {
  useEffect(() => {
    if (!geoClient && geoUrl) {
      createGeoClient(geoUrl);
    }
  }, [geoUrl]);

  useEffect(() => {
    if (!plateauClient && plateauUrl) {
      createPlateauClient(plateauUrl);
    }
  }, [plateauUrl]);

  if (!geoClient || !plateauClient) {
    return null;
  }

  return (
    <ApolloProvider client={plateauClient}>
      <ApolloProvider client={geoClient}>
        <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
      </ApolloProvider>
    </ApolloProvider>
  );
};
