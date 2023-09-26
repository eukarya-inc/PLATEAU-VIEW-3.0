import { type FC } from "react";

import {
  formatPercent,
  ParameterList,
  SliderParameterItem,
} from "../../../../prototypes/ui-components";
import { WritableAtomForComponent } from "../../../view-layers/component";

export interface LayerOpacityFieldProps {
  atoms: WritableAtomForComponent<number>[];
}

export const LayerOpacityField: FC<LayerOpacityFieldProps> = ({ atoms }) => {
  if (atoms.length === 0) {
    return null;
  }
  return (
    <ParameterList>
      <SliderParameterItem label="不透明度" atom={atoms} min={0} max={1} format={formatPercent} />
    </ParameterList>
  );
};
