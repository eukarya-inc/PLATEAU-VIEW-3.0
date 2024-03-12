import { useMediaQuery, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { type FC, useState } from "react";

import { Spacer } from "../../../shared/ui-components/Spacer";
import { AppOverlayLayout } from "../../ui-components";
import { hideAppOverlayAtom } from "../states/app";

// import { DeveloperPanels } from "../developer/DeveloperPanels";
import { MainPanel } from "./MainPanel";
import { SelectionPanel } from "./SelectionPanel";

type Props = {
  type: "main" | "aside" | "developer";
  width: number;
  height?: number;
};

export const AppOverlay: FC<Props> = ({ type, width, height }) => {
  const hidden = useAtomValue(hideAppOverlayAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));
  const [mainWidth, setMainWidth] = useState(320);

  return (
    <>
      <AppOverlayLayout
        hidden={hidden}
        mainWidth={mainWidth}
        main={type === "main" ? <MainPanel onWidthChange={setMainWidth} /> : null}
        aside={type === "aside" ? <SelectionPanel /> : null}
        // developer={<DeveloperPanels />}
      />
      {!isMobile && <Spacer width={width} height={height} hidden={hidden} />}
    </>
  );
};
