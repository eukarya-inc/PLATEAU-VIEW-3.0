import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useAtom } from "jotai";
import { useMemo, type FC, useCallback, ChangeEventHandler } from "react";

import { ParameterItem, ParameterList } from "../../../../prototypes/ui-components";
import { PointVisibilityFilterField } from "../../../types/fieldComponents/point";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";

export interface LayerPointVisibilityFilterFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<PointVisibilityFilterField>[];
}

export const LayerPointVisibilityFilterField: FC<LayerPointVisibilityFilterFieldProps> = ({
  atoms,
}) => {
  const [component, setComponent] = useAtom(atoms[0]);

  const items: [id: string, label: string][] = useMemo(
    () =>
      component.preset?.rules?.map(
        r => [r.id, r.legendName || r.propertyName] as [id: string, label: string],
      ) ?? [],
    [component],
  );

  const overriddenRuleId = component.value;
  const currentRuleId = overriddenRuleId || items[0][0];

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setComponent({ ...component, value: e.target.value });
    },
    [component, setComponent],
  );

  return (
    <ParameterList>
      <ParameterItem label="表示の切り替え">
        <RadioGroup value={currentRuleId} onChange={handleChange}>
          {items.map(item => (
            <FormControlLabel
              key={item[0]}
              value={item[0]}
              control={<Radio size="small" />}
              label={item[1]}
            />
          ))}
        </RadioGroup>
      </ParameterItem>
    </ParameterList>
  );
};
