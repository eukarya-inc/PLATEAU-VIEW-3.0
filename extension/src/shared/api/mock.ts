import { Setting, ComponentTemplate, EmphasisPropertyTemplate } from "./types";
import { OPACITY_FIELD } from "./types/fields/general";
import { POINT_COLOR_FIELD, POINT_SIZE_FIELD } from "./types/fields/point";

export const mockSettings: Setting[] = [
  // For Chiyoda
  {
    id: "1",
    datasetId: "d_13101_bldg",
    dataId: "di_13101_bldg_LOD2（テクスチャなし）",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
          name: "Default",
          components: [
            {
              type: OPACITY_FIELD,
              value: 1,
              storeable: false,
            },
          ],
        },
      ],
    },
    featureInspector: undefined,
  },
  // For Chuo
  {
    id: "2",
    datasetId: "d_13102_bldg",
    dataId: "di_13102_bldg_LOD2（テクスチャなし）",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
          name: "Default",
          components: [
            {
              type: OPACITY_FIELD,
              value: 1,
              storeable: true,
            },
          ],
        },
      ],
    },
    featureInspector: undefined,
  },
  // For chiyoda shelter
  {
    id: "3",
    datasetId: "d_13101_shelter",
    dataId: "di_13101_shelter",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
          name: "Default",
          components: [
            {
              type: POINT_COLOR_FIELD,
              value: `"#f0ff00"`,
              storeable: false,
            },
            {
              type: POINT_SIZE_FIELD,
              value: 100,
              storeable: false,
            },
          ],
        },
      ],
    },
    featureInspector: undefined,
  },
];

export const mockFieldComponentTemplates: ComponentTemplate[] = [
  {
    id: "1",
    name: "都市計画決定情報モデル/用途地域モデル/Default",
    groups: [
      {
        id: "1",
        default: true,
        name: "Default",
        components: [
          {
            type: OPACITY_FIELD,
            value: 1,
            storeable: true,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "都市計画決定情報モデル/用途地域モデル/LOD1",
    groups: [
      {
        id: "1",
        default: true,
        name: "Default",
        components: [
          {
            type: OPACITY_FIELD,
            value: 1,
            storeable: true,
          },
        ],
      },
    ],
  },
];

export const mockInspectorEmphasisPropertyTemplates: EmphasisPropertyTemplate[] = [
  {
    id: "1",
    name: "ランドマーク情報/Default",
    properties: [
      {
        id: "1",
        propertyName: "name",
        displayName: "名称",
        condition: "",
        visible: true,
      },
    ],
  },
];
