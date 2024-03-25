import { groupBy } from "lodash-es";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { isGenericDatasetType } from "../constants/generic";

export function getDatasetGroups(datasets: DatasetFragmentFragment[] | undefined) {
  if (!datasets) return [undefined, undefined, undefined];

  // For data groups we don't have the order value
  // Hard code the groups between standard type groups and generic type groups
  // Therefore we need to handle them separately
  const standardTypeDatasets = datasets?.filter(
    d => !(d.groups && d.groups.length > 0) && !isGenericDatasetType(d.type.code),
  );
  const standardTypeGroups = standardTypeDatasets
    ? Object.entries(groupBy(standardTypeDatasets, d => d.type.name)).map(([key, value]) => ({
        type: key,
        groupId: key + value.map(({ id }) => id).join(":"),
        datasets: value,
        isGrouped: false,
      }))
    : undefined;

  const dataGroupDatasets = datasets?.filter(d => d.groups && d.groups.length > 0);
  const dataGroups = dataGroupDatasets
    ? Object.entries(groupBy(dataGroupDatasets, d => d.groups?.[0])).map(([key, value]) => ({
        type: key,
        groupId: key + value.map(({ id }) => id).join(":"),
        datasets: value,
        isGrouped: true,
      }))
    : undefined;

  const genericDatasets = datasets?.filter(
    d => !(d.groups && d.groups.length > 0) && isGenericDatasetType(d.type.code),
  );
  const genericGroups = genericDatasets
    ? Object.entries(groupBy(genericDatasets, d => d.type.name)).map(([key, value]) => ({
        type: key,
        groupId: key + value.map(({ id }) => id).join(":"),
        datasets: value,
        isGrouped: false,
      }))
    : undefined;

  return [standardTypeGroups, genericGroups, dataGroups];
}
