import { FC } from "react";

import { InspectorItem } from "../../../prototypes/ui-components";
import { OPACITY_FIELD } from "../../types/fieldComponents/general";
import { POINT_FILL_COLOR_CONDITION_FIELD } from "../../types/fieldComponents/point";
import { LayerModel } from "../../view-layers";
import { ComponentAtom } from "../../view-layers/component";

import { LayerOpacityField } from "./general/LayerOpacityField";
import { LayerPointFillColorConditionField } from "./point/LayerPointFillColorConditionField";

type Props = {
  layers: readonly LayerModel[];
  type: ComponentAtom["type"];
  atoms: ComponentAtom["atom"][];
};

export const Fields: FC<Props> = ({ layers, type, atoms }) => {
  switch (type) {
    // General
    case OPACITY_FIELD:
      return (
        <InspectorItem>
          <LayerOpacityField atoms={atoms as ComponentAtom<"OPACITY_FIELD">["atom"][]} />
        </InspectorItem>
      );
    // Point
    case POINT_FILL_COLOR_CONDITION_FIELD:
      return (
        <InspectorItem>
          <LayerPointFillColorConditionField
            layers={layers}
            atoms={atoms as ComponentAtom<"POINT_FILL_COLOR_CONDITION_FIELD">["atom"][]}
          />
        </InspectorItem>
      );
  }
  return null;
};
