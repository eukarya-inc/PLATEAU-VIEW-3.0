import { ThemeProvider } from "@mui/material";
import { FC, PropsWithChildren } from "react";

import { lightTheme } from "../../prototypes/ui-components";

export const WidgetContext: FC<PropsWithChildren> = ({ children }) => {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
};
