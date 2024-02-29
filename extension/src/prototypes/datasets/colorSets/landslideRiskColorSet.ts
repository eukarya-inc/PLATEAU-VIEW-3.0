import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../atomsWithQualitativeColorSet";

import { LANDSLIDE_RISK_TYPE_CODES } from "./constants";

// Old values from Takram. Doesn't seem to be used
export const landSlideRiskColorSet = atomsWithQualitativeColorSet({
  name: "土砂災害警戒区域",
  // Colors inherited from VIEW 2.0.
  // List of codes: https://www.mlit.go.jp/plateaudocument/#toc4_09_04
  // prettier-ignore
  colors: [
    { value: '1', color: '#ffed4c', name: '土砂災害警戒区域（指定済）' },
    { value: '2', color: '#fb684c', name: '土砂災害特別警戒区域（指定済）' },
    { value: '3', color: '#ffed4c', name: '土砂災害警戒区域（指定前）' },
    { value: '4', color: '#fb684c', name: '土砂災害特別警戒区域（指定前）' }
  ],
});

// Newest values from Eukarya currently in use
export const LANDSLIDE_RISK_COLORS = [
  {
    value: LANDSLIDE_RISK_TYPE_CODES[0],
    color: chroma.rgb(255, 183, 76).hex(),
    name: "地すべり: 警戒区域",
  },
  {
    value: LANDSLIDE_RISK_TYPE_CODES[1],
    color: chroma.rgb(202, 76, 149).hex(),
    name: "地すべり: 特別警戒区域",
  },
];

export const landslideRiskColorSet = atomsWithQualitativeColorSet({
  name: "地すべり",
  colors: LANDSLIDE_RISK_COLORS,
});
