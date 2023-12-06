import { useMediaQuery, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { type FC } from "react";

import { AppBar, Space } from "../../ui-components";
import { hideAppOverlayAtom } from "../states/app";

import { CameraButtons } from "./CameraButtons";
import { DateControlButton } from "./DateControlButton";
import { EnvironmentSelect } from "./EnvironmentSelect";
import { LocationBreadcrumbs } from "./LocationBreadcrumbs";
import { MainMenuButton } from "./MainMenuButton";
import { SettingsButton } from "./SettingsButton";
import { ToolButtons } from "./ToolButtons";

export const AppHeader: FC = () => {
  const hidden = useAtomValue(hideAppOverlayAtom);
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("mobile"));
  if (hidden) {
    return null;
  }
  return (
    <AppBar>
      <MainMenuButton />
      {!smDown && (
        <>
          <Space size={2} />
          <ToolButtons />
        </>
      )}
      <Space flexible={smDown} />
      <SettingsButton />
      <DateControlButton />
      <EnvironmentSelect />
      {!smDown && (
        <>
          <Space flexible />
          <LocationBreadcrumbs />
          <Space flexible />
        </>
      )}
      {!smDown && <CameraButtons />}
    </AppBar>
  );
};
