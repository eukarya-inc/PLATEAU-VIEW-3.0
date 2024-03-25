import { groupBy } from "lodash-es";
import { FC, useMemo } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";

import { DatasetFolderItem, FolderItem } from "./DatasetFolerItem";
import { DatasetListItem } from "./DatasetListItem";

type DatasetFolderListProps = {
  folderId: string;
  datasets?: DatasetFragmentFragment[];
  level?: number;
  folderBy?: "name" | "group";
};

export const DatasetFolderList: FC<DatasetFolderListProps> = ({
  folderId,
  datasets,
  level = 0,
  folderBy,
}) => {
  const folderList = useMemo(() => {
    const folders: FolderItem[] = [];
    Object.entries(
      groupBy(datasets, d =>
        folderBy === "name" ? d.name.split("/")[level] : d.groups?.[level + 1],
      ),
    ).forEach(([key, value]) => {
      if (key !== "undefined") {
        folders.push({
          label: key,
          subFolderId: `${folderId}:${key}`,
          datasets: value,
          folderDataset:
            value.find(
              v =>
                folderBy === "name" &&
                v.name.split("/")[level + 1] === undefined &&
                v.items.length === 0,
            ) ?? undefined,
          isLastLevel: false,
        });
      } else {
        value.forEach(v => {
          if (v.items.length === 0) return;
          folders.push({
            label: folderBy === "name" ? v.name.split("/").pop() ?? v.name : v.name,
            subFolderId: `${folderId}:${v.id}}`,
            datasets: [v],
            isLastLevel: true,
          });
        });
      }
    });
    return folders;
  }, [folderId, datasets, level, folderBy]);

  return (
    <>
      {Object.values(folderList).map(folder => {
        if (folder.isLastLevel) {
          // const label =
          //   folderBy === "name"
          //     ? folder.datasets[0].name.split("/").pop()
          //     : folder.datasets[0].name;
          return (
            <DatasetListItem
              key={folder.datasets[0].id}
              municipalityCode={
                folder.datasets[0].wardCode ??
                folder.datasets[0].cityCode ??
                folder.datasets[0].prefectureCode
              }
              dataset={folder.datasets[0]}
              label={folder.label}
              title={folder.datasets[0].name}
            />
          );
        } else {
          return (
            <DatasetFolderItem
              key={folder.subFolderId}
              folderItem={folder}
              level={level + 1}
              folderBy={folderBy}
            />
          );
        }
      })}
    </>
  );
};
