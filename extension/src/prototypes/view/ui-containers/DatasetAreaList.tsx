import { useAtom, useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { groupBy } from "lodash";
import { useCallback, useMemo, type FC, useContext } from "react";
import invariant from "tiny-invariant";

import { useAreaDatasets, useAreas, useDatasets } from "../../../shared/graphql";
import { AreasQuery, DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { AppOverlayLayoutContext, DatasetTreeItem, DatasetTreeView } from "../../ui-components";
import { censusDatasets } from "../constants/censusDatasets";
import { datasetTypeNames } from "../constants/datasetTypeNames";

import { CensusDatasetListItem } from "./CensusDatasetListItem";
import { DatasetListItem, joinPath } from "./DatasetListItem";

const expandedAtom = atomWithReset<string[]>([]);

export const DatasetGroup: FC<{
  groupId: string;
  datasets: DatasetFragmentFragment[];
}> = ({ groupId, datasets }) => {
  invariant(datasets.length > 0);
  if (datasets.length > 1) {
    return (
      <DatasetTreeItem nodeId={groupId} label={datasets[0].type.name}>
        {datasets.map(dataset => (
          <DatasetListItem
            key={dataset.id}
            municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
            dataset={dataset}
            label={dataset.name}
            title={dataset.name}
          />
        ))}
      </DatasetTreeItem>
    );
  }
  return (
    <DatasetListItem
      dataset={datasets[0]}
      municipalityCode={datasets[0].wardCode ?? datasets[0].cityCode ?? datasets[0].prefectureCode}
      label={datasets[0].type.name}
      title={datasets[0].type.name}
    />
  );
};

const GlobalItem: FC<{}> = () => {
  const query = useDatasets({
    includeTypes: ["global"],
  });
  return (
    <DatasetTreeItem nodeId="global" label={datasetTypeNames.global} loading={query.loading}>
      {query.data?.datasets?.map(dataset => (
        <DatasetListItem
          key={dataset.id}
          dataset={dataset}
          municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
          label={dataset.name}
          title={dataset.name}
        />
      ))}
    </DatasetTreeItem>
  );
};

const MunicipalityItem: FC<{
  municipality: AreasQuery["areas"][number];
  parents?: string[];
}> = ({ municipality, parents = [] }) => {
  const query = useAreaDatasets(municipality.code);
  const groups = useMemo(
    () =>
      query.data?.area?.datasets != null
        ? Object.entries(groupBy(query.data.area.datasets, d => d.type.name))
            .map(([, value]) => value)
            .map(value => ({
              groupId: value.map(({ id }) => id).join(":"),
              datasets: value.sort((a, b) => a.type.order - b.type.order),
            }))
        : undefined,
    [query.data?.area?.datasets],
  );
  if (query.data?.area?.datasets?.length === 1) {
    const dataset = query.data.area?.datasets[0];
    return (
      <DatasetListItem
        dataset={dataset}
        municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
        label={joinPath([...parents, municipality.name, dataset.type.name])}
      />
    );
  }
  return (
    <DatasetTreeItem
      nodeId={municipality.id}
      label={joinPath([...parents, municipality.name])}
      loading={query.loading}>
      {groups?.map(({ groupId, datasets }) => {
        invariant(query.data?.area?.code != null);
        return <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} />;
      })}
    </DatasetTreeItem>
  );
};

const PrefectureItem: FC<{
  prefecture: AreasQuery["areas"][number];
}> = ({ prefecture }) => {
  const query = useAreas({
    parentCode: prefecture.code,
  });
  const areas = useMemo(() => query.data?.areas.filter(a => a.code.length !== 2) ?? [], [query]);
  if (areas.length === 1) {
    return <MunicipalityItem municipality={areas[0]} parents={[prefecture.name]} />;
  }
  return (
    <DatasetTreeItem nodeId={prefecture.code} label={prefecture.name} loading={query.loading}>
      {areas.map(municipality => (
        <MunicipalityItem key={municipality.code} municipality={municipality} />
      ))}
    </DatasetTreeItem>
  );
};

const RegionalMeshItem: FC = () => {
  return (
    <DatasetTreeItem nodeId="RegionalMesh" label="地域メッシュ">
      {censusDatasets.map(dataset => (
        <DatasetTreeItem
          key={dataset.name}
          nodeId={`RegionalMesh:${dataset.name}`}
          label={dataset.name}>
          {dataset.data.map(data => (
            <CensusDatasetListItem key={data.name} dataset={dataset} data={data} />
          ))}
        </DatasetTreeItem>
      ))}
    </DatasetTreeItem>
  );
};

export const DatasetAreaList: FC = () => {
  const query = useAreas({ includeParents: true });
  const [expanded, setExpanded] = useAtom(expandedAtom);
  const handleNodeToggle = useCallback(
    (_event: unknown, nodeIds: string[]) => {
      setExpanded(nodeIds);
    },
    [setExpanded],
  );
  const { gridHeightAtom, searchHeaderHeight } = useContext(AppOverlayLayoutContext);
  const gridHeight = useAtomValue(gridHeightAtom);

  return (
    <DatasetTreeView
      expanded={expanded}
      onNodeToggle={handleNodeToggle}
      maxheight={gridHeight - searchHeaderHeight}>
      <RegionalMeshItem />
      <GlobalItem />
      {query.data?.areas.map(
        prefecture =>
          prefecture.__typename === "Prefecture" && (
            <PrefectureItem key={prefecture.code} prefecture={prefecture} />
          ),
      )}
    </DatasetTreeView>
  );
};
