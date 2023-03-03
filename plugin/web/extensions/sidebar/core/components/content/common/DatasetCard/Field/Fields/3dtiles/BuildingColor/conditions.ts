import { INDEPENDENT_COLOR_TYPE } from "./constants";

const defaultConditionalNumber = (prop: string, defaultValue?: number) =>
  `((\${${prop}} === "" || \${${prop}} === null || isNaN(Number(\${${prop}}))) ? ${
    defaultValue || 1
  } : Number(\${${prop}}))`;
const compareRange = (conditionalValue: string, range: [from: number, to: number]) =>
  `(${conditionalValue} >= ${range?.[0]} && ${conditionalValue} <= ${range?.[1]})`;

const compareGreaterThan = (conditionalValue: string, num: number) =>
  `(${conditionalValue} >= ${num})`;

const equalString = (prop: string, value: string) => `(\${${prop}} === "${value}")`;
const equalNumber = (prop: string, value: number) => `(\${${prop}} === ${value})`;

type Condition = [condition: string, color: `rgba(${number}, ${number}, ${number}, ${number})`];

const DEFAULT_CONDITION: Condition = ["true", "rgba(255, 255, 255, 1)"];

const conditionalHeight = defaultConditionalNumber("計測高さ");
const HEIGHT_CONDITIONS: Condition[] = [
  [compareGreaterThan(conditionalHeight, 180), "rgba(247, 255, 0, 1)"],
  [compareRange(conditionalHeight, [120, 180]), "rgba(255, 205, 0, 1)"],
  [compareRange(conditionalHeight, [60, 120]), "rgba(240, 211, 123, 1)"],
  [compareRange(conditionalHeight, [31, 60]), "rgba(225, 206, 232, 1)"],
  [compareRange(conditionalHeight, [12, 31]), "rgba(90, 34, 200, 1)"],
  [compareRange(conditionalHeight, [0, 12]), "rgba(56, 42, 84, 1)"],
  DEFAULT_CONDITION,
];

const conditionalPurpose = "用途";
const PURPOSE_CONDITIONS: Condition[] = [
  [equalString(conditionalPurpose, "業務施設"), "rgba(255, 127, 80, 1)"],
  [equalString(conditionalPurpose, "商業施設"), "rgba(255, 69, 0, 1)"],
  [equalString(conditionalPurpose, "宿泊施設"), "rgba(255, 255, 0, 1)"],
  [equalString(conditionalPurpose, "商業系複合施設"), "rgba(255, 69, 0, 1)"],
  [equalString(conditionalPurpose, "住宅"), "rgba(50, 205, 50, 1)"],
  [equalString(conditionalPurpose, "共同住宅"), "rgba(0, 255, 127, 1)"],
  [equalString(conditionalPurpose, "店舗等併用住宅"), "rgba(0, 255, 255, 1)"],
  [equalString(conditionalPurpose, "店舗等併用共同住宅"), "rgba(0, 255, 255, 1)"],
  [equalString(conditionalPurpose, "作業所併用住宅"), "rgba(0, 255, 255, 1)"],
  [equalString(conditionalPurpose, "官公庁施設"), "rgba(65, 105, 225, 1)"],
  [equalString(conditionalPurpose, "文教厚生施設"), "rgba(0, 0, 255, 1)"],
  [equalString(conditionalPurpose, "運輸倉庫施設"), "rgba(147, 112, 219, 1)"],
  [equalString(conditionalPurpose, "工場"), "rgba(135, 206, 250, 1)"],
  [equalString(conditionalPurpose, "農林漁業用施設"), "rgba(0, 128, 0, 1)"],
  [equalString(conditionalPurpose, "併給処理施設"), "rgba(139, 69, 19, 1)"],
  [equalString(conditionalPurpose, "防衛施設"), "rgba(178, 34, 34, 1)"],
  [equalString(conditionalPurpose, "その他"), "rgba(216, 191, 216, 1)"],
  [equalString(conditionalPurpose, "不明"), "rgba(230, 230, 250, 1)"],
  DEFAULT_CONDITION,
];

const conditionalStructure = "建物構造";
const STRUCTURE_CONDITIONS: Condition[] = [
  [equalString(conditionalStructure, "耐火構造"), "rgba(124, 123, 135, 1)"],
  [equalString(conditionalStructure, "防火造"), "rgba(188, 143, 143, 1)"],
  [equalString(conditionalStructure, "準防火造"), "rgba(214, 202, 174, 1)"],
  [equalString(conditionalStructure, "木造"), "rgba(210, 180, 140, 1)"],
  DEFAULT_CONDITION,
];

const conditionalStructureType = "建物利用現況_構造種別";
const STRUCTURE_TYPE_CONDITIONS: Condition[] = [
  [equalString(conditionalStructureType, "木造・土蔵造"), "rgba(178, 180, 140, 1)"],
  [equalString(conditionalStructureType, "耐火"), "rgba(127, 123, 133, 1)"],
  [equalString(conditionalStructureType, "簡易耐火"), "rgba(140, 155, 177, 1)"],
  DEFAULT_CONDITION,
];

const conditionalFireproof = "建物利用現況_耐火構造種別";
const FIREPROOF_CONDITIONS: Condition[] = [
  [equalString(conditionalFireproof, "耐火"), "rgba(124, 123, 135, 1)"],
  [equalString(conditionalFireproof, "準耐火造"), "rgba(142, 155, 176, 1)"],
  [equalString(conditionalFireproof, "その他"), "rgba(208, 131, 175, 1)"],
  [equalString(conditionalFireproof, "不明"), "rgba(137, 194, 234, 1)"],
  DEFAULT_CONDITION,
];

export const makeSelectedFloodCondition = (
  propertyName: string | undefined,
): Condition[] | undefined =>
  propertyName
    ? [
        [equalNumber(propertyName, 1), "rgba(238, 238, 166, 1)"],
        [equalNumber(propertyName, 2), "rgba(250, 212, 188, 1)"],
        [equalNumber(propertyName, 3), "rgba(245, 178, 177, 1)"],
        [equalNumber(propertyName, 4), "rgba(239, 140, 140, 1)"],
        DEFAULT_CONDITION,
      ]
    : undefined;

export const COLOR_TYPE_CONDITIONS: {
  [K in keyof typeof INDEPENDENT_COLOR_TYPE | "none"]: Condition[];
} = {
  none: [DEFAULT_CONDITION],
  height: HEIGHT_CONDITIONS,
  purpose: PURPOSE_CONDITIONS,
  structure: STRUCTURE_CONDITIONS,
  structureType: STRUCTURE_TYPE_CONDITIONS,
  fireproof: FIREPROOF_CONDITIONS,
};
