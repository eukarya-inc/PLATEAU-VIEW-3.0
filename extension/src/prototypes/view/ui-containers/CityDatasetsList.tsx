import { FC, useMemo } from "react";

import { useDatasets } from "../../../shared/graphql";
import { useCityCode } from "../../../shared/states/environmentVariables";
import { DatasetTreeView } from "../../ui-components";
import { getDatasetGroups } from "../utils/datasetGroups";

import { DatasetGroup } from "./DatasetGroup";

export const CityDatasetsList: FC = () => {
  const [cityCode] = useCityCode();
  const query = useDatasets({ areaCodes: [cityCode] });

  const { typicalTypeGroups, dataGroups, cityDatasetGroups, genericGroups } = useMemo(
    () =>
      getDatasetGroups({
        datasets: query.data?.datasets,
        cityCode,
      }),
    [query.data?.datasets, cityCode],
  );

  return (
    <DatasetTreeView>
      {typicalTypeGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
      {dataGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
      {genericGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
      {cityDatasetGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
    </DatasetTreeView>
  );
};
