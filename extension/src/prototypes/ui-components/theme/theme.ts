import { alpha, createTheme, type ThemeOptions } from "@mui/material";
import { grey } from "@mui/material/colors";
import { type Shadows } from "@mui/material/styles/shadows";
import { merge } from "lodash";
import { type CSSProperties } from "react";

import { MOBILE_WIDTH } from "../../view/constants/ui";

import { MuiButton } from "./components/MuiButton";
import { MuiChip } from "./components/MuiChip";
import { MuiDivider } from "./components/MuiDivider";
import { MuiFilledInput } from "./components/MuiFilledInput";
import { MuiFormControlLabel } from "./components/MuiFormControlLabel";
import { MuiIconButton } from "./components/MuiIconButton";
import { MuiLink } from "./components/MuiLink";
import { MuiListSubheader } from "./components/MuiListSubheader";
import { MuiMenu } from "./components/MuiMenu";
import { MuiMenuItem } from "./components/MuiMenuItem";
import { MuiOutlinedInput } from "./components/MuiOutlinedInput";
import { MuiPaper } from "./components/MuiPaper";
import { MuiPopover } from "./components/MuiPopover";
import { MuiSelect } from "./components/MuiSelect";
import { MuiSlider } from "./components/MuiSlider";
import { MuiSnackbar } from "./components/MuiSnackbar";
import { MuiSvgIcon } from "./components/MuiSvgIcon";
import { MuiSwitch } from "./components/MuiSwitch";
import { MuiTab } from "./components/MuiTab";
import { MuiTextField } from "./components/MuiTextField";
import { MuiToggleButton } from "./components/MuiToggleButton";
import { MuiTooltip } from "./components/MuiTooltip";

// TODO: Transition to MUI Joy when it's released.

declare module "@mui/material/styles" {
  interface TypographyVariants {
    small: CSSProperties;
  }

  interface TypographyVariantsOptions {
    small?: CSSProperties;
  }

  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    small: true;
  }
}

const theme = createTheme();

export const themeOptions: ThemeOptions = {
  shape: {
    borderRadius: 5,
  },
  palette: {
    primary: {
      main: "#00bebe",
    },
    secondary: grey,
    // action: {
    //   selectedOpacity: 0.16,
    // },
  },
  typography: {
    fontSize: 14,
    fontFamily: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      '"Noto Sans"',
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h1: {
      fontSize: theme.typography.pxToRem(28.38),
      fontWeight: 600,
    },
    // Major second typographic scale of 14px base.
    // https://typescale.com
    h2: {
      fontSize: theme.typography.pxToRem(25.23),
      fontWeight: 600,
    },
    h3: {
      fontSize: theme.typography.pxToRem(22.43),
      fontWeight: 600,
    },
    h4: {
      fontSize: theme.typography.pxToRem(19.93),
      fontWeight: 600,
    },
    h5: {
      fontSize: theme.typography.pxToRem(17.72),
      fontWeight: 600,
    },
    h6: {
      fontSize: theme.typography.pxToRem(15.75),
      fontWeight: 600,
    },
    body1: {
      fontSize: theme.typography.pxToRem(14),
    },
    body2: {
      fontSize: theme.typography.pxToRem(12.44),
    },
    subtitle1: {
      fontSize: theme.typography.pxToRem(14),
      fontWeight: 600,
    },
    subtitle2: {
      fontSize: theme.typography.pxToRem(12.44),
      fontWeight: 600,
    },
    caption: {
      fontSize: theme.typography.pxToRem(11.06),
    },
    small: {
      fontSize: theme.typography.pxToRem(9.83),
      lineHeight: 1.2,
    },
  },
  breakpoints: {
    values: {
      mobile: MOBILE_WIDTH,
    },
  },
  components: {
    MuiButton,
    MuiChip,
    MuiDivider,
    MuiFilledInput,
    MuiFormControlLabel,
    MuiIconButton,
    MuiLink,
    MuiListSubheader,
    MuiMenu,
    MuiMenuItem,
    MuiOutlinedInput,
    MuiPaper,
    MuiPopover,
    MuiSelect,
    MuiSlider,
    MuiSnackbar,
    MuiSvgIcon,
    MuiSwitch,
    MuiTab,
    MuiTextField,
    MuiToggleButton,
    MuiTooltip,
  },
};

export const lightThemeOptions = merge<unknown, unknown, ThemeOptions>({}, themeOptions, {
  palette: {
    mode: "light",
    background: {
      default: "#ffffff",
    },
    text: {
      secondary: alpha(theme.palette.common.black, 0.45),
    },
  },
  shadows: [
    "none",
    "0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 12px 0 rgba(0, 0, 0, 0.05)",
    ...Array<string>(23).fill("0 0 2px 0 rgba(0, 0, 0, 0.15), 0 4px 32px rgba(0, 0, 0, 0.2)"),
  ] as Shadows,
});

export const darkThemeOptions = merge<unknown, unknown, ThemeOptions>({}, themeOptions, {
  palette: {
    mode: "dark",
    background: {
      default: "#222222",
      paper: "#333333",
    },
    text: {
      secondary: alpha(theme.palette.common.white, 0.45),
    },
  },
  shadows: [
    "none",
    "0 1px 12px 0 rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    ...Array<string>(23).fill("0 4px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)"),
  ] as Shadows,
});

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
