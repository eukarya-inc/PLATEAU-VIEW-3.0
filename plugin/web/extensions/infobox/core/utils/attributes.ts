import { get } from "lodash";

import type { FldInfo, Properties } from "../../types";

import attributesData from "./attributes.csv?raw";
import type { Json, JsonArray, JsonObject } from "./json";

export const attributesMap = new Map<string, string>();

attributesData
  .split("\n")
  .map(l => l.split(","))
  .forEach(l => {
    if (!l || !l[0] || !l[1] || typeof l[0] !== "string" || typeof l[1] !== "string") return;
    attributesMap.set(l[0], l[1]);
  });

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
        .map(([k, v]) => {
          const label = keyMap?.get(k.replace(/_.+?$/, ""));
          const nk =
            (mode === "both" || mode === "label") && label ? label + (suffix(k, keyMap) ?? "") : "";
          const ak = nk ? (mode === "both" ? `${nk}（${k}）` : nk) : k;

          if (typeof v === "object" && v) {
            return [ak || k, walk(v, keyMap)];
          }
          return [ak || k, v];
        }),
    );
  }

  function suffix(key: string, keyMap?: Map<string, string>): string {
    const suf = key.match(/(_.+?)$/)?.[1];
    return suf ? keyMap?.get(suf) ?? "" : "";
  }
}

export function getRootFields(properties: Properties, dataType?: string, fld?: FldInfo): any {
  return filterObjects({
    gml_id: get(properties, ["attributes", "gml:id"]),
    ...name(properties, dataType, fld?.name, fld?.datasetName),
    分類: get(properties, ["attributes", "bldg:class"]),
    用途: get(properties, ["attributes", "bldg:usage", 0]),
    住所: get(properties, ["attributes", "bldg:address"]),
    建築年: get(properties, ["attributes", "bldg:yearOfConstruction"]),
    計測高さ: get(properties, ["attributes", "bldg:measuredHeight"]),
    地上階数: get(properties, ["attributes", "bldg:storeysAboveGround"]),
    地下階数: get(properties, ["attributes", "bldg:storeysBelowGround"]),
    敷地面積: get(properties, ["attributes", "uro:BuildingDetailAttribute", 0, "uro:siteArea"]),
    構造種別: get(properties, [
      "attributes",
      "uro:BuildingDetailAttribute",
      0,
      "uro:buildingStructureType",
    ]),
    "構造種別（独自）": get(properties, [
      "attributes",
      "uro:BuildingDetailAttribute",
      0,
      "uro:buildingStructureOrgType",
    ]),
    耐火構造種別: get(properties, [
      "attributes",
      "uro:BuildingDetailAttribute",
      0,
      "uro:fireproofStructureType",
    ]),
    都市計画区域: get(properties, [
      "attributes",
      "uro:BuildingDetailAttribute",
      0,
      "uro:urbanPlanType",
    ]),
    区域区分: get(properties, [
      "attributes",
      "uro:BuildingDetailAttribute",
      0,
      "uro:areaClassificationType",
    ]),
    地域地区: get(properties, [
      "attributes",
      "uro:BuildingDetailAttribute",
      0,
      "uro:districtsAndZonesType",
      0,
    ]),
    調査年: get(properties, ["attributes", "uro:BuildingDetailAttribute", 0, "uro:surveyYear"]),
    "建物利用現況（大分類）": get(properties, ["attributes", "uro:majorUsage"]),
    "建物利用現況（中分類）": get(properties, ["attributes", "uro:orgUsage"]),
    "建物利用現況（小分類）": get(properties, ["attributes", "uro:orgUsage2"]),
    "建物利用現況（詳細分類）": get(properties, ["attributes", "uro:detailedUsage"]),
    建物ID: get(properties, ["attributes", "uro:BuildingIDAttribute", 0, "uro:buildingID"]),
    図上面積: get(properties, [
      "attributes",
      "uro:BuildingDetailAttribute",
      0,
      "uro:buildingRoofEdgeArea",
    ]),
    LOD1立ち上げに使用する高さ: get(properties, [
      "attributes",
      "uro:BuildingDataQualityAttribute",
      0,
      "uro:lod1HeightType",
    ]),
    ...floodFields(properties),
    土砂災害警戒区域: get(properties, [
      "attributes",
      "uro:BuildingLandSlideRiskAttribute",
      0,
      "uro:description",
    ]),
  });
}

