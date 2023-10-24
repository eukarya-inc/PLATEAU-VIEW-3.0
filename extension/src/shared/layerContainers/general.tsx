import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import { FC, useCallback } from "react";

import { LayerType } from "../../prototypes/layers";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { useOptionalAtomValue } from "../hooks";
import { GeneralProps, GeneralLayer, GENERAL_FEATURE } from "../reearth/layers";
import { Properties } from "../reearth/utils";
import { WritableAtomForComponent } from "../view-layers/component";

type GeneralContainerProps = GeneralProps & {
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<Properties | null>;
  pointColorAtom?: WritableAtomForComponent<string>;
  pointSizeAtom?: WritableAtomForComponent<number>;
  selections?: ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[];
  hidden: boolean;
  type: LayerType;
};

export const GeneralLayerContainer: FC<GeneralContainerProps> = ({
  onLoad,
  layerIdAtom,
  pointColorAtom,
  pointSizeAtom,
  propertiesAtom,
  hidden,
  ...props
}) => {
  const [layerId, setLayerId] = useAtom(layerIdAtom);

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
    (layerId: string) => {
      onLoad?.(layerId);
      setLayerId(layerId);
      setProperties(new Properties(layerId));
    },
    [onLoad, setProperties, setLayerId],
  );

  const pointColor = useOptionalAtomValue(pointColorAtom);
  const pointSize = useOptionalAtomValue(pointSizeAtom);

  const theme = useTheme();

  return (
    <GeneralLayer
      {...props}
      onLoad={handleLoad}
      pointColor={pointColor}
      pointSize={JSON.stringify(pointSize)}
      visible={!hidden}
      selectedFeatureColor={theme.palette.primary.main}
    />
  );
};
