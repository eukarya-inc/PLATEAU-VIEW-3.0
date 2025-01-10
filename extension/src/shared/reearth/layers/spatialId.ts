import { FC, useMemo } from "react";

import { SpatialIdFeature } from "../../spatialId";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";
import { SpatialIdSpaceData } from "../types/reearthPluginAPIv2/spatialId";

export type SpatialIdLayerProps = {
  features: SpatialIdFeature[];
  appearances: Partial<LayerAppearanceTypes>;
  visible?: boolean;
  onLoad?: (layerId: string) => void;
};

export const SpatialIdLayer: FC<SpatialIdLayerProps> = ({
  features,
  appearances,
  visible,
  onLoad,
}) => {
  const data: Data = useMemo(() => {
    const geojsonFeatures = [];
    for (const feature of features) {
      const { coordinates, height, extrudedHeight } = getRectangeParamsFromSpace(feature.data);
      geojsonFeatures.push({
        type: "Feature",
        id: feature.id,
        properties: {
          id: feature.id,
          height,
          extrudedHeight,
        },
        geometry: {
          coordinates,
          type: "Polygon",
        },
      });
    }
    return {
      type: "geojson",
      value: {
        type: "FeatureCollection",
        features: geojsonFeatures,
      },
    };
  }, [features]);

  useLayer({
    data,
    visible,
    appearances,
    onLoad,
  });

  return null;
};

const getRectangeParamsFromSpace = (space: SpatialIdSpaceData) => {
  const vertices = space.vertices;
  const wsen: [number, number, number, number] = [
    vertices[0][0],
    vertices[1][1],
    vertices[2][0],
    vertices[3][1],
  ];
  const coordinates = [
    [
      [vertices[0][0], vertices[0][1]],
      [vertices[1][0], vertices[1][1]],
      [vertices[2][0], vertices[2][1]],
      [vertices[3][0], vertices[3][1]],
      [vertices[0][0], vertices[0][1]],
    ],
  ];

  const height = vertices[0][2];
  const extrudedHeight = vertices[4][2];
  return { wsen, coordinates, height, extrudedHeight };
};
