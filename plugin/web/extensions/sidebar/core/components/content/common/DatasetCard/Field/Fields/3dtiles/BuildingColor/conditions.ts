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

type Condition = {
  condition: string;
  color: `rgba(${number}, ${number}, ${number}, ${number})`;
  label: string;
  default?: boolean;
};

const DEFAULT_CONDITION: Condition = {
  condition: "true",
  color: "rgba(255, 255, 255, 1)",
  label: "",
  default: true,
};

const conditionalHeight = defaultConditionalNumber("計測高さ");
const HEIGHT_CONDITIONS: Condition[] = [
  {
    condition: compareGreaterThan(conditionalHeight, 180),
    color: "rgba(247, 255, 0, 1)",
    label: "180",
  },
  {
    condition: compareRange(conditionalHeight, [120, 180]),
    color: "rgba(255, 205, 0, 1)",
    label: "120",
  },
  {
    condition: compareRange(conditionalHeight, [60, 120]),
    color: "rgba(240, 211, 123, 1)",
    label: "60",
  },
  {
    condition: compareRange(conditionalHeight, [31, 60]),
    color: "rgba(166, 117, 190, 1)",
    label: "31",
  },
  {
    condition: compareRange(conditionalHeight, [12, 31]),
    color: "rgba(90, 34, 200, 1)",
    label: "12",
  },
  { condition: compareRange(conditionalHeight, [0, 12]), color: "rgba(56, 42, 84, 1)", label: "0" },
  DEFAULT_CONDITION,
];

const conditionalPurpose = "用途";
const PURPOSE_CONDITIONS: Condition[] = [
  {
    condition: equalString(conditionalPurpose, "業務施設"),
    color: "rgba(255, 127, 80, 1)",
    label: "業務施設",
  },
  {
    condition: equalString(conditionalPurpose, "商業施設"),
    color: "rgba(255, 69, 0, 1)",
    label: "商業施設",
  },
  {
    condition: equalString(conditionalPurpose, "宿泊施設"),
    color: "rgba(255, 255, 0, 1)",
    label: "宿泊施設",
  },
  {
    condition: equalString(conditionalPurpose, "商業系複合施設"),
    color: "rgba(255, 69, 0, 1)",
    label: "商業系複合施設",
  },
  {
    condition: equalString(conditionalPurpose, "住宅"),
    color: "rgba(50, 205, 50, 1)",
    label: "住宅",
  },
  {
    condition: equalString(conditionalPurpose, "共同住宅"),
    color: "rgba(0, 255, 127, 1)",
    label: "共同住宅",
  },
  {
    condition: equalString(conditionalPurpose, "店舗等併用住宅"),
    color: "rgba(0, 255, 255, 1)",
    label: "店舗等併用住宅",
  },
  {
    condition: equalString(conditionalPurpose, "店舗等併用共同住宅"),
    color: "rgba(0, 255, 255, 1)",
    label: "店舗等併用共同住宅",
  },
  {
    condition: equalString(conditionalPurpose, "作業所併用住宅"),
    color: "rgba(0, 255, 255, 1)",
    label: "作業所併用住宅",
  },
  {
    condition: equalString(conditionalPurpose, "官公庁施設"),
    color: "rgba(65, 105, 225, 1)",
    label: "官公庁施設",
  },
  {
    condition: equalString(conditionalPurpose, "文教厚生施設"),
    color: "rgba(0, 0, 255, 1)",
    label: "文教厚生施設",
  },
  {
    condition: equalString(conditionalPurpose, "運輸倉庫施設"),
    color: "rgba(147, 112, 219, 1)",
    label: "運輸倉庫施設",
  },
  {
    condition: equalString(conditionalPurpose, "工場"),
    color: "rgba(135, 206, 250, 1)",
    label: "工場",
  },
  {
    condition: equalString(conditionalPurpose, "農林漁業用施設"),
    color: "rgba(0, 128, 0, 1)",
    label: "農林漁業用施設",
  },
  {
    condition: equalString(conditionalPurpose, "併給処理施設"),
    color: "rgba(139, 69, 19, 1)",
    label: "併給処理施設",
  },
  {
    condition: equalString(conditionalPurpose, "防衛施設"),
    color: "rgba(178, 34, 34, 1)",
    label: "防衛施設",
  },
  {
    condition: equalString(conditionalPurpose, "その他"),
    color: "rgba(216, 191, 216, 1)",
    label: "その他",
  },
  {
    condition: equalString(conditionalPurpose, "不明"),
    color: "rgba(230, 230, 250, 1)",
    label: "不明",
  },
  DEFAULT_CONDITION,
];

