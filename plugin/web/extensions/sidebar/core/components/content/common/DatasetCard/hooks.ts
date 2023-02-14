import { Data, Group } from "@web/extensions/sidebar/core/newTypes";
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
  dataset: Data;
  inEditor?: boolean;
  onDatasetUpdate: (dataset: Data) => void;
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
            type: key,
            ...property,
          },
        ],
      });
    };

  const handleFieldUpdate = useCallback(
    (property: any) => {
      if (!inEditor) return;
      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents?.findIndex(c => c.type === property.type);

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
    (type: string) => {
      if (!inEditor) return;
      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents?.findIndex(c => c.type === type);

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
    (field: string) => (groups: Group[], selectedGroup?: string) => {
      if (!inEditor) return;

      const newDatasetComponents = dataset.components ? [...dataset.components] : [];
      const componentIndex = newDatasetComponents.findIndex(c => c.type === field);

      if (newDatasetComponents.length > 0 && componentIndex !== undefined) {
        newDatasetComponents[componentIndex].group = selectedGroup;
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
    camera: {
      name: fieldName["camera"],
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
        groups: [],
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
    // pointLabel: {
    //   name: fieldName["pointLabel"],
    //   onClick: ({ key }) => console.log("do something: ", key),
    // },
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

  //   const ThreeDModelFields: {
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

  const fieldGroups: {
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
    // "3d-model": { name: "3Dモデル", fields: ThreeDModelFields },
    // "3d-tile": { name: "3Dタイル", fields: ThreeDTileFields },
  };
  return {
    fieldGroups,
    handleFieldUpdate,
    handleFieldRemove,
    handleGroupsUpdate,
  };
};
