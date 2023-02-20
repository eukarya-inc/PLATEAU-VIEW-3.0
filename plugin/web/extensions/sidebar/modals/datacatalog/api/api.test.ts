import { expect, test } from "vitest";

import {
  // getDataCatalog,
  getRawDataCatalogTree,
  modifyDataCatalog,
  type RawDataCatalogItem,
} from "./api";

// test("getDataCatalog", async () => {
//   const d = await getDataCatalog("");
//   console.log(d[0]);
// });

test("modifyDataCatalog", () => {
  const d: RawDataCatalogItem = {
    id: "a",
    name: "name",
    pref: "pref",
    desc: "",
    format: "",
    url: "",
    type: "ユースケース",
    type_en: "usecase",
    type2: "type2",
    type2_en: "type2",
    city: "city",
    city_code: "11111",
    ward: "ward",
    ward_code: "11112",
    city_en: "city",
    year: 2022,
  };
  expect(modifyDataCatalog(d)).toEqual({
    ...d,
    tags: [
      { type: "type", value: "ユースケース" },
      { type: "type", value: "type2" },
      { type: "location", value: "city" },
      { type: "location", value: "ward" },
    ],
  });
});

test("getRawDataCatalogTree by cities", () => {
  expect(getRawDataCatalogTree(dataCatalog, "city", "")).toEqual([
    {
      name: "全球データ",
      children: [zenkyuData],
    },
    {
      name: "東京都",
      children: [
        {
          name: "東京都23区",
          children: [
            {
              name: "千代田区",
              children: [chiyodakuBldg, chiyodakuShelter],
            },
            {
              name: "世田谷区",
              children: [setagayakuBldg, setagayakuShelter],
            },
            tokyo23kuPark,
          ],
        },
        {
          name: "八王子市",
          children: [hachiojiBldg, hachiojiLandmark],
        },
        {
          name: "ユースケース",
          children: [tokyoUsecase],
        },
      ],
    },
    {
      name: "栃木県",
      children: [
        {
          name: "宇都宮市",
          children: [
            utsunomiyashiBldg,
            { name: "都市計画決定情報モデル", children: [utsunomiyashiUseDictrict] },
          ],
        },
      ],
    },
  ]);
});

test("getRawDataCatalogTree by types", () => {
  expect(getRawDataCatalogTree(dataCatalog, "type", "")).toEqual([
    {
      name: "建築物モデル",
      children: [
        {
          name: "東京都",
          children: [
            {
              name: "東京都23区",
              children: [chiyodakuBldg, setagayakuBldg],
            },
            hachiojiBldg,
          ],
        },
        {
          name: "栃木県",
          children: [utsunomiyashiBldg],
        },
      ],
    },
    {
      name: "都市計画決定情報モデル",
      children: [
        {
          name: "栃木県",
          children: [
            {
              name: "宇都宮市",
              children: [utsunomiyashiUseDictrict],
            },
          ],
        },
      ],
    },
    {
      name: "避難施設情報",
      children: [
        {
          name: "東京都",
          children: [
            {
              name: "東京都23区",
              children: [chiyodakuShelter, setagayakuShelter],
            },
          ],
        },
      ],
    },
    {
      name: "ランドマーク情報",
      children: [
        {
          name: "東京都",
          children: [hachiojiLandmark],
        },
      ],
    },
    {
      name: "公園情報",
      children: [
        {
          name: "東京都",
          children: [tokyo23kuPark],
        },
      ],
    },
    {
      name: "ユースケース",
      children: [
        {
          name: "全球データ",
          children: [zenkyuData],
        },
        {
          name: "東京都",
          children: [tokyoUsecase],
        },
      ],
    },
  ]);
});

test("getRawDataCatalogTree filter", () => {
  expect(getRawDataCatalogTree(dataCatalog, "type", "世田谷")).toEqual([
    {
      name: "建築物モデル",
      children: [
        {
          name: "東京都",
          children: [
            {
              name: "東京都23区",
              children: [setagayakuBldg],
            },
          ],
        },
      ],
    },
    {
      name: "避難施設情報",
      children: [
        {
          name: "東京都",
          children: [
            {
              name: "東京都23区",
              children: [setagayakuShelter],
            },
          ],
        },
      ],
    },
  ]);
});

