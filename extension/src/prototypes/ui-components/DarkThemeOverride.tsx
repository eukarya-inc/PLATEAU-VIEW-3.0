import { ThemeOptions, ThemeProvider, createTheme } from "@mui/material";
import { Theme } from "@mui/system";
import { merge } from "lodash-es";
import { useState, type FC, type ReactNode, useEffect } from "react";

import { usePrimaryColor } from "../../shared/states/environmentVariables";

import { darkTheme, darkThemeOptions } from "./theme";

export interface DarkThemeOverrideProps {
  children?: ReactNode;
}

export const DarkThemeOverride: FC<DarkThemeOverrideProps> = ({ children, ...props }) => {
  const [primaryColor] = usePrimaryColor();

  const [customTheme, setCustomTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    if ((!customTheme || customTheme.palette?.primary.main !== primaryColor) && primaryColor) {
      setCustomTheme(
        createTheme(
          merge<unknown, unknown, ThemeOptions>({}, darkThemeOptions, {
            palette: {
              primary: {
                main: primaryColor,
              },
            },
          }),
        ),
      );
    }
  }, [customTheme, primaryColor]);

  return (
    <ThemeProvider {...props} theme={customTheme ?? darkTheme}>
      {children}
    </ThemeProvider>
  );
};
