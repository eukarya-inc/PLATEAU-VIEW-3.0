import { useMemo } from "react";

import { ComponentAtom } from "../../view-layers/component";

export const useEvaluateGeneralData = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  // Time
  const generalData: GeneralData = useMemo(
    () => ({
      time: {
        property: "time",
      },
    }),
    [],
  );

  return generalData;
};
