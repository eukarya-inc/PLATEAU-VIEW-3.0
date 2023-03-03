import { DataCatalogItem, Group, Template } from "@web/extensions/sidebar/core/types";
import { generateID } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { mergeOverrides } from "../../../hooks";

import generateFieldComponentsList, { cleanseOverrides } from "./Field/fieldHooks";

export default ({
  dataset,
  inEditor,
  templates,
  onDatasetUpdate,
  onOverride,
}: {
  dataset: DataCatalogItem;
  inEditor?: boolean;
  templates?: Template[];
  onDatasetUpdate: (dataset: DataCatalogItem, cleanseOverride?: any) => void;
  onOverride?: (dataID: string, activeIDs?: string[]) => void;
}) => {
  const [selectedGroup, setGroup] = useState<string>();
  const [activeComponentIDs, setActiveIDs] = useState<string[] | undefined>();

  useEffect(() => {
    const newActiveIDs = selectedGroup
      ? (!dataset.components?.find(c => c.type === "switchGroup") || !dataset.fieldGroups
          ? dataset.components
          : dataset.components.filter(
              c => (c.group && c.group === selectedGroup) || c.type === "switchGroup",
            )
        )
          ?.filter(c => !(!dataset.config?.data && c.type === "switchDataset"))
          ?.map(c => c.id)
      : dataset.components?.map(c => c.id);

    if (newActiveIDs !== activeComponentIDs) {
      setActiveIDs(newActiveIDs);
    }
  }, [selectedGroup, dataset.components]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeComponentIDs) {
      onOverride?.(dataset.dataID, activeComponentIDs);
    }
  }, [activeComponentIDs]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCurrentGroupUpdate = useCallback((fieldGroupID?: string) => {
    setGroup(fieldGroupID);
  }, []);

  const handleFieldAdd =
    (property: any) =>
    ({ key }: { key: string }) => {
      if (!inEditor) return;
      const newField = {
        id: generateID(),
        type: key,
        ...property,
      };

      onDatasetUpdate?.({
        ...dataset,
        components: [...(dataset.components ?? []), newField],
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

      const removedComponent = newDatasetComponents.splice(componentIndex, 1)[0];

      if (removedComponent.type === "switchGroup") {
        handleCurrentGroupUpdate(undefined);
      }

      let cleanseOverride: any = undefined;
      if (removedComponent.type === "template") {
        cleanseOverride = mergeOverrides(
          "cleanse",
          templates?.find(t => t.id === removedComponent.templateID)?.components,
        );
      } else {
        cleanseOverride = cleanseOverrides[removedComponent.type] ?? undefined;
      }

      onDatasetUpdate?.(
        {
          ...dataset,
          components: newDatasetComponents,
        },
        cleanseOverride,
      );
    },
    [dataset, inEditor, templates, onDatasetUpdate, handleCurrentGroupUpdate],
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
    onFieldAdd: handleFieldAdd,
  });

  return {
    activeComponentIDs,
    fieldComponentsList,
    handleFieldUpdate,
    handleFieldRemove,
    handleCurrentGroupUpdate,
    handleGroupsUpdate,
  };
};
