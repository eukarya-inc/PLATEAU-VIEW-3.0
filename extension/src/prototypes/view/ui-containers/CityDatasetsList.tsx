import { groupBy } from "lodash-es";
import { FC, useMemo } from "react";
import invariant from "tiny-invariant";

import { CITY_CODE } from "../../../shared/constants";
import { useDatasets } from "../../../shared/graphql";
import { DatasetTreeView } from "../../ui-components";

import { DatasetGroup } from "./DatasetGroup";

export const CityDatasetsList: FC = () => {
  const query = useDatasets({ areaCodes: [CITY_CODE] });

  const groups = useMemo(
    () =>
      query.data?.datasets != null
        ? Object.entries(groupBy(query.data.datasets, d => d.type.name)).map(([key, value]) => ({
            label: key,
            groupId: value.map(({ id }) => id).join(":"),
            datasets: value.sort((a, b) => a.type.order - b.type.order),
          }))
        : undefined,
    [query.data?.datasets],
  );
  return (
    <DatasetTreeView>
      {groups?.map(groupItem => {
        invariant(query.data?.datasets != null);
        return <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />;
      })}
    </DatasetTreeView>
  );
};
