import { Group, Template } from "@web/extensions/sidebar/core/types";
import { generateID } from "@web/extensions/sidebar/utils";
import { useMemo } from "react";

import { fieldName } from "./Fields/types";

type FieldDropdownItem = {
  [key: string]: { name: string; onClick: (property: any) => void };
};

export default ({
  fieldGroups,
  templates,
  onFieldAdd,
}: {
  fieldGroups?: Group[];
  templates?: Template[];
  onFieldAdd: (property: any) => ({ key }: { key: string }) => void;
}) => {
  const generalFields: FieldDropdownItem = useMemo(() => {
    return {
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
          items: [{ title: "新しいアイテム", color: "#00bebe" }],
        }),
      },
      realtime: {
        name: fieldName["realtime"],
        onClick: onFieldAdd({ updateInterval: 30 }),
      },
      timeline: {
        name: fieldName["timeline"],
        onClick: onFieldAdd({ timeBasedDisplay: true, timeFieldName: "" }),
      },
      styleCode: {
        name: fieldName["styleCode"],
        onClick: onFieldAdd({ src: " " }),
      },
      story: {
        name: fieldName["story"],
        onClick: onFieldAdd({}),
      },
      buttonLink: {
        name: fieldName["buttonLink"],
        onClick: onFieldAdd({}),
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
      switchDataset: {
        name: fieldName["switchDataset"],
        onClick: onFieldAdd({}),
      },
    };
  }, [fieldGroups, onFieldAdd]);

  const pointFields: FieldDropdownItem = useMemo(() => {
    return {
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
      pointCSV: {
        name: fieldName["pointCSV"],
        onClick: onFieldAdd({}),
      },
    };
  }, [onFieldAdd]);

  const polylineFields: FieldDropdownItem = useMemo(() => {
    return {
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
  }, [onFieldAdd]);

  const polygonFields: FieldDropdownItem = useMemo(() => {
    return {
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
  }, [onFieldAdd]);

  const ThreeDTileFields: FieldDropdownItem = useMemo(() => {
    return {
      buildingColor: {
        name: fieldName["buildingColor"],
        onClick: onFieldAdd({
          colorType: "none",
        }),
      },
      buildingFilter: {
        name: fieldName["buildingFilter"],
        onClick: onFieldAdd({}),
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
      search: {
        name: fieldName["search"],
        onClick: onFieldAdd({}),
      },
    };
  }, [onFieldAdd]);

  // const ThreeDModelFields: FieldDropdownItem = {};

  const TemplateFields: FieldDropdownItem | undefined = useMemo(
    () =>
      templates?.length
        ? templates
            .map(t => {
              return {
                [`template-${t.id}`]: {
                  name: t.name,
                  onClick: onFieldAdd({
                    templateID: t.id,
                    name: t.name,
                  }),
                },
              };
            })
            .reduce((acc, field) => {
              return { ...acc, ...field };
            })
        : undefined,
    [templates, onFieldAdd],
  );

  const fieldComponentsList = useMemo(() => {
    const groups: {
      [key: string]: {
        name: string;
        fields: FieldDropdownItem;
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
      // "3d-model": { name: "3Dモデル", fields: ThreeDModelFields },
      "3d-tile": { name: "3Dタイル", fields: ThreeDTileFields },
    };
    if (TemplateFields) {
      groups["templates"] = { name: "テンプレート", fields: TemplateFields };
    }
    return groups;
  }, [generalFields, pointFields, polygonFields, polylineFields, ThreeDTileFields, TemplateFields]);

  return fieldComponentsList;
};
