export const INDEPENDENT_COLOR_TYPE = {
  height: {
    id: "height",
    label: "高さによる塗分け",
    featurePropertyName: "計測高さ",
  },
  purpose: {
    id: "purpose",
    label: "用途による塗分け",
    featurePropertyName: "用途",
  },
  structure: {
    id: "structure",
    label: "建物構造による塗分け",
    featurePropertyName: "建物構造",
  },
  structureType: {
    id: "structureType",
    label: "構造種別による塗分け",
    featurePropertyName: "構造種別",
  },
  fireproof: {
    id: "fireproof",
    label: "耐火構造種別による塗分け",
    featurePropertyName: "耐火構造種別",
  },
};

export const LAND_SLIDE_RISK_FIELD = {
  steepSlope: {
    id: "steepSlope",
    label: "急傾斜による塗分け",
  },
  mudflow: {
    id: "mudflow",
    label: "土石流による塗分け",
  },
  landslide: {
    id: "landslide",
    label: "地すべりによる塗分け",
  },
};

export const LEGEND_IMAGES: Record<"floods", string> = {
  floods: "https://d2jfi34fqvxlsc.cloudfront.net/main/legends/waterfloodrank/2.png",
};
