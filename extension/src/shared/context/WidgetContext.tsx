import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { FC, PropsWithChildren, useEffect } from "react";

import { lightTheme } from "../../prototypes/ui-components";
import { client, createClient } from "../graphql/client";

type Props = {
  geoUrl?: string;
};

export const WidgetContext: FC<PropsWithChildren<Props>> = ({ geoUrl, children }) => {
  useEffect(() => {
    if (!client && geoUrl) {
      createClient(geoUrl);
    }
  }, [geoUrl]);

  if (!client) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ApolloProvider>
  );
};
