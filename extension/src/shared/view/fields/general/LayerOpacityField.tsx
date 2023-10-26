import { atom } from "jotai";
import { useMemo, type FC } from "react";

import {
  formatPercent,
  ParameterList,
  SliderParameterItem,
} from "../../../../prototypes/ui-components";
import { OpacityField } from "../../../types/fieldComponents/general";
import { WritableAtomForComponent } from "../../../view-layers/component";

export interface LayerOpacityFieldProps {
  atoms: WritableAtomForComponent<OpacityField>[];
}

export const LayerOpacityField: FC<LayerOpacityFieldProps> = ({ atoms }) => {
  const wrappedAtoms: [WritableAtomForComponent<number>] = useMemo(
    () => [
      atom(
        get => (atoms[0] ? get(atoms[0]).value : 1),
        (get, set, update: number) => {
          if (!atoms[0]) {
            return;
          }
          set(atoms[0], { ...get(atoms[0]), value: update });
        },
      ),
    ],
    [atoms],
  );

  if (atoms.length === 0) {
    return null;
  }

  return (
    <ParameterList>
      <SliderParameterItem
        label="不透明度"
        atom={wrappedAtoms}
        min={0}
        max={1}
        format={formatPercent}
      />
    </ParameterList>
  );
};