const chiyodakuBldg = {
  id: "a",
  type: "建築物モデル",
  type_en: "bldg",
  name: "建築物モデル（千代田区）",
  pref: "東京都",
  city: "東京都23区",
  city_en: "tokyo-23ku",
  city_code: "13100",
  ward: "千代田区",
  ward_en: "chiyoda-ku",
  ward_code: "13101",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const chiyodakuShelter = {
  id: "b",
  type: "避難施設情報",
  type_en: "shelter",
  name: "避難施設情報（千代田区）",
  pref: "東京都",
  city: "東京都23区",
  city_en: "tokyo-23ku",
  city_code: "13100",
  ward: "千代田区",
  ward_en: "chiyoda-ku",
  ward_code: "13101",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const setagayakuBldg = {
  id: "c",
  type: "建築物モデル",
  type_en: "bldg",
  name: "建築物モデル（世田谷区）",
  pref: "東京都",
  city: "東京都23区",
  city_en: "tokyo-23ku",
  city_code: "13100",
  ward: "世田谷区",
  ward_en: "setagaya-ku",
  ward_code: "13112",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const setagayakuShelter = {
  id: "d",
  type: "避難施設情報",
  type_en: "shelter",
  name: "避難施設情報（世田谷区）",
  pref: "東京都",
  city: "東京都23区",
  city_en: "tokyo-23ku",
  city_code: "13100",
  ward: "世田谷区",
  ward_en: "setagaya-ku",
  ward_code: "13112",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const tokyo23kuPark = {
  id: "e",
  type: "公園情報",
  type_en: "park",
  name: "公園情報（東京都23区）",
  pref: "東京都",
  city: "東京都23区",
  city_en: "tokyo-23ku",
  city_code: "13100",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const hachiojiBldg = {
  id: "f",
  type: "建築物モデル",
  type_en: "bldg",
  name: "建築物モデル（八王子市）",
  pref: "東京都",
  city: "八王子市",
  city_en: "hachioji-shi",
  city_code: "13201",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const hachiojiLandmark = {
  id: "f",
  type: "ランドマーク情報",
  type_en: "landmark",
  name: "ランドマーク情報（八王子市）",
  pref: "東京都",
  city: "八王子市",
  city_en: "hachioji-shi",
  city_code: "13201",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const tokyoUsecase = {
  id: "tokyoUsecase",
  name: "usecase",
  pref: "東京都",
  type: "ユースケース",
  type_en: "usecase",
  format: "",
  url: "",
  desc: "",
  year: 2021,
};
const utsunomiyashiBldg = {
  id: "g",
  type: "建築物モデル",
  type_en: "bldg",
  name: "建築物モデル（宇都宮市）",
  pref: "栃木県",
  city: "宇都宮市",
  city_en: "utsunomiya-shi",
  city_code: "09201",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const utsunomiyashiUseDictrict = {
  id: "h",
  type: "都市計画決定情報モデル",
  type_en: "urf",
  type2: "用途地域",
  type2_en: "UseDistrict",
  name: "用途地域（宇都宮市）",
  pref: "栃木県",
  city: "宇都宮市",
  city_en: "utsunomiya-shi",
  city_code: "09201",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};
const zenkyuData = {
  id: "z",
  type: "ユースケース",
  type_en: "usecase",
  name: "zenkyu",
  pref: "全球データ",
  format: "",
  url: "",
  desc: "",
  year: 2022,
};

const dataCatalog: RawDataCatalogItem[] = [
  utsunomiyashiBldg,
  hachiojiBldg,
  setagayakuShelter,
  chiyodakuBldg,
  zenkyuData,
  tokyo23kuPark,
  chiyodakuShelter,
  setagayakuBldg,
  hachiojiLandmark,
  tokyoUsecase,
  utsunomiyashiUseDictrict,
];
