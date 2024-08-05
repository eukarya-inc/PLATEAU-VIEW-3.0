import { useMemo } from "react";

import { DatasetFragmentFragment } from "../../shared/graphql/types/catalog";
import { useIsCityProject } from "../../shared/states/environmentVariables";

export const useCityOrPlateauDataset = (dataset: DatasetFragmentFragment | undefined) => {
  const [isCityProject] = useIsCityProject();
  return useMemo(() => !isCityProject || dataset?.type?.code === "city", [dataset, isCityProject]);
};
