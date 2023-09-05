import { FC, useEffect } from "react";

export type Tileset = {};
export type TilesetFeature<P> = {
  properties: P;
};

export type Props = {
  url: string;
  onLoad?: (layerId: string) => void;
};

export const TilesetLayer: FC<Props> = ({ url, onLoad }) => {
  useEffect(() => {
    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: {
        type: "3dtiles",
        url,
      },
      "3dtiles": {},
    });

    setTimeout(() => {
      if (layerId) {
        onLoad?.(layerId);
      }
    }, 0);

    return () => {
      if (!layerId) return;
      window.reearth?.layers?.delete?.(layerId);
    };
  }, [url, onLoad]);

  return null;
};
