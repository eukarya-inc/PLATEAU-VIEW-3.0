import { Divider } from "@mui/material";
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
  let component;
  switch (type) {
    // General
    case OPACITY_FIELD: {
      component = <LayerOpacityField atoms={atoms as ComponentAtom<"OPACITY_FIELD">["atom"][]} />;
      break;
    }
    // Point
    case POINT_FILL_COLOR_CONDITION_FIELD: {
      component = (
        <LayerPointFillColorConditionField
          layers={layers}
          atoms={atoms as ComponentAtom<"POINT_FILL_COLOR_CONDITION_FIELD">["atom"][]}
        />
      );
      break;
    }
    case POINT_FILL_COLOR_GRADIENT_FIELD: {
      component = (
        <LayerPointFillGradientColorField
          layers={layers}
          atoms={atoms as ComponentAtom<"POINT_FILL_COLOR_GRADIENT_FIELD">["atom"][]}
        />
      );
      break;
    }
    case TILESET_BUILDING_MODEL_COLOR: {
      component = <BuildingLayerColorSection layers={layers as PrototypeLayerModel[]} />;
      break;
    }
  }

  if (!component) return null;

  return (
    <>
      <Divider />
      <InspectorItem>{component}</InspectorItem>
    </>
  );
};
