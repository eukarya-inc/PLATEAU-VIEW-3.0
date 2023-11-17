import { useAtom } from "jotai";
import { FC, useMemo } from "react";

import { ParameterItem, ParameterList } from "../../../../prototypes/ui-components";
import { TimelineParameterItem } from "../../../../prototypes/ui-components/TimelineParameterItem";
import { TimelineCustomizedField } from "../../../types/fieldComponents/general";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { generateID } from "../../utils";

export interface LayerTimelineCustomizedFieldProps {
  atoms: WritableAtomForComponent<TimelineCustomizedField>[];
}

export const LayerTimelineCustomizedField: FC<LayerTimelineCustomizedFieldProps> = ({ atoms }) => {
  const [component] = useAtom(atoms[0]);
  const id = useMemo(() => component.id ?? generateID(), [component.id]);

  return component.preset ? (
    <ParameterList>
      <ParameterItem label="タイムライン">
        <TimelineParameterItem
          id={id}
          start={component.preset.start}
          current={component.preset.current}
          end={component.preset.end}
          timezone={component.preset.timezone}
        />
      </ParameterItem>
    </ParameterList>
  ) : null;
};
