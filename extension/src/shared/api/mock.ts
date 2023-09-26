import { Setting, Dataset } from "./types";
import { OPACITY_FIELD } from "./types/fields/general";

export const mockDatasets: Dataset[] = [
  {
    id: "13101",
    municipalityCode: "13101",
    municipalityName: "東京都 千代田区",
    data: [
      {
        id: "1",
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json",
      },
      {
        id: "2",
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/ca/ee4cb0-9ce4-4f6c-bca1-9c7623e84cb1/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13101_chiyoda-ku_lod2_no_texture/tileset.json",
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
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/5d/134c5b-d8a0-4cca-aeff-2354188a17ca/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13102_chuo-ku_lod1/tileset.json",
      },
      {
        id: "2",
        format: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/4a/30f295-cd07-46b0-b0ab-4a4b1b3af06b/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13102_chuo-ku_lod2_no_texture/tileset.json",
      },
    ],
    version: "2022",
    textured: false,
    lod: 2,
  },
];

export const mockSettings: Setting[] = [
  // For Chiyoda
  {
    id: "1",
    datasetId: "13101",
    dataId: "1",
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
    template: undefined,
    infobox: undefined,
    camera: undefined,
  },
  {
    id: "2",
    datasetId: "13101",
    dataId: "2",
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
    template: undefined,
    infobox: undefined,
    camera: undefined,
  },
  // For Chuo
  {
    id: "3",
    datasetId: "13102",
    dataId: "1",
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
    template: undefined,
    infobox: undefined,
    camera: undefined,
  },
  {
    id: "4",
    datasetId: "13102",
    dataId: "2",
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
    template: undefined,
    infobox: undefined,
    camera: undefined,
  },
];
