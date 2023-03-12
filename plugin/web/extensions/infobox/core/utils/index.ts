import { ActionType } from "../../types";

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
    "gml_id",
    "名称",
    "用途",
    "住所",
    "地上階数",
    "地下階数",
    "建築年",
    "計測高さ",
    "建物利用現況（大分類）",
    "建物利用現況（中分類）",
    "建物利用現況（小分類）",
    "建物利用現況（詳細分類）",
    "構造種別",
    "構造種別（独自）",
    "耐火構造種別",
  ],
  // 都市計画決定情報
  urf: ["gml_id", "feature_type", "feature_type_jp", "function_code", "function"],
  // 洪水浸水想定区域
  fld: ["name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 高潮浸水想定区域
  htd: ["name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 津波浸水想定区域
  tnm: ["name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 内水浸水想定区域
  ifld: ["name", "rank", "rank_code", "rank_org", "rank_org_code"],
  // 道路
  tran: [],
  // 都市設備
  frn: [],
  // 植生
  veg: [],
  // 土地利用
  luse: [],
  // 土砂災害警戒区域
  lsld: [],
};

export const cesium3DTilesAppearanceKeys: string[] = [
  "tileset",
  "show",
  "color",
  "styleUrl",
  "shadows",
  "colorBlendMode",
  "edgeWidth",
  "edgeColor",
  "experimental_clipping",
];
