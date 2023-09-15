import { useAtomValue } from "jotai";
import { type FC } from "react";

import { AppOverlayLayout } from "../../ui-components";
import { hideAppOverlayAtom } from "../states/app";

// import { DeveloperPanels } from "../developer/DeveloperPanels";
import { MainPanel } from "./MainPanel";
import { SelectionPanel } from "./SelectionPanel";

type Props = {
  type: "main" | "aside" | "developer";
};

export const AppOverlay: FC<Props> = ({ type }) => {
  const hidden = useAtomValue(hideAppOverlayAtom);
  return (
    <AppOverlayLayout
      hidden={hidden}
      main={type === "main" ? <MainPanel /> : null}
      aside={type === "aside" ? <SelectionPanel /> : null}
      // developer={<DeveloperPanels />}
    />
  );
};
