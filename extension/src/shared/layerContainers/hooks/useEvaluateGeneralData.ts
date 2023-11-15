import { useMemo } from "react";

import { useOptionalAtomValue } from "../../hooks";
import { GeneralData } from "../../reearth/layers";
import { APPLY_TIME_VALUE_FIELD } from "../../types/fieldComponents/general";
import { ComponentAtom } from "../../view-layers/component";
import { useFindComponent } from "../../view-layers/hooks";

export const useEvaluateGeneralData = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  // Time
  const timeProperty = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], APPLY_TIME_VALUE_FIELD),
  );

  const generalData: GeneralData = useMemo(
    () => ({
      ...(timeProperty?.preset?.propertyName
        ? { time: { property: timeProperty.preset.propertyName } }
        : {}),
    }),
    [timeProperty],
  );

  return generalData;
};
