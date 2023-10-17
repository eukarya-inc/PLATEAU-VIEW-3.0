import { BUILDING_LAYER, SHELTER_LAYER } from "../../prototypes/view-layers";

import { Setting, Dataset, ComponentTemplate, EmphasisPropertyTemplate } from "./types";
import { OPACITY_FIELD } from "./types/fields/general";
import { POINT_COLOR_FIELD, POINT_SIZE_FIELD } from "./types/fields/point";

export const mockDatasets: Dataset[] = [
  {
    id: "13101",
    municipalityCode: "13101",
    municipalityName: "東京都 千代田区",
    data: [
      {
        id: "1",
        name: "LOD1",
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json",
        type: BUILDING_LAYER,
      },
      {
        id: "2",
        name: "LOD2",
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/ca/ee4cb0-9ce4-4f6c-bca1-9c7623e84cb1/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13101_chiyoda-ku_lod2_no_texture/tileset.json",
        type: BUILDING_LAYER,
      },
    ],
    version: "2022",
    textured: false,
    lod: 2,
  },
  {
    id: "13102",
    municipalityCode: "13102",
    municipalityName: "東京都 中央区",
    data: [
      {
        id: "1",
        name: "LOD1",
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/5d/134c5b-d8a0-4cca-aeff-2354188a17ca/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13102_chuo-ku_lod1/tileset.json",
        type: BUILDING_LAYER,
      },
      {
        id: "2",
        name: "LOD2",
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/4a/30f295-cd07-46b0-b0ab-4a4b1b3af06b/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13102_chuo-ku_lod2_no_texture/tileset.json",
        type: BUILDING_LAYER,
      },
    ],
    version: "2022",
    textured: false,
    lod: 2,
  },
  {
    id: "13101_shelter",
    municipalityCode: "13101",
    municipalityName: "東京都 千代田区",
    data: [
      {
        id: "1",
        format: "geojson",
        url: "https://assets.cms.plateau.reearth.io/assets/90/62f774-b718-44a0-b0a7-77b8a277ea3a/13101_chiyoda-ku_shelter.geojson",
        type: SHELTER_LAYER,
      },
    ],
    version: "2022",
  },
];

export const mockSettings: Setting[] = [
  // For Chiyoda
  {
    id: "1",
    datasetId: "13101",
    dataId: "1",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
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
  {
    id: "2",
    datasetId: "13101",
    dataId: "2",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
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
  // For Chuo
  {
    id: "3",
    datasetId: "13102",
    dataId: "1",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
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
  {
    id: "4",
    datasetId: "13102",
    dataId: "2",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
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
    id: "5",
    datasetId: "13101_shelter",
    dataId: "1",
    general: {
      camera: undefined,
    },
    fieldComponents: {
      groups: [
        {
          id: "1",
          default: true,
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
