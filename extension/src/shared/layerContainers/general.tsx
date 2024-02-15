import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import { FC, useCallback, useEffect, useRef } from "react";

import { LayerType } from "../../prototypes/layers";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { useOptionalPrimitiveAtom } from "../hooks";
import { GeneralProps, GeneralLayer, GENERAL_FEATURE, GTFSLayer } from "../reearth/layers";
import { MVTLayer } from "../reearth/layers/mvt";
import { WMSLayer } from "../reearth/layers/wms";
import { CameraPosition } from "../reearth/types";
import { Properties } from "../reearth/utils";
import { ComponentAtom } from "../view-layers/component";

import { useEvaluateGeneralAppearance } from "./hooks/useEvaluateGeneralAppearance";
import { useEvaluateGeneralData } from "./hooks/useEvaluateGeneralData";

type GeneralContainerProps = Omit<GeneralProps, "appearances" | "appendData"> & {
  id: string;
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<Properties | null>;
  selections?: ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[];
  hidden: boolean;
  type: LayerType;
  componentAtoms: ComponentAtom[] | undefined;
  layers?: string[];
  cameraAtom?: PrimitiveAtom<CameraPosition | undefined>;
  index?: number;
};

export const GeneralLayerContainer: FC<GeneralContainerProps> = ({
  id,
  onLoad,
  layerIdAtom,
  componentAtoms,
  propertiesAtom,
  hidden,
  format,
  cameraAtom,
  index,
  ...props
}) => {
  const [layerId, setLayerId] = useAtom(layerIdAtom);
  const [, setCamera] = useAtom(useOptionalPrimitiveAtom(cameraAtom));

  useScreenSpaceSelectionResponder({
    type: GENERAL_FEATURE,
    convertToSelection: object => {
      return "id" in object &&
        typeof object.id === "string" &&
        layerId &&
        "layerId" in object &&
        object.layerId === layerId
        ? {
            type: GENERAL_FEATURE,
            value: {
              key: object.id,
              layerId,
              layerType: props.type,
              datasetId: id,
              properties: "properties" in object ? object.properties : undefined,
            },
          }
        : undefined;
    },
    shouldRespondToSelection: (
      value,
    ): value is ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE> => {
      return value.type === GENERAL_FEATURE && !!value.value && value.value.layerId === layerId;
    },
    // computeBoundingSphere: (value, result = new BoundingSphere()) => {
    //   computeCartographicToCartesian(scene, location, result.center);
    //   result.radius = 200; // Arbitrary size
    //   return result;
    // },
  });

  const setProperties = useSetAtom(propertiesAtom);
  const handleLoad = useCallback(
    (layerId: string, camera?: CameraPosition) => {
      onLoad?.(layerId);
      setLayerId(layerId);
      setProperties(new Properties(layerId));
      if (camera) {
        setCamera(camera);
      }
    },
    [onLoad, setLayerId, setProperties, setCamera],
  );

  const generalAppearances = useEvaluateGeneralAppearance({ componentAtoms });
  const generalData = useEvaluateGeneralData({ componentAtoms });
  const theme = useTheme();

  const prevIndexRef = useRef<number>();

  useEffect(() => {
    if (layerId && index !== undefined) {
      if (prevIndexRef.current !== undefined && index < prevIndexRef.current) {
        window.reearth?.layers?.bringToFront?.(layerId);
      }
      prevIndexRef.current = index;
    }
  }, [index, layerId]);

  if (format === "gtfs") {
    return (
      <GTFSLayer
        {...props}
        onLoad={handleLoad}
        appearances={generalAppearances}
        visible={!hidden}
      />
    );
  }

  if (format === "mvt") {
    return (
      <MVTLayer {...props} onLoad={handleLoad} appearances={generalAppearances} visible={!hidden} />
    );
  }

  if (format === "wms") {
    return (
      <WMSLayer {...props} onLoad={handleLoad} appearances={generalAppearances} visible={!hidden} />
    );
  }

  return (
    <GeneralLayer
      {...props}
      format={format}
      onLoad={handleLoad}
      appearances={generalAppearances}
      appendData={generalData}
      visible={!hidden}
      selectedFeatureColor={theme.palette.primary.main}
    />
  );
};
