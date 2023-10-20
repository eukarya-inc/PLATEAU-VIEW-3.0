import { DatasetFragmentFragment, DatasetsInput } from "../../base/catalog/__gen__/graphql";
import { DATASETS, DATASET_BY_ID } from "../../base/catalog/queries/dataset";

import { useLazyQuery, useQuery } from "./base";

type Options = {
  skip?: boolean;
};

export const useDatasets = (input: DatasetsInput, options?: Options) => {
  return useQuery(DATASETS, {
    variables: {
      input,
    },
    skip: options?.skip,
  });
};

export const useLazyDatasets = (input: DatasetsInput, options?: Options) => {
  return useLazyQuery(DATASETS, {
    variables: {
      input,
    },
    skip: options?.skip,
  });
};

export const useDatasetById = (id: string, options?: Options) => {
  const query = useQuery(DATASET_BY_ID, {
    variables: {
      id,
    },
    skip: options?.skip,
  });

  return {
    ...query,
    data: {
      ...query.data,
      node: query.data?.node as DatasetFragmentFragment,
    },
  };
};
