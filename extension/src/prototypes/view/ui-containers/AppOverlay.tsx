import { useAtomValue } from "jotai";
import { type FC } from "react";

import { AppOverlayLayout } from "../../ui-components";
import { hideAppOverlayAtom } from "../states/app";

// import { DeveloperPanels } from "../developer/DeveloperPanels";
// import { SelectionPanel } from "./SelectionPanel";
import { MainPanel } from "./MainPanel";

export const AppOverlay: FC = () => {
  const hidden = useAtomValue(hideAppOverlayAtom);
  return (
    <AppOverlayLayout
      hidden={hidden}
      main={<MainPanel />}
      // TODO(ReEarth): This should be placed at Toolbar widget
      // aside={<SelectionPanel />}
      // developer={<DeveloperPanels />}
    />
  );
};
