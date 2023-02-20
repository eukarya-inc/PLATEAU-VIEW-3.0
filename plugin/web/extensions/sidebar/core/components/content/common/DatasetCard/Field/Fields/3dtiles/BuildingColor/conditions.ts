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

type Condition = [condition: string, result: string];

const DEFAULT_CONDITION: Condition = ["true", "color('white')"];

const conditionalHeight = defaultConditionalNumber("計測高さ");
const HEIGHT_CONDITIONS: Condition[] = [
  [compareGreaterThan(conditionalHeight, 180), "color('#F7FF00')"],
  [compareRange(conditionalHeight, [120, 180]), "color('#FFCD00')"],
  [compareRange(conditionalHeight, [60, 120]), "color('#F0D37B')"],
  [compareRange(conditionalHeight, [31, 60]), "color('#E1CEE8')"],
  [compareRange(conditionalHeight, [12, 31]), "color('#F7FF00')"],
  [compareRange(conditionalHeight, [0, 12]), "color('#382A54')"],
  DEFAULT_CONDITION,
];

const conditionalPurpose = "用途";
const PURPOSE_CONDITIONS: Condition[] = [
  [equalString(conditionalPurpose, "業務施設"), "color('#ff7f50')"],
  [equalString(conditionalPurpose, "商業施設"), "color('#ff4500')"],
  [equalString(conditionalPurpose, "宿泊施設"), "color('#ffff00')"],
  [equalString(conditionalPurpose, "商業系複合施設"), "color('#ff4500')"],
  [equalString(conditionalPurpose, "住宅"), "color('#32cd32')"],
  [equalString(conditionalPurpose, "共同住宅"), "color('#00ff7f')"],
  [equalString(conditionalPurpose, "店舗等併用住宅"), "color('#00ffff')"],
  [equalString(conditionalPurpose, "店舗等併用共同住宅"), "color('#00ffff')"],
  [equalString(conditionalPurpose, "作業所併用住宅"), "color('#00ffff')"],
  [equalString(conditionalPurpose, "官公庁施設"), "color('#4169e1')"],
  [equalString(conditionalPurpose, "文教厚生施設"), "color('#0000ff')"],
  [equalString(conditionalPurpose, "運輸倉庫施設"), "color('#9370db')"],
  [equalString(conditionalPurpose, "工場"), "color('#87cefa')"],
  [equalString(conditionalPurpose, "農林漁業用施設"), "color('#008000')"],
  [equalString(conditionalPurpose, "併給処理施設"), "color('#8b4513')"],
  [equalString(conditionalPurpose, "防衛施設"), "color('#b22222')"],
  [equalString(conditionalPurpose, "その他"), "color('#d8bfd8')"],
  [equalString(conditionalPurpose, "不明"), "color('#e6e6fa')"],
  DEFAULT_CONDITION,
];

const conditionalStructure = "建物構造";
const STRUCTURE_CONDITIONS: Condition[] = [
  [equalString(conditionalStructure, "耐火構造"), "color('#7c7b87')"],
  [equalString(conditionalStructure, "防火造"), "color('#bc8f8f')"],
  [equalString(conditionalStructure, "準防火造"), "color('#d6caae')"],
  [equalString(conditionalStructure, "木造"), "color('#d2b48c')"],
  DEFAULT_CONDITION,
];

const conditionalStructureType = "建物利用現況_構造種別";
const STRUCTURE_TYPE_CONDITIONS: Condition[] = [
  [equalString(conditionalStructureType, "木造・土蔵造"), "color('#b2b48c')"],
  [equalString(conditionalStructureType, "耐火"), "color('#7f7b85')"],
  [equalString(conditionalStructureType, "簡易耐火"), "color('#8c9bb1')"],
  DEFAULT_CONDITION,
];

const conditionalFireproof = "建物利用現況_耐火構造種別";
const FIREPROOF_CONDITIONS: Condition[] = [
  [equalString(conditionalFireproof, "耐火"), "color('#7c7b87')"],
  [equalString(conditionalFireproof, "準耐火造"), "color('#8e9bb0')"],
  [equalString(conditionalFireproof, "その他"), "color('#d083af')"],
  [equalString(conditionalFireproof, "不明"), "color('#89c2ea')"],
  DEFAULT_CONDITION,
];

export const makeSelectedFloodCondition = (
  propertyName: string | undefined,
): Condition[] | undefined =>
  propertyName
    ? [
        [equalNumber(propertyName, 1), "color('#eeeea6')"],
        [equalNumber(propertyName, 2), "color('#fad4bc')"],
        [equalNumber(propertyName, 3), "color('#f5b2b1')"],
        [equalNumber(propertyName, 4), "color('#ef8c8c')"],
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
