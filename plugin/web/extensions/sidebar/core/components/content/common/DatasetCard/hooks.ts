import { DataCatalogItem, Group } from "@web/extensions/sidebar/core/types";
import { generateID } from "@web/extensions/sidebar/utils";
import { useCallback } from "react";

import { fieldName } from "./Field/Fields/types";

type FieldDropdownItem = {
  [key: string]: { name: string; onClick: (property: any) => void };
};

export default ({
  dataset,
  inEditor,
  onDatasetUpdate,
}: {
  dataset: DataCatalogItem;
  inEditor?: boolean;
  onDatasetUpdate: (dataset: DataCatalogItem) => void;
}) => {
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
            type: key,
            ...property,
          },
        ],
      });
    };

  const handleFieldUpdate = useCallback(
    (id: string) => (property: any) => {
      if (!inEditor) return;
      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents?.findIndex(c => c.id === id);

      if (!newDatasetComponents || componentIndex === undefined) return;

      newDatasetComponents[componentIndex] = property;

      onDatasetUpdate?.({
        ...dataset,
        components: newDatasetComponents,
      });
    },
    [dataset, inEditor, onDatasetUpdate],
  );

  const handleFieldRemove = useCallback(
    (id: string) => {
      if (!inEditor) return;
      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents?.findIndex(c => c.id === id);

      if (!newDatasetComponents || componentIndex === undefined) return;

      newDatasetComponents.splice(componentIndex, 1);

      onDatasetUpdate?.({
        ...dataset,
        components: newDatasetComponents,
      });
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

  const generalFields: FieldDropdownItem = {
    idealZoom: {
      name: fieldName["idealZoom"],
      onClick: handleFieldAdd({
        position: {
          lng: 0,
          lat: 0,
          height: 0,
          pitch: 0,
          heading: 0,
          roll: 0,
        },
      }),
    },
    description: {
      name: fieldName["description"],
      onClick: handleFieldAdd({}),
    },
    legend: {
      name: fieldName["legend"],
      onClick: handleFieldAdd({
        style: "square",
        items: [{ title: "hey", color: "red" }],
      }),
    },
    switchGroup: {
      name: fieldName["switchGroup"],
      onClick: handleFieldAdd({
        title: "Switch Group",
        groups: dataset.fieldGroups[0]
          ? [{ id: generateID(), title: "新グループ1", fieldGroupID: dataset.fieldGroups[0].id }]
          : [],
      }),
    },
    buttonLink: {
      name: fieldName["buttonLink"],
      onClick: handleFieldAdd({}),
    },
  };

  const pointFields: FieldDropdownItem = {
    pointColor: {
      name: fieldName["pointColor"],
      onClick: handleFieldAdd({}),
    },
    // pointColorGradient: {
    //   name: fieldName["pointColorGradient"],
    //   onClick: ({ key }) => console.log("do something: ", key),
    // },
    pointSize: {
      name: fieldName["pointSize"],
      onClick: handleFieldAdd({}),
    },
    pointIcon: {
      name: fieldName["pointIcon"],
      onClick: handleFieldAdd({
        size: 1,
      }),
    },
    pointLabel: {
      name: fieldName["pointLabel"],
      onClick: handleFieldAdd({}),
    },
    pointModel: {
      name: fieldName["pointModel"],
      onClick: handleFieldAdd({
        scale: 1,
      }),
    },
    pointStroke: {
      name: fieldName["pointStroke"],
      onClick: handleFieldAdd({}),
    },
  };

  //   const polylineFields: {
  //     [key: string]: { name: string; onClick?: (property: any) => void };
  //   } = {
  //     camera: {
  //       name: "カメラ",
  //       onClick: () =>
  //         handleFieldAdd({
  //           position: {
  //             lng: 0,
  //             lat: 0,
  //             height: 0,
  //             pitch: 0,
  //             heading: 0,
  //             roll: 0,
  //           },
  //         }),
  //     },
  //   };

  //   const polygonFields: {
  //     [key: string]: { name: string; onClick?: (property: any) => void };
  //   } = {
  //     camera: {
  //       name: "カメラ",
  //       onClick: () =>
  //         handleFieldAdd({
  //           position: {
  //             lng: 0,
  //             lat: 0,
  //             height: 0,
  //             pitch: 0,
  //             heading: 0,
  //             roll: 0,
  //           },
  //         }),
  //     },
  //   };

  const ThreeDModelFields: FieldDropdownItem = {
    clipping: {
      name: fieldName["clipping"],
      onClick: handleFieldAdd({
        enabled: false,
        show: false,
        aboveGroundOnly: false,
        direction: "inside",
      }),
    },
  };

  //   const ThreeDTileFields: {
  //     [key: string]: { name: string; onClick?: (property: any) => void };
  //   } = {
  //     camera: {
  //       name: "カメラ",
  //       onClick: () =>
  //         handleFieldAdd({
  //           position: {
  //             lng: 0,
  //             lat: 0,
  //             height: 0,
  //             pitch: 0,
  //             heading: 0,
  //             roll: 0,
  //           },
  //         }),
  //     },
  //   };

  const filterFields = (fields: {
    [key: string]: {
      name: string;
      onClick: (property: any) => void;
    };
  }) =>
    Object.keys(fields)
      .filter(fieldKey => !dataset.components?.find(c => c.type === fieldKey))
      .reduce(
        (
          obj: {
            [key: string]: {
              name: string;
              onClick: (property: any) => void;
            };
          },
          key,
        ) => {
          obj[key] = fields[key];
          return obj;
        },
        {},
      );

  const fieldComponentsList: {
    [key: string]: {
      name: string;
      fields: { [key: string]: { name: string; onClick?: (property: any) => void } };
    };
  } = {
    general: {
      name: "一般",
      fields: filterFields(generalFields),
    },
    point: {
      name: "ポイント",
      fields: filterFields(pointFields),
    },
    // polyline: { name: "ポリライン", fields: polylineFields },
    // polygone: { name: "ポリゴン", fields: polygonFields },
    "3d-model": { name: "3Dモデル", fields: ThreeDModelFields },
    // "3d-tile": { name: "3Dタイル", fields: ThreeDTileFields },
  };
  return {
    fieldComponentsList,
    handleFieldUpdate,
    handleFieldRemove,
    handleGroupsUpdate,
  };
};
