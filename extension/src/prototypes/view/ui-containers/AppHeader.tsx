import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { useState, type FC, useEffect } from "react";

import { rootLayersAtom } from "../../../shared/states/rootLayer";
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

type Props = {
  arURL?: string;
};

export const AppHeader: FC<Props> = ({ arURL }) => {
  const hidden = useAtomValue(hideAppOverlayAtom);
  const [showShareModal, setShowShareModal] = useAtom(showShareModalAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));
  const getRootLayers = useAtomValue(rootLayersAtom);
  const [arSharedLayers, setArSharedLayers] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      if (!getRootLayers || getRootLayers?.length === 0) return;
      const layers = getRootLayers.map(({ type, id }) => ({
        type,
        id,
      }));
      setArSharedLayers(encodeURI(JSON.stringify(layers)));
    })();
  }, [getRootLayers, setArSharedLayers]);

  if (hidden) {
    return null;
  }

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
      {isMobile && arSharedLayers && (
        <IconButton size="small" onClick={() => console.log(arURL, "?dataList=", arSharedLayers)}>
          AR
        </IconButton>
      )}
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
