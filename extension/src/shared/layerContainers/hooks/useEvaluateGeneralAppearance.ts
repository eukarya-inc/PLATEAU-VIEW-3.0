import { useMemo } from "react";

import { useOptionalAtomValue } from "../../hooks";
import { GeneralAppearances } from "../../reearth/layers";
import { POINT_COLOR_FIELD, POINT_SIZE_FIELD } from "../../types/fieldComponents/point";
import { ComponentAtom } from "../../view-layers/component";
import { useFindComponent } from "../../view-layers/hooks";

export const useEvaluateGeneralAppearance = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  const pointColor = useOptionalAtomValue(
    useFindComponent<typeof POINT_COLOR_FIELD>(componentAtoms ?? [], POINT_COLOR_FIELD),
  );
  const pointSize = useOptionalAtomValue(
    useFindComponent<typeof POINT_SIZE_FIELD>(componentAtoms ?? [], POINT_SIZE_FIELD),
  );

  const generalAppearances: GeneralAppearances = useMemo(
    () => ({
      marker: {
        // TODO: Use component for style
        style: pointColor || pointSize ? "point" : undefined,
        pointColor: pointColor?.value,
        pointSize: pointSize?.value,
      },
    }),
    [pointColor, pointSize],
  );

  return generalAppearances;
};
