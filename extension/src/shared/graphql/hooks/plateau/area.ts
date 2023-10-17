import { AREAS, AREA_DATASETS } from "../../base/plateau/queries/area";
import { AreasInput, DatasetsInput } from "../../types/plateau";

import { useQuery } from "./base";

type Options = {
  skip?: boolean;
};

export const useAreas = (input?: AreasInput, options?: Options) => {
  return useQuery(AREAS, {
    variables: {
      input: input ?? {},
    },
    skip: options?.skip,
  });
};

export const useAreaDatasets = (code: string, input?: DatasetsInput, options?: Options) => {
  return useQuery(AREA_DATASETS, {
    variables: {
      code,
      input: input ?? {},
    },
    skip: options?.skip,
  });
};
