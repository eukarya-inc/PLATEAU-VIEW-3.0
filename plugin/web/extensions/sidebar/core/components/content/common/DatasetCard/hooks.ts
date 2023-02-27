import { DataCatalogItem, Group, Template } from "@web/extensions/sidebar/core/types";
import { generateID } from "@web/extensions/sidebar/utils";
import { useCallback, useMemo, useState } from "react";

import generateFieldComponentsList from "./Field/fieldHooks";

export default ({
  dataset,
  templates,
  inEditor,
  onDatasetUpdate,
}: {
  dataset: DataCatalogItem;
  templates?: Template[];
  inEditor?: boolean;
  onDatasetUpdate: (dataset: DataCatalogItem, cleanseOverride?: any) => void;
}) => {
  const [selectedGroup, setGroup] = useState<string>();

  const handleCurrentGroupChange = useCallback((fieldGroupID: string) => {
    setGroup(fieldGroupID);
  }, []);

  const activeComponentIDs = useMemo(
    () =>
      (!dataset.components?.find(c => c.type === "switchGroup") || !dataset.fieldGroups
        ? dataset.components
        : dataset.components.filter(
            c => (c.group && c.group === selectedGroup) || c.type === "switchGroup",
          )
      )
        ?.filter(c => !(!dataset.config?.data && c.type === "switchDataset"))
        ?.map(c => c.id),
    [selectedGroup, dataset.components, dataset.fieldGroups, dataset.config?.data],
  );

  const handleFieldAdd =
    (property: any) =>
    ({ key }: { key: string }) => {
      if (!inEditor) return;
      onDatasetUpdate?.({
        ...dataset,
        components: [
          ...(dataset.components ?? []),
          {
            id: generateID(),
            type: key.includes("template") ? "template" : key,
            ...property,
          },
        ],
      });
    };

  const handleFieldUpdate = useCallback(
    (id: string) => (property: any) => {
      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents?.findIndex(c => c.id === id);

      if (!newDatasetComponents || componentIndex === undefined) return;

      newDatasetComponents[componentIndex] = property;

      onDatasetUpdate?.({
        ...dataset,
        components: newDatasetComponents,
      });
    },
    [dataset, onDatasetUpdate],
  );

  const handleFieldRemove = useCallback(
    (id: string) => {
      if (!inEditor) return;
      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents?.findIndex(c => c.id === id);

      if (!newDatasetComponents || componentIndex === undefined) return;

      const removedDataset = newDatasetComponents.splice(componentIndex, 1)[0];

      onDatasetUpdate?.(
        {
          ...dataset,
          components: newDatasetComponents,
        },
        removedDataset.cleanseOverride,
      );
    },
    [dataset, inEditor, onDatasetUpdate],
  );

  const handleGroupsUpdate = useCallback(
    (fieldID: string) => (groups: Group[], selectedGroupID?: string) => {
      if (!inEditor) return;

      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents.findIndex(c => c.id === fieldID);

      if (newDatasetComponents.length > 0 && componentIndex !== undefined) {
        newDatasetComponents[componentIndex].group = selectedGroupID;
      }

      onDatasetUpdate?.({
        ...dataset,
        components: newDatasetComponents,
        fieldGroups: groups,
      });
    },
    [dataset, inEditor, onDatasetUpdate],
  );

  const fieldComponentsList = generateFieldComponentsList({
    fieldGroups: dataset.fieldGroups,
    templates,
    onFieldAdd: handleFieldAdd,
  });

  return {
    activeComponentIDs,
    fieldComponentsList,
    handleFieldUpdate,
    handleFieldRemove,
    handleCurrentGroupChange,
    handleGroupsUpdate,
  };
};
