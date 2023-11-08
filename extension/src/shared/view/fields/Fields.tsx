import { Divider } from "@mui/material";
import { FC } from "react";

import { type LayerModel as PrototypeLayerModel } from "../../../prototypes/layers";
import { InspectorItem } from "../../../prototypes/ui-components";
import { BuildingLayerColorSection } from "../../../prototypes/view/selection/BuildingLayerColorSection";
import {
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_FILL_COLOR_CONDITION_FIELD,
  TILESET_FILL_COLOR_GRADIENT_FIELD,
} from "../../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../../types/fieldComponents/general";
import {
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/point";
import { LayerModel } from "../../view-layers";
import { ComponentAtom } from "../../view-layers/component";

import { LayerTilesetFillColorConditionField } from "./3dtiles/LayerTilesetFillColorConditionField";
import { LayerTilesetFillGradientColorField } from "./3dtiles/LayerTilesetFillGradientColorField";
import { LayerOpacityField } from "./general/LayerOpacityField";
import { LayerPointFillColorConditionField } from "./point/LayerPointFillColorConditionField";
import { LayerPointFillGradientColorField } from "./point/LayerPointFillGradientColorField";
import { LayerPointVisibilityFilterField } from "./point/LayerPointVisibilityFilterField";

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
    case POINT_VISIBILITY_FILTER_FIELD: {
      component = (
        <LayerPointVisibilityFilterField
          layers={layers}
          atoms={atoms as ComponentAtom<"POINT_VISIBILITY_FILTER_FIELD">["atom"][]}
        />
      );
      break;
    }
    // Tileset
    case TILESET_BUILDING_MODEL_COLOR: {
      component = <BuildingLayerColorSection layers={layers as PrototypeLayerModel[]} />;
      break;
    }
    case TILESET_FILL_COLOR_CONDITION_FIELD: {
      component = (
        <LayerTilesetFillColorConditionField
          layers={layers}
          atoms={atoms as ComponentAtom<"TILESET_FILL_COLOR_CONDITION_FIELD">["atom"][]}
        />
      );
      break;
    }
    case TILESET_FILL_COLOR_GRADIENT_FIELD: {
      component = (
        <LayerTilesetFillGradientColorField
          layers={layers}
          atoms={atoms as ComponentAtom<"TILESET_FILL_COLOR_GRADIENT_FIELD">["atom"][]}
        />
      );
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
