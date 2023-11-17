import { useAtom } from "jotai";
import { FC, useMemo } from "react";

import { ParameterItem, ParameterList } from "../../../../prototypes/ui-components";
import { TimelineParameterItem } from "../../../../prototypes/ui-components/TimelineParameterItem";
import { TimelineMonthField } from "../../../types/fieldComponents/general";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { generateID } from "../../utils";

export interface LayerTimelineMonthFieldProps {
  atoms: WritableAtomForComponent<TimelineMonthField>[];
}

export const LayerTimelineMonthField: FC<LayerTimelineMonthFieldProps> = ({ atoms }) => {
  const [component] = useAtom(atoms[0]);

  const timezone = useMemo(() => {
    const offset = new Date().getTimezoneOffset() / -60;
    return offset > 0 ? `+${offset}` : `${offset}`;
  }, []);

  const end = useMemo(() => new Date().toISOString(), []);
  const start = useMemo(() => {
    const date = new Date(end);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString();
  }, [end]);

  const id = useMemo(() => component.id ?? generateID(), [component.id]);

  return (
    <ParameterList>
      <ParameterItem label="タイムライン">
        {!!start && !!end && !!timezone && (
          <TimelineParameterItem
            id={id}
            start={start}
            current={start}
            end={end}
            timezone={timezone}
          />
        )}
      </ParameterItem>
    </ParameterList>
  );
};
