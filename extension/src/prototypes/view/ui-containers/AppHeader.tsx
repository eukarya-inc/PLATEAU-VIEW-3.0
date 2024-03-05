import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState, type FC, useEffect } from "react";

import { SharedRootLayer, getSharedRootLayersAtom } from "../../../shared/states/share";
import { isAppReadyAtom } from "../../../shared/view/state/app";
import ShareModal from "../../../shared/view/ui-container/ShareModal";
import { AppBar, PaperPlaneTilt, Space } from "../../ui-components";
import { hideAppOverlayAtom, showShareModalAtom } from "../states/app";

import { CameraButtons } from "./CameraButtons";
import { DateControlButton } from "./DateControlButton";
import { EnvironmentSelect } from "./EnvironmentSelect";
import { LocationBreadcrumbs } from "./LocationBreadcrumbs";
import { MainMenuButton } from "./MainMenuButton";
import { SettingsButton } from "./SettingsButton";
import { ToolButtons } from "./ToolButtons";

export const AppHeader: FC = () => {
  const hidden = useAtomValue(hideAppOverlayAtom);
  const [showShareModal, setShowShareModal] = useAtom(showShareModalAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));
  const getSharedRootLayers = useSetAtom(getSharedRootLayersAtom);
  const [sharedRootLayers, setSharedRootLayers] = useState<SharedRootLayer[] | undefined>();
  const isAppReady = useAtomValue(isAppReadyAtom);

  useEffect(() => {
    (async () => {
      if (!isAppReady) return;
      const layers = await getSharedRootLayers();
      setSharedRootLayers(layers);
    })();
  }, [isAppReady, getSharedRootLayers]);
  if (hidden) {
    return null;
  }

  console.log(sharedRootLayers);

  return (
    <AppBar>
      <MainMenuButton />
      {!isMobile && (
        <>
          <Space size={2} />
          <ToolButtons />
        </>
      )}
      <Space flexible={isMobile} />
      <SettingsButton />
      <DateControlButton />
      <EnvironmentSelect />
      <IconButton>
        <PaperPlaneTilt onClick={() => setShowShareModal(true)} />
      </IconButton>
      {isMobile && <IconButton size="small">AR</IconButton>}
      {showShareModal && (
        <ShareModal showShareModal={showShareModal} setShowShareModal={setShowShareModal} />
      )}
      {!isMobile && (
        <>
          <Space flexible />
          <LocationBreadcrumbs />
          <Space flexible />
        </>
      )}
      {!isMobile && <CameraButtons />}
    </AppBar>
  );
};
