import { type FC } from "react";

import { PolygonVisibilityFilterField } from "../../../types/fieldComponents/polygon";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { LayerVisibilityFilterField } from "../common/LayerPolygonVisibilityFilterField";

export interface LayerPolygonVisibilityFilterFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<PolygonVisibilityFilterField>[];
}

export const LayerPolygonVisibilityFilterField: FC<LayerPolygonVisibilityFilterFieldProps> = ({
  layers,
  atoms,
}) => {
  return <LayerVisibilityFilterField layers={layers} atoms={atoms} />;
};
