export const getAdditionalData = (
  content: string | undefined | null,
  format: string
) => {
  if (!content) return undefined;
  if (format === "csv") {
    const header = content.split(/\r\n|\n/)[0];
    const cols = header.split(",");
    const latColumn = cols.find((col) =>
      ["latitude", "lat", "緯度", "北緯"].includes(col.toLowerCase())
    );
    const lngColumn = cols.find((col) =>
      ["longitude", "lng", "lon", "経度", "東経"].includes(col.toLowerCase())
    );
    const heightColumn = cols.find((col) =>
      ["height", "altitude", "alt", "高度"].includes(col.toLowerCase())
    );
    if (!latColumn || !lngColumn) return undefined;
    return {
      data: {
        csv: {
          latColumn,
          lngColumn,
          heightColumn,
          noHeader: false,
        },
      },
    };
  }
  return undefined;
};

export const getFormatTip = (format: string) => {
  const fm = format.toLowerCase();

  if (fm === "kml" || fm === "kmz") {
    return "KML形式のファイルに日本語が含まれている場合、表示できない場合があります。";
  } else if (fm === "geojson") {
    return "文字コードがUTF-8（BOM無し）のファイルに対応。ファイルサイズは1MB程度を推奨。大容量だと読み込めない、もしくは属性情報が文字化けします。";
  } else if (fm === "czml") {
    return "czml参照先データ込みで10MB以内を推奨。ファイルサイズが大きいと読み込みに時間がかかります。";
  }

  return undefined;
};

export const decodeDataURL = (dataUrl: string) => {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  return atob(dataUrl.split(",")[1]);
};
