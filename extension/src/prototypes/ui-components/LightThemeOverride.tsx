import { ThemeOptions, ThemeProvider, createTheme } from "@mui/material";
import { Theme } from "@mui/system";
import { merge } from "lodash-es";
import { useState, type FC, type ReactNode, useEffect } from "react";

import { usePrimaryColor } from "../../shared/states/environmentVariables";

import { lightTheme, lightThemeOptions } from "./theme";

export interface LightThemeOverrideProps {
  children?: ReactNode;
}

export const LightThemeOverride: FC<LightThemeOverrideProps> = ({ children, ...props }) => {
  const [primaryColor] = usePrimaryColor();

  const [customTheme, setCustomTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    if ((!customTheme || customTheme.palette?.primary.main !== primaryColor) && primaryColor) {
      setCustomTheme(
        createTheme(
          merge<unknown, unknown, ThemeOptions>({}, lightThemeOptions, {
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
    <ThemeProvider {...props} theme={customTheme ?? lightTheme}>
      {children}
    </ThemeProvider>
  );
};
