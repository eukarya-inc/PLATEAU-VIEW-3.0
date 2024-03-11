import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import { atom, useAtom, useAtomValue } from "jotai";
import { useState, type FC, useEffect, useMemo } from "react";

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
  const [arSharedLayers, setArSharedLayers] = useState<string | undefined>();
  const rootLayersForAR = useAtomValue(
    useMemo(
      () =>
        atom(get => {
          const rootLayers = get(rootLayersAtom);
          return rootLayers
            .map(({ id, ...rest }) =>
              rest.type === "dataset"
                ? {
                    datasetId: id,
                    dataId: get(rest.currentDataIdAtom),
                  }
                : undefined,
            )
            .filter(Boolean);
        }),
      [],
    ),
  );

  useEffect(() => {
    (async () => {
      if (!rootLayersForAR || rootLayersForAR?.length === 0 || !arURL) return;

      const url = arURL + "?dataList=" + encodeURI(JSON.stringify(rootLayersForAR));
      setArSharedLayers(url);
    })();
  }, [rootLayersForAR, setArSharedLayers, arURL]);

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
        <IconButton size="small" href={arSharedLayers} target="_blank">
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
