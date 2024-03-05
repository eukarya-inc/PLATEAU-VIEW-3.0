import { groupBy } from "lodash-es";
import { FC, useMemo } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { DatasetTreeItem } from "../../ui-components";

import { DatasetListItem } from "./DatasetListItem";

type FolderItem = {
  label: string;
  subFolderId: string;
  datasets: DatasetFragmentFragment[];
};

type DatasetFolderListProps = {
  folderId: string;
  datasets?: DatasetFragmentFragment[];
  level?: number;
};

export const DatasetFolderList: FC<DatasetFolderListProps> = ({
  folderId,
  datasets,
  level = 0,
}) => {
  const subFolders = useMemo(() => {
    const folders: FolderItem[] = [];
    Object.entries(groupBy(datasets, d => d.name.split("/")[level])).forEach(([key, value]) => {
      if (key !== "undefined") {
        folders.push({
          label: key,
          subFolderId: `${folderId}:${key}${value.length === 1 ? `:${value[0].id}` : ""}`,
          datasets: value.sort((a, b) => a.type.order - b.type.order),
        });
      } else {
        value.forEach((v, index) => {
          folders.push({
            label: `${index}`,
            subFolderId: `${folderId}:${v.id}}`,
            datasets: [v],
          });
        });
      }
    });
    return folders;
  }, [folderId, datasets, level]);

  return (
    <>
      {Object.entries(subFolders).map(([key, value]) => {
        if (value.datasets.length === 1) {
          const label = value.datasets[0].name.split("/").pop();
          return (
            <DatasetListItem
              key={value.datasets[0].id}
              municipalityCode={
                value.datasets[0].wardCode ??
                value.datasets[0].cityCode ??
                value.datasets[0].prefectureCode
              }
              dataset={value.datasets[0]}
              label={label}
              title={value.datasets[0].name}
            />
          );
        } else {
          return (
            <DatasetTreeItem
              key={key}
              nodeId={value.subFolderId}
              label={value.label}
              title={value.label}
              disabled={!value.datasets.length}>
              <DatasetFolderList
                folderId={value.subFolderId}
                datasets={value.datasets}
                level={level + 1}
              />
            </DatasetTreeItem>
          );
        }
      })}
    </>
  );
};
