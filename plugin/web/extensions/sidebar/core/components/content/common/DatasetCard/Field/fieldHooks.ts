import { Group } from "@web/extensions/sidebar/core/types";
import { generateID } from "@web/extensions/sidebar/utils";

import { fieldName } from "./Fields/types";

type FieldDropdownItem = {
  [key: string]: { name: string; onClick: (property: any) => void };
};

export default ({
  fieldGroups,
  onFieldAdd,
}: {
  fieldGroups?: Group[];
  onFieldAdd: (property: any) => ({ key }: { key: string }) => void;
}) => {
  const generalFields: FieldDropdownItem = {
    idealZoom: {
      name: fieldName["idealZoom"],
      onClick: onFieldAdd({
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
      onClick: onFieldAdd({}),
    },
    legend: {
      name: fieldName["legend"],
      onClick: onFieldAdd({
        style: "square",
        items: [{ title: "hey", color: "red" }],
      }),
    },
    realtime: {
      name: fieldName["realtime"],
      onClick: onFieldAdd({ updateInterval: 30 }),
    },
    styleCode: {
      name: fieldName["styleCode"],
      onClick: onFieldAdd({ src: " " }),
    },
    switchGroup: {
      name: fieldName["switchGroup"],
      onClick: onFieldAdd({
        title: "Switch Group",
        groups: fieldGroups?.[0]
          ? [{ id: generateID(), title: "新グループ1", fieldGroupID: fieldGroups[0].id }]
          : [],
      }),
    },
    buttonLink: {
      name: fieldName["buttonLink"],
      onClick: onFieldAdd({}),
    },
  };

  const pointFields: FieldDropdownItem = {
    pointColor: {
      name: fieldName["pointColor"],
      onClick: onFieldAdd({}),
    },
    // pointColorGradient: {
    //   name: fieldName["pointColorGradient"],
    //   onClick: ({ key }) => console.log("do something: ", key),
    // },
    pointSize: {
      name: fieldName["pointSize"],
      onClick: onFieldAdd({}),
    },
    pointIcon: {
      name: fieldName["pointIcon"],
      onClick: onFieldAdd({
        size: 1,
      }),
    },
    pointLabel: {
      name: fieldName["pointLabel"],
      onClick: onFieldAdd({}),
    },
    pointModel: {
      name: fieldName["pointModel"],
      onClick: onFieldAdd({
        scale: 1,
      }),
    },
    pointStroke: {
      name: fieldName["pointStroke"],
      onClick: onFieldAdd({}),
    },
  };

  const polylineFields = {
    polylineColor: {
      name: fieldName["polylineColor"],
      onClick: onFieldAdd({}),
    },
    // polylineColorGradient: {
    //   name: fieldName["polylineColorGradient"],
    //   onClick: onFieldAdd({}),
    // },
    polylineStrokeWeight: {
      name: fieldName["polylineStrokeWeight"],
      onClick: onFieldAdd({}),
    },
  };

  const polygonFields: {
    [key: string]: { name: string; onClick?: (property: any) => void };
  } = {
    polygonColor: {
      name: fieldName["polygonColor"],
      onClick: onFieldAdd({}),
    },
    // polygonColorGradient: {
    //   name: fieldName["polygonColorGradient"],
    //   onClick: ({ key }) => console.log("do something: ", key),
    // },
    polygonStroke: {
      name: fieldName["polygonStroke"],
      onClick: onFieldAdd({}),
    },
  };

  const ThreeDModelFields: FieldDropdownItem = {
    buildingColor: {
      name: fieldName["buildingColor"],
      onClick: onFieldAdd({
        colorType: "none",
      }),
    },
    buildingFilter: {
      name: fieldName["buildingFilter"],
      onClick: onFieldAdd({
        height: [0, 200],
        abovegroundFloor: [1, 50],
        basementFloor: [0, 5],
      }),
    },
    buildingShadow: {
      name: fieldName["buildingShadow"],
      onClick: onFieldAdd({
        shadow: "disabled",
      }),
    },
    buildingTransparency: {
      name: fieldName["buildingTransparency"],
      onClick: onFieldAdd({
        transparency: 100,
      }),
    },
    clipping: {
      name: fieldName["clipping"],
      onClick: onFieldAdd({
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
  //         onFieldAdd({
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

  const fieldComponentsList: {
    [key: string]: {
      name: string;
      fields: { [key: string]: { name: string; onClick?: (property: any) => void } };
    };
  } = {
    general: {
      name: "一般",
      fields: generalFields,
    },
    point: {
      name: "ポイント",
      fields: pointFields,
    },
    polygone: { name: "ポリゴン", fields: polygonFields },
    polyline: { name: "ポリライン", fields: polylineFields },
    "3d-model": { name: "3Dモデル", fields: ThreeDModelFields },
    // "3d-tile": { name: "3Dタイル", fields: ThreeDTileFields },
  };

  return fieldComponentsList;
};
