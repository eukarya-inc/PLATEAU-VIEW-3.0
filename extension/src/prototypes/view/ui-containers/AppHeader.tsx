import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import { atom, useAtom, useAtomValue } from "jotai";
import { type FC, useMemo, useCallback } from "react";

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
  const rootLayersForAR = useAtomValue(
    useMemo(
      () =>
        atom(get => {
          return get(rootLayersAtom)
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

  const handleARClick = useCallback(() => {
    const url = arURL + "?dataList=" + encodeURI(JSON.stringify(rootLayersForAR));
    window.open(url, "_blank", "noopener,noreferrer");
  }, [arURL, rootLayersForAR]);

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
      {isMobile && (
        <IconButton size="small" onClick={handleARClick}>
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
