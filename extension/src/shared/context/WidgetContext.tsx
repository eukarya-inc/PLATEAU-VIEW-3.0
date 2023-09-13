import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { FC, PropsWithChildren } from "react";

import { lightTheme } from "../../prototypes/ui-components";
import { client } from "../graphql/client";

export const WidgetContext: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
    </ApolloProvider>
  );
};
