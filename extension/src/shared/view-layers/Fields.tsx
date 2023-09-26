import { FC } from "react";

import { InspectorItem } from "../../prototypes/ui-components";
import { OPACITY_FIELD } from "../api/types/fields/general";
import { LayerOpacitySection } from "../view/selection/general/LayerOpacitySection";

import { ComponentAtom } from "./component";

type Props = {
  type: ComponentAtom["type"];
  atoms: ComponentAtom["atom"][];
};

export const Fields: FC<Props> = ({ type, atoms }) => {
  switch (type) {
    case OPACITY_FIELD:
      return (
        <InspectorItem>
          <LayerOpacitySection atoms={atoms as ComponentAtom<"OPACITY_FIELD">["atom"][]} />
        </InspectorItem>
      );
  }
  return null;
};
