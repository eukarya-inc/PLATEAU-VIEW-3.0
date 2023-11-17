import { useAtom } from "jotai";

import { TimelineCustomizedField } from "../../../types/fieldComponents/general";
import { WritableAtomForComponent } from "../../../view-layers/component";

export interface LayerTimelineCustomizedFieldProps {
  atoms: WritableAtomForComponent<TimelineCustomizedField>[];
}

export const LayerTimelineCustomizedField: FC<LayerTimelineCustomizedFieldProps> = ({ atoms }) => {
  const [component, setComponent] = useAtom(atoms[0]);
  return <></>;
};
