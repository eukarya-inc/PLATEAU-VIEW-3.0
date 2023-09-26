import { FC } from "react";

import { InspectorItem } from "../../prototypes/ui-components";
import { OPACITY_FIELD } from "../api/types/fields/general";
import { LayerOpacityField } from "../view/fields/general/LayerOpacityField";

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
          <LayerOpacityField atoms={atoms as ComponentAtom<"OPACITY_FIELD">["atom"][]} />
        </InspectorItem>
      );
  }
  return null;
};
