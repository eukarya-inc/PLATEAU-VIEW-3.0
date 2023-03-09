import { ActionType } from "../../types";

export function postMsg(action: ActionType, payload?: any) {
  if (parent === window) return;
  parent.postMessage({
    action,
    payload,
  });
}

// hard code common properties
export const commonProperties: string[] = [
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
];

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
