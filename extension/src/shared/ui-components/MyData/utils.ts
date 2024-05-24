export const getAdditionalData = (content: string | undefined | null, format: string) => {
  if (!content) return undefined;
  if (format === "csv") {
    const header = content.split(/\r\n|\n/)[0];
    const cols = header.split(",");
    const latColumn = cols.find(col =>
      ["latitude", "lat", "緯度", "北緯"].includes(col.toLowerCase()),
    );
    const lngColumn = cols.find(col =>
      ["longitude", "lng", "lon", "経度", "東経"].includes(col.toLowerCase()),
    );
    const heightColumn = cols.find(col =>
      ["height", "altitude", "alt", "高度"].includes(col.toLowerCase()),
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
  return format === "kml" || format === "kmz" || format === "KML" || format === "KMZ"
    ? "KML形式のファイルに日本語が含まれている場合、表示できない場合があります。"
    : undefined;
};

export const decodeDataURL = (dataUrl: string) => {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  return atob(dataUrl.split(",")[1]);
};