const conditionalStructure = "建物構造";
const STRUCTURE_CONDITIONS: Condition[] = [
  {
    condition: equalString(conditionalStructure, "耐火構造"),
    color: "rgba(124, 123, 135, 1)",
    label: "耐火構造",
  },
  {
    condition: equalString(conditionalStructure, "防火造"),
    color: "rgba(188, 143, 143, 1)",
    label: "防火造",
  },
  {
    condition: equalString(conditionalStructure, "準防火造"),
    color: "rgba(214, 202, 174, 1)",
    label: "準防火造",
  },
  {
    condition: equalString(conditionalStructure, "木造"),
    color: "rgba(210, 180, 140, 1)",
    label: "木造",
  },
  DEFAULT_CONDITION,
];

const conditionalStructureType = "構造種別";
const STRUCTURE_TYPE_CONDITIONS: Condition[] = [
  {
    condition: equalString(conditionalStructureType, "木造・土蔵造"),
    color: "rgba(178, 180, 140, 1)",
    label: "木造・土蔵造",
  },
  {
    condition: equalString(conditionalStructureType, "鉄骨鉄筋コンクリート造"),
    color: "rgba(229, 225, 64, 1)",
    label: "鉄骨鉄筋コンクリート造",
  },
  {
    condition: equalString(conditionalStructureType, "鉄筋コンクリート造"),
    color: "rgba(234, 164, 37, 1)",
    label: "鉄筋コンクリート造",
  },
  {
    condition: equalString(conditionalStructureType, "鉄骨造"),
    color: "rgba(153, 99, 50, 1)",
    label: "鉄骨造",
  },
  {
    condition: equalString(conditionalStructureType, "れんが造"),
    color: "rgba(119, 23, 28, 1)",
    label: "れんが造",
  },
  {
    condition: equalString(conditionalStructureType, "軽量鉄骨造"),
    color: "rgba(160, 79, 146, 1)",
    label: "軽量鉄骨造",
  },
  {
    condition: equalString(conditionalStructureType, "コンクリートブロック造"),
    color: "rgba(119, 23, 28, 1)",
    label: "コンクリートブロック造",
  },
  {
    condition: equalString(conditionalStructureType, "石造"),
    color: "rgba(119, 23, 28, 1)",
    label: "石造",
  },
  {
    condition: equalString(conditionalStructureType, "非木造"),
    color: "rgba(137, 182, 220, 1)",
    label: "非木造",
  },
  {
    condition: equalString(conditionalStructureType, "不明"),
    color: "rgba(34, 34, 34, 1)",
    label: "不明",
  },
  DEFAULT_CONDITION,
];

const conditionalFireproof = "建物利用現況_耐火構造種別";
const FIREPROOF_CONDITIONS: Condition[] = [
  {
    condition: equalString(conditionalFireproof, "耐火"),
    color: "rgba(127, 123, 133, 1)",
    label: "耐火",
  },
  {
    condition: equalString(conditionalFireproof, "準耐火造"),
    color: "rgba(140, 155, 177, 1)",
    label: "準耐火造",
  },
  {
    condition: equalString(conditionalFireproof, "その他"),
    color: "rgba(250, 131, 158, 1)",
    label: "その他",
  },
  {
    condition: equalString(conditionalFireproof, "不明"),
    color: "rgba(120, 194, 243, 1)",
    label: "不明",
  },
  DEFAULT_CONDITION,
];

export const makeSelectedFloodCondition = (
  propertyName: string | undefined,
): [condition: string, color: string][] | undefined =>
  propertyName
    ? [
        [`\${${propertyName}} === null`, "rgba(135, 206, 235, 1)"],
        [`isNaN(\${${propertyName}})`, "rgba(135, 206, 235, 1)"],
        [equalNumber(propertyName, 2), "rgba(243, 240, 122, 1)"],
        [equalNumber(propertyName, 3), "rgba(255, 184, 141, 1)"],
        [equalNumber(propertyName, 4), "rgba(255, 132, 132, 1)"],
        [equalNumber(propertyName, 5), "rgba(255, 94, 94, 1)"],
        [equalNumber(propertyName, 6), "rgba(237, 87, 181, 1)"],
        [compareGreaterThan(defaultConditionalNumber(propertyName, 0), 7), "rgba(209, 82, 209, 1)"],
        [DEFAULT_CONDITION.condition, DEFAULT_CONDITION.color],
      ]
    : [[DEFAULT_CONDITION.condition, DEFAULT_CONDITION.color]];

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