export function name(
  properties: Properties,
  dataType?: string,
  title?: string,
  datasetName?: string,
): { name: string } | { 名称: string } | undefined {
  const gmlName = get(properties, ["attributes", "gml:name"]) as string | undefined;

  if (dataType && ["fld", "htd", "tnm", "ifld"].includes(dataType)) {
    if (title && gmlName && !isNaN(Number(gmlName))) {
      // 浸水想定区域データで、gml:nameが数字になってしまっているデータのためのワークアラウンド
      const name = fldName(title, dataType, datasetName);
      if (name) return { name };
    }

    if (gmlName) return { name: gmlName };
    return;
  }

  if (gmlName) return { 名称: gmlName };
  return;
}

export function fldName(title: string, dataType: string, scale?: string): string {
  if (typeof title !== "string") return "";
  return `${title.replace(/^.+?浸水想定区域(モデル)? /, "").replaceAll(/（.+?）/g, "")}${
    dataType !== "tnm" ? `${dataTypeJa[dataType] ?? ""}浸水想定区域図` : ""
  }${scale ? `【${scale}】` : ``}`;
}

function floodFields(properties: Properties): any {
  const fld = get(properties, ["attributes", "uro:BuildingRiverFloodingRiskAttribute"]) as
    | BuildingRiverFloodingRiskAttribute[]
    | undefined;
  if (!Array.isArray(fld)) return {};

  return Object.fromEntries(
    fld
      .slice(0)
      .sort(
        (a, b) =>
          a?.["uro:description"]?.localeCompare(b?.["uro:description"] || "") ||
          a?.["uro:adminType"]?.localeCompare(b?.["uro:adminType"] || "") ||
          a?.["uro:scale"]?.localeCompare(b?.["uro:scale"] || "") ||
          0,
      )
      .flatMap(a => {
        if (!a || !a["uro:description"] || !a["uro:adminType"] || !a["uro:scale"]) return [];
        const prefix = `${a["uro:description"]}（${a["uro:adminType"]}管理区間）_${a["uro:scale"]}`;
        return [
          [
            `${prefix}_浸水ランク`,
            a["uro:rank_code"] || a["uro:rankOrg_code"] || a["uro:rank"] || a["uro:rankOrg"],
          ],
          [`${prefix}_浸水深`, a["uro:depth"]],
          [`${prefix}_継続時間`, a["uro:duration"]],
        ];
      })
      .filter(f => typeof f[1] !== "undefined" && (typeof f[1] !== "string" || f[1])),
  );
}

function filterObjects(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).filter(
      e => typeof e[1] !== "undefined" && (typeof e[1] !== "string" || e[1]),
    ),
  );
}

type BuildingRiverFloodingRiskAttribute = {
  "uro:description"?: string; // 指定河川名称
  "uro:depth"?: number; // 浸水深
  "uro:depth_uom"?: string; // 浸水深の単位
  "uro:duration"?: string; // 継続時間
  "uro:adminType"?: string; //
  "uro:scale"?: string; // 浸水規模
  "uro:rank"?: string; // 浸水ランク
  "uro:rank_code"?: string; // 浸水ランクコード
  "uro:rankOrg"?: string; // 浸水ランク（独自分類）
  "uro:rankOrg_code"?: string; // 浸水ランクコード（独自分類）
};

const dataTypeJa: Record<string, string> = {
  fld: "洪水",
  tnm: "津波",
  htd: "高潮",
  ifld: "内水",
};
