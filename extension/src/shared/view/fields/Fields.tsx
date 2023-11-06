import { FC } from "react";

import { type LayerModel as PrototypeLayerModel } from "../../../prototypes/layers";
import { InspectorItem } from "../../../prototypes/ui-components";
import { BuildingLayerColorSection } from "../../../prototypes/view/selection/BuildingLayerColorSection";
import { TILESET_BUILDING_MODEL_COLOR } from "../../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../../types/fieldComponents/general";
import {
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
} from "../../types/fieldComponents/point";
import { LayerModel } from "../../view-layers";
import { ComponentAtom } from "../../view-layers/component";

import { LayerOpacityField } from "./general/LayerOpacityField";
import { LayerPointFillColorConditionField } from "./point/LayerPointFillColorConditionField";
import { LayerPointFillGradientColorField } from "./point/LayerPointFillGradientColorField";

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
    case POINT_FILL_COLOR_GRADIENT_FIELD:
      return (
        <InspectorItem>
          <LayerPointFillGradientColorField
            layers={layers}
            atoms={atoms as ComponentAtom<"POINT_FILL_COLOR_GRADIENT_FIELD">["atom"][]}
          />
        </InspectorItem>
      );
    case TILESET_BUILDING_MODEL_COLOR:
      return (
        <InspectorItem>
          <BuildingLayerColorSection layers={layers as PrototypeLayerModel[]} />
        </InspectorItem>
      );
  }
  return null;
};
