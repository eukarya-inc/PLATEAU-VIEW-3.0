import { Setting } from "./types";
import { OPACITY_FIELD } from "./types/fields/general";

export const mockSettings: Setting[] = [
  // For Chiyoda
  {
    id: "1",
    datasetId: "d_13101_bldg",
    dataId: "di_13101_bldg_LOD2（テクスチャなし）",
    groups: [
      {
        id: "1",
        default: true,
        components: [
          {
            type: OPACITY_FIELD,
            value: 1,
            storeable: false,
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
    id: "2",
    datasetId: "d_13102_bldg",
    dataId: "di_13102_bldg_LOD2（テクスチャなし）",
    groups: [
      {
        id: "1",
        default: true,
        components: [
          {
            type: OPACITY_FIELD,
            value: 1,
            storeable: false,
          },
        ],
      },
    ],
    template: undefined,
    infobox: undefined,
    camera: undefined,
  },

  // For chiyoda shelter
  // {
  //   id: "3",
  //   datasetId: "d_13101_shelter",
  //   dataId: "di_13101_shelter",
  //   groups: [
  //     {
  //       id: "1",
  //       default: true,
  //       components: [
  //         {
  //           type: POINT_COLOR_FIELD,
  //           value: `"#f0ff00"`,
  //           storeable: false,
  //         },
  //         {
  //           type: POINT_SIZE_FIELD,
  //           value: 100,
  //           storeable: false,
  //         },
  //       ],
  //     },
  //   ],
  //   template: undefined,
  //   infobox: undefined,
  //   camera: undefined,
  // },
];
