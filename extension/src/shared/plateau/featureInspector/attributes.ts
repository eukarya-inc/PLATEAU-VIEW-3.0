import { omit } from "lodash-es";

import attributesData from "./attributes.csv?raw";
import type { Json, JsonArray, JsonObject, JsonPrimitive } from "./json";
import type { FldInfo, Properties } from "./types";
import { makePropertyName } from "./utils";

export const attributesMap = new Map<string, string>();
const ignoredSuffix = ["_codeSpace"];

attributesData
  .split("\n")
  .map(l => l.split(","))
  .forEach(l => {
    if (!l || !l[0] || !l[1] || typeof l[0] !== "string" || typeof l[1] !== "string") return;
    attributesMap.set(l[0], l[1]);
  });

export const getAttributeLabel = (key: string) => attributesMap?.get(key);

export function getAttributes(attributes: Json, mode?: "both" | "label" | "key"): Json {
  if (!attributes || typeof attributes !== "object") return attributes;
  return walk(attributes, attributesMap);

  function walk(obj: JsonObject | JsonArray, keyMap?: Map<string, string>): JsonObject | JsonArray {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map(o => (typeof o === "object" && o ? walk(o, keyMap) : o));
    }

    return Object.fromEntries(
      Object.entries(obj)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]): [string, JsonPrimitive | JsonObject | JsonArray] | undefined => {
          const m = k.match(/^(.*)(_.+?)$/);
          if (m?.[2] && ignoredSuffix.includes(m[2])) return;

          const label = keyMap?.get(m?.[1] || k);
          const nk =
            (mode === "both" || mode === "label") && label ? label + (suffix(k, keyMap) ?? "") : "";
          const ak = nk ? (mode === "both" ? `${nk}（${k}）` : nk) : k;
          if (typeof v === "object" && v) {
            return [ak || k, walk(v, keyMap)];
          }

          return [ak || k, v];
        })
        .filter((e): e is [string, JsonPrimitive | JsonObject | JsonArray] => !!e),
    );
  }

  function suffix(key: string, keyMap?: Map<string, string>): string {
    const suf = key.match(/(_.+?)$/)?.[1];
    return suf ? keyMap?.get(suf) ?? "" : "";
  }
}

export function getRootFields(properties: Properties, dataType?: string, _fld?: FldInfo): any {
  const overriddenRootPropertyDefinitions = {
    "分類 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:class",
    "延床面積 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:totalFloorArea",
    "都市計画区域 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:urbanPlanType",
    "区域区分 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:areaClassificationType",
    "地域地区 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:districtsAndZonesType",
    "土地利用区分 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:landUseType",
    "調査年 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:surveyYear",
    LOD: "_lod",
    ...veg(properties),
    ...tran(properties),
  };
  const baseRootProperties = Object.fromEntries(
    Object.entries(
      omit(properties, [...Object.values(overriddenRootPropertyDefinitions), "attributes"]),
    ).map(([k, v]) => {
      if(k.startsWith("_")) return [k, undefined];
      if (typeof v !== "string" && typeof v !== "number") return [k, undefined];
      let value: string | number | undefined = v;
      if (k.endsWith("yearOfConstruction")) {
        value = constructionYear(v, dataType);
      }
      return [makePropertyName(k), value];
    }),
  );
  const overriddenRootProperties = Object.fromEntries(
    Object.entries(overriddenRootPropertyDefinitions).map(([k, v]) => [k, properties[v]]),
  );
  return filterObjects({
    ...baseRootProperties,
    ...overriddenRootProperties,
  });
}

const tran = (properties: Record<string, any>) => {
  const featureType = properties.feature_type;
  if ("tran:TrafficArea" === featureType) {
    return {
      ["機能 ※交通領域"]: "tran:function",
    };
  }
  if ("tran:AuxiliaryTrafficArea" === featureType) {
    return {
      ["機能 ※交通補助領域"]: "tran:function",
    };
  }

  return {};
};

const veg = (properties: Record<string, any>) => {
  const featureType = properties.feature_type;
  if ("veg:PlantCover" === featureType) {
    return {
      ["分類 ※植被"]: "tran:function",
    };
  }

  return {};
};

export function constructionYear(
  y: number | string | undefined | null,
  dataType?: string,
): string | number | undefined {
  if (y === "" || typeof y === "undefined" || y === null) return undefined;

  if (
    dataType === "bldg" &&
    (!y ||
      (typeof y === "number" && y <= 1) ||
      y == "0" ||
      y === "1" ||
      y === "0000" ||
      y === "0001")
  ) {
    return "不明";
  }
  return y;
}

function filterObjects(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).filter(
      e => typeof e[1] !== "undefined" && (typeof e[1] !== "string" || e[1]),
    ),
  );
}

// const dataTypeJa: Record<string, string> = {
//   fld: "洪水",
//   tnm: "津波",
//   htd: "高潮",
//   ifld: "内水",
// };
