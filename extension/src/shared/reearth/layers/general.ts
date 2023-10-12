import { FC, useEffect, useMemo, useRef } from "react";

import { LayerType } from "../../../prototypes/layers";
import { LayerAppearance, MarkerAppearance } from "../types";
import { DataType } from "../types/layer";

export const GENERAL_FEATURE = "GENERAL_FEATURE";
declare module "../../../prototypes/screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [GENERAL_FEATURE]: {
      key: string;
      layerId: string;
      layerType: LayerType;
    };
  }
}

export type General = {};
export type GeneralFeature<P> = {
  properties: P;
};

export type GeneralProps = {
  url: string;
  format: DataType;
  onLoad?: (layerId: string) => void;
  pointColor?: string;
  pointSize?: string;
  show?: string | boolean;
  selectedFeatureColor?: string;
};

export const GeneralLayer: FC<GeneralProps> = ({
  url,
  format,
  onLoad,
  pointColor,
  pointSize,
  show,
}) => {
  const layerIdRef = useRef<string>();
  const pointAppearance: LayerAppearance<MarkerAppearance> | undefined = useMemo(
    () =>
      pointColor || pointSize
        ? {
            style: "point",
            ...(pointColor
              ? {
                  pointColor: {
                    expression: pointColor,
                  },
                }
              : {}),
            ...(pointSize
              ? {
                  pointSize: {
                    expression: pointSize,
                  },
                }
              : {}),
            show:
              typeof show === "string"
                ? {
                    expression: show,
                  }
                : show,
          }
        : undefined,
    [pointColor, pointSize, show],
  );

  useEffect(() => {
    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: {
        type: format,
        url,
      },
      ...(pointAppearance ? { marker: pointAppearance } : {}),
    });

    layerIdRef.current = layerId;

    setTimeout(() => {
      if (layerId) {
        onLoad?.(layerId);
      }
    }, 0);

    return () => {
      if (!layerId) return;
      window.reearth?.layers?.delete?.(layerId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;

    window.reearth?.layers?.override?.(layerId, {
      ...(pointAppearance ? { marker: pointAppearance } : {}),
    });
  }, [pointAppearance]);

  return null;
};
