import { ActionType } from "../../types";

export { getAttributes, getRootFields } from "./attributes";

export function postMsg(action: ActionType, payload?: any) {
  if (parent === window) return;
  parent.postMessage({
    action,
    payload,
  });
}

// hard code common properties
export const commonPropertiesMap: { [key: string]: string[] } = {
  // 建築物モデル
  bldg: [
    "gml_id", // 建物ID
    "名称",
    "分類",
    "用途",
    "住所",
    "建築年",
    "計測高さ",
    "地上階数",
    "地下階数",
    "敷地面積",
    "延床面積",
    "構造種別",
    "構造種別（自治体独自）",
    "耐火構造種別",
    "都市計画区域",
    "区域区分",
    "地域地区",
    "調査年",
    "建物利用現況（大分類）",
    "建物利用現況（中分類）",
    "建物利用現況（小分類）",
    "建物利用現況（詳細分類）",
    "建物ID",
    "図上面積",
    "LOD1立ち上げに使用する高さ",
    // "土砂災害警戒区域",
  ],
  // 都市計画決定情報
  urf: ["gml_id", "feature_type", "feature_type_jp", "function_code", "function"],
  // 洪水浸水想定区域
  fld: ["gml_id", "name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 高潮浸水想定区域
  htd: ["gml_id", "name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 津波浸水想定区域
  tnm: ["gml_id", "name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 内水浸水想定区域
  ifld: ["gml_id", "name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 道路
  tran: ["gml_id"],
  // 都市設備
  frn: ["gml_id"],
  // 植生
  veg: ["gml_id"],
  // 土地利用
  luse: ["gml_id"],
  // 土砂災害警戒区域
  lsld: ["gml_id"],
};

export const cesium3DTilesAppearanceKeys: string[] = [
  "tileset",
  "show",
  "color",
  "pointSize",
  "styleUrl",
  "shadows",
  "colorBlendMode",
  "edgeWidth",
  "edgeColor",
  "experimental_clipping",
];
