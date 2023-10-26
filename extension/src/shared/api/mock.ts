import { OPACITY_FIELD } from "../types/fieldComponents/general";
import {
  POINT_COLOR_FIELD,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_SIZE_FIELD,
} from "../types/fieldComponents/point";

import { Setting, ComponentTemplate, EmphasisPropertyTemplate } from "./types";

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
              id: "1",
              type: OPACITY_FIELD,
              storeable: false,
              preset: {
                defaultValue: 1,
              },
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
              id: "1",
              type: OPACITY_FIELD,
              storeable: false,
              preset: {
                defaultValue: 1,
              },
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
              id: "1",
              type: POINT_COLOR_FIELD,
              storeable: false,
              preset: {
                defaultValue: `"#0ffffff"`,
              },
            },
            {
              id: "2",
              type: POINT_SIZE_FIELD,
              storeable: false,
              preset: {
                defaultValue: 100,
              },
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
    type: "component",
    groups: [
      {
        id: "1",
        default: true,
        name: "Default",
        components: [
          {
            id: "1",
            type: OPACITY_FIELD,
            storeable: true,
          },
          {
            id: "2",
            type: POINT_FILL_COLOR_VALUE_FIELD,
          },
          {
            id: "3",
            type: POINT_FILL_COLOR_CONDITION_FIELD,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "都市計画決定情報モデル/用途地域モデル/LOD1",
    type: "component",
    groups: [
      {
        id: "1",
        default: true,
        name: "Default",
        components: [
          {
            id: "1",
            type: OPACITY_FIELD,
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
    type: "emphasis",
    properties: [
      {
        id: "1",
        displayName: "名称",
        jsonPath: "name",
        condition: "",
        visible: true,
      },
    ],
  },
];
