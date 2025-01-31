import { useEffect, useMemo } from "react";

import { usePlateauSpecs } from "../../shared/graphql";
import { loadAttributes } from "../../shared/plateau";
import { useDatasetAttributesURL } from "../../shared/states/environmentVariables";

export const useSetupDatasetAttributes = () => {
  const [datasetAttributesURL] = useDatasetAttributesURL();
  const { data } = usePlateauSpecs();
  const versions = useMemo(() => data?.plateauSpecs.map(p => p.majorVersion), [data]);
  useEffect(() => {
    if (!datasetAttributesURL || !versions) return;
    loadAttributes(datasetAttributesURL, versions);
  }, [datasetAttributesURL, versions]);
};
