import { useAtom, useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { useCallback, useMemo, type FC, useContext } from "react";
import invariant from "tiny-invariant";

import { useAreaDatasets, useAreas, useDatasets } from "../../../shared/graphql";
import { AreasQuery, DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { AppOverlayLayoutContext, DatasetTreeItem, DatasetTreeView } from "../../ui-components";
import { censusDatasets } from "../constants/censusDatasets";
import { datasetTypeNames } from "../constants/datasetTypeNames";
import { PlateauDatasetType } from "../constants/plateau";
import { getDatasetGroups } from "../utils/datasetGroups";

import { CensusDatasetListItem } from "./CensusDatasetListItem";
import { DatasetFolderList } from "./DatasetFolderList";
import { DatasetListItem, joinPath } from "./DatasetListItem";

const expandedAtom = atomWithReset<string[]>([]);

export const DatasetGroup: FC<{
  groupId: string;
  datasets: DatasetFragmentFragment[];
  folderBy?: "name" | "group";
}> = ({ groupId, datasets, folderBy }) => {
  invariant(datasets.length > 0);

  if (folderBy) {
    return (
      <DatasetTreeItem
        nodeId={groupId}
        label={folderBy === "name" ? datasets[0].type.name : datasets[0].groups?.[0]}
        disabled={!datasets.length}>
        <DatasetFolderList folderId={groupId} datasets={datasets} folderBy={folderBy} />
      </DatasetTreeItem>
    );
  }

  if (datasets.length > 1) {
    return (
      <DatasetTreeItem nodeId={groupId} label={datasets[0].type.name} disabled={!datasets.length}>
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
  } else {
    const dataset = datasets[0];
    const isUsecaseType = dataset.type.code === PlateauDatasetType.UseCase;
    const label = isUsecaseType ? dataset.name : dataset.type.name;
    const title = label;

    return (
      <DatasetListItem
        dataset={dataset}
        municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
        label={label}
        title={title}
      />
    );
  }
};

const GlobalItem: FC<{}> = () => {
  const query = useDatasets({
    includeTypes: ["global"],
  });
  return (
    <DatasetTreeItem nodeId="global" label={datasetTypeNames.global} loading={query.loading}>
      <DatasetFolderList folderId="global" datasets={query.data?.datasets} folderBy={"name"} />
    </DatasetTreeItem>
  );
};

const MunicipalityItem: FC<{
  municipality: AreasQuery["areas"][number];
  parents?: string[];
}> = ({ municipality, parents = [] }) => {
  const query = useAreaDatasets(municipality.code);
  const [standardTypeGroups, genericGroups, dataGroups] = useMemo(
    () => getDatasetGroups(query.data?.area?.datasets),
    [query.data?.area?.datasets],
  );

  if (query.data?.area?.datasets?.length === 1) {
    const dataset = query.data.area?.datasets[0];
    const isUsecaseType = dataset.type.code === PlateauDatasetType.UseCase;
    const titleString = isUsecaseType
      ? dataset.name
      : `${parents.join(" ")} ${municipality.name} ${dataset.type.name}`;
    return (
      <DatasetListItem
        dataset={dataset}
        municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
        label={
          isUsecaseType
            ? joinPath([...parents, dataset.name])
            : joinPath([...parents, municipality.name, dataset.type.name])
        }
        title={titleString}
      />
    );
  }
  return (
    <DatasetTreeItem
      nodeId={municipality.id}
      label={joinPath([...parents, municipality.name])}
      loading={query.loading}
      disabled={!standardTypeGroups?.length && !dataGroups?.length && !genericGroups?.length}>
      {standardTypeGroups?.map(({ groupId, datasets }) => {
        invariant(query.data?.area?.code != null);
        return <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} />;
      })}
      {dataGroups?.map(({ groupId, datasets }) => (
        <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} folderBy="group" />
      ))}
      {genericGroups?.map(({ groupId, datasets }) => (
        <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} folderBy="name" />
      ))}
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

  // Handle the datasets belongs to this perfecture but no municipality
  const prefectureDatasetQuery = useAreaDatasets(prefecture.code);
  const [standardTypeGroups, genericGroups, dataGroups] = useMemo(
    () => getDatasetGroups(prefectureDatasetQuery.data?.area?.datasets?.filter(d => !d.cityCode)),
    [prefectureDatasetQuery.data?.area?.datasets],
  );

  if (areas.length === 1 && !standardTypeGroups && !dataGroups && !genericGroups) {
    return <MunicipalityItem municipality={areas[0]} parents={[prefecture.name]} />;
  }
  return (
    <DatasetTreeItem
      nodeId={prefecture.code}
      label={prefecture.name}
      loading={query.loading}
      disabled={
        !areas.length &&
        !standardTypeGroups?.length &&
        !dataGroups?.length &&
        !genericGroups?.length
      }>
      {areas.map(municipality => (
        <MunicipalityItem key={municipality.code} municipality={municipality} />
      ))}
      {standardTypeGroups?.map(({ groupId, datasets }) => (
        <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} />
      ))}
      {dataGroups?.map(({ groupId, datasets }) => (
        <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} folderBy="group" />
      ))}
      {genericGroups?.map(({ groupId, datasets }) => (
        <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} folderBy="name" />
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
  const { maxMainHeightAtom, searchHeaderHeight } = useContext(AppOverlayLayoutContext);
  const maxMainHeight = useAtomValue(maxMainHeightAtom);

  return (
    <DatasetTreeView
      expanded={expanded}
      onNodeToggle={handleNodeToggle}
      maxheight={maxMainHeight - searchHeaderHeight}>
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
