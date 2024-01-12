import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../../../prototypes/datasets";

export const usageColorSet = atomsWithQualitativeColorSet({
  name: "用途",
  colors: [
    { value: "業務施設", color: chroma.rgb(255, 127, 80).hex(), name: "業務施設" },
    { value: "商業施設", color: chroma.rgb(255, 69, 0).hex(), name: "商業施設" },
    { value: "宿泊施設", color: chroma.rgb(255, 255, 0).hex(), name: "宿泊施設" },
    { value: "商業系複合施設", color: chroma.rgb(255, 69, 0).hex(), name: "商業系複合施設" },
    { value: "住宅", color: chroma.rgb(50, 205, 50).hex(), name: "住宅" },
    { value: "共同住宅", color: chroma.rgb(0, 255, 127).hex(), name: "共同住宅" },
    { value: "店舗等併用住宅", color: chroma.rgb(0, 255, 255).hex(), name: "店舗等併用住宅" },
    {
      value: "店舗等併用共同住宅",
      color: chroma.rgb(0, 255, 255).hex(),
      name: "店舗等併用共同住宅",
    },
    {
      value: "作業所併用住宅",
      color: chroma.rgb(0, 255, 255).hex(),
      name: "作業所併用住宅",
    },
    {
      value: "官公庁施設",
      color: chroma.rgb(65, 105, 225).hex(),
      name: "官公庁施設",
    },
    {
      value: "文教厚生施設",
      color: chroma.rgb(0, 255, 255).hex(),
      name: "文教厚生施設",
    },
    {
      value: "運輸倉庫施設",
      color: chroma.rgb(147, 112, 219).hex(),
      name: "運輸倉庫施設",
    },
    {
      value: "工場",
      color: chroma.rgb(0, 128, 0).hex(),
      name: "工場",
    },
    {
      value: "農林漁業用施設",
      color: chroma.rgb(135, 206, 250).hex(),
      name: "農林漁業用施設",
    },
    {
      value: "併給処理施設",
      color: chroma.rgb(139, 69, 19).hex(),
      name: "併給処理施設",
    },
    {
      value: "防衛施設",
      color: chroma.rgb(178, 34, 34).hex(),
      name: "防衛施設",
    },
    {
      value: "その他",
      color: chroma.rgb(216, 191, 216).hex(),
      name: "その他",
    },
    {
      value: "不明",
      color: chroma.rgb(230, 230, 250).hex(),
      name: "不明",
    },
  ],
});

export const structureTypeColorSet = atomsWithQualitativeColorSet({
  name: "構造種別",
  colors: [
    { value: "木造・土蔵造", color: chroma.rgb(178, 180, 140).hex(), name: "木造・土蔵造" },
    {
      value: "鉄骨鉄筋コンクリート造",
      color: chroma.rgb(229, 225, 64).hex(),
      name: "鉄骨鉄筋コンクリート造",
    },
    {
      value: "鉄筋コンクリート造",
      color: chroma.rgb(234, 164, 37).hex(),
      name: "鉄筋コンクリート造",
    },
    { value: "鉄骨造", color: chroma.rgb(153, 99, 50).hex(), name: "鉄骨造" },
    { value: "軽量鉄骨造", color: chroma.rgb(160, 79, 146).hex(), name: "軽量鉄骨造" },
    {
      value: "レンガ造・コンクリートブロック造・石造",
      color: chroma.rgb(119, 23, 28).hex(),
      name: "レンガ造・コンクリートブロック造・石造",
    },
    { value: "非木造", color: chroma.rgb(137, 182, 220).hex(), name: "非木造" },
    {
      value: "耐火",
      color: chroma.rgb(127, 123, 133).hex(),
      name: "耐火",
    },
    {
      value: "簡易耐火",
      color: chroma.rgb(140, 155, 177).hex(),
      name: "簡易耐火",
    },
    {
      value: "不明",
      color: chroma.rgb(34, 34, 34).hex(),
      name: "不明",
    },
  ],
});

export const fireproofStructureTypeColorSet = atomsWithQualitativeColorSet({
  name: "耐火構造種別",
  colors: [
    { value: "耐火", color: chroma.rgb(127, 123, 133).hex(), name: "耐火" },
    {
      value: "準耐火造",
      color: chroma.rgb(140, 155, 177).hex(),
      name: "準耐火造",
    },
    {
      value: "その他",
      color: chroma.rgb(250, 131, 158).hex(),
      name: "その他",
    },
    { value: "不明", color: chroma.rgb(120, 194, 243).hex(), name: "不明" },
  ],
});

const LAND_SLIDE_RISK_TYPE_CODES = [
  1, // 警戒区域
  2, // 特別警戒区域
  3, // 警戒区域(指定前)
  4, // 特別警戒区域(指定前)
];

export const steepSlopeRiskColorSet = atomsWithQualitativeColorSet({
  name: "急傾斜地の崩落",
  colors: [
    {
      value: LAND_SLIDE_RISK_TYPE_CODES[0],
      color: chroma.rgb(255, 237, 76).hex(),
      name: "急傾斜地の崩落: 警戒区域",
    },
    {
      value: LAND_SLIDE_RISK_TYPE_CODES[1],
      color: chroma.rgb(251, 104, 76).hex(),
      name: "急傾斜地の崩落: 特別警戒区域",
    },
  ],
});

export const mudflowRiskColorSet = atomsWithQualitativeColorSet({
  name: "土石流",
  colors: [
    {
      value: LAND_SLIDE_RISK_TYPE_CODES[0],
      color: chroma.rgb(237, 216, 111).hex(),
      name: "土石流: 警戒区域",
    },
    {
      value: LAND_SLIDE_RISK_TYPE_CODES[1],
      color: chroma.rgb(192, 76, 99).hex(),
      name: "土石流: 特別警戒区域",
    },
  ],
});

export const landSlideRiskColorSet = atomsWithQualitativeColorSet({
  name: "地すべり",
  colors: [
    {
      value: LAND_SLIDE_RISK_TYPE_CODES[0],
      color: chroma.rgb(255, 183, 76).hex(),
      name: "地すべり: 警戒区域",
    },
    {
      value: LAND_SLIDE_RISK_TYPE_CODES[1],
      color: chroma.rgb(202, 76, 149).hex(),
      name: "地すべり: 特別警戒区域",
    },
  ],
});
