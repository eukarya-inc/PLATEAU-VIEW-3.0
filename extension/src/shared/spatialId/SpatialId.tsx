import { PrimitiveAtom, useAtomValue } from "jotai";
import { FC, useMemo } from "react";

import { SpatialIdLayer } from "../reearth/layers/spatialId";
import { LayerAppearanceTypes } from "../reearth/types";

import { SpatialIdObject } from "./SpatialIdObject";
import { SpatialIdFeature } from "./types";

export interface SpatialIdProps {
  featuresAtom: PrimitiveAtom<SpatialIdFeature[]>;
  onLoad: (layerId: string) => void;
}

export const SpatialId: FC<SpatialIdProps> = ({ featuresAtom, onLoad }) => {
  const features = useAtomValue(featuresAtom);

  const appearances: Partial<LayerAppearanceTypes> = useMemo(
    () => ({
      polygon: {
        classificationType: "terrain",
        stroke: true,
        strokeColor: "#00bebe",
        fill: true,
        fillColor: "#00bebe33",
        heightReference: "none",
        hideIndicator: true,
        selectedFeatureColor: "#00bebe99",
        height: {
          expression: "${height}",
        },
        extrudedHeight: {
          expression: "${extrudedHeight}",
        },
      },
    }),
    [],
  );

  return (
    <>
      {features.map((feature, i) => (
        <SpatialIdObject key={i} id={feature.id} />
      ))}
      <SpatialIdLayer features={features} appearances={appearances} onLoad={onLoad} />
    </>
  );
};
