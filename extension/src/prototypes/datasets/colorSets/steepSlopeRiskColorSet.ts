import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../atomsWithQualitativeColorSet";

import { LANDSLIDE_RISK_TYPE_CODES } from "./constants";

export const STEEP_SLOPE_RISK_COLORS = [
  {
    value: LANDSLIDE_RISK_TYPE_CODES[0],
    color: chroma.rgb(255, 237, 76).hex(),
    name: "急傾斜地の崩落: 警戒区域",
  },
  {
    value: LANDSLIDE_RISK_TYPE_CODES[1],
    color: chroma.rgb(251, 104, 76).hex(),
    name: "急傾斜地の崩落: 特別警戒区域",
  },
];

export const steepSlopeRiskColorSet = atomsWithQualitativeColorSet({
  name: "急傾斜地の崩落",
  colors: STEEP_SLOPE_RISK_COLORS,
});
