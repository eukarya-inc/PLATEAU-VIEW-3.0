import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import { FC, useCallback } from "react";

import { LayerType } from "../../prototypes/layers";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { GeneralProps, GeneralLayer, GENERAL_FEATURE } from "../reearth/layers";
import { Properties } from "../reearth/utils";
import { ComponentAtom } from "../view-layers/component";

import { useEvaluateGeneralAppearance } from "./hooks/useEvaluateGeneralAppearance";

type GeneralContainerProps = Omit<GeneralProps, "appearances"> & {
  id: string;
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<Properties | null>;
  selections?: ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[];
  hidden: boolean;
  type: LayerType;
  componentAtoms: ComponentAtom[] | undefined;
};

export const GeneralLayerContainer: FC<GeneralContainerProps> = ({
  id,
  onLoad,
  layerIdAtom,
  componentAtoms,
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
              datasetId: id,
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

  const generalAppearances = useEvaluateGeneralAppearance({ componentAtoms });
  const generalData = useEvaluateGeneralData({ componentAtoms });

  const theme = useTheme();

  return (
    <GeneralLayer
      {...props}
      onLoad={handleLoad}
      appearances={generalAppearances}
      visible={!hidden}
      selectedFeatureColor={theme.palette.primary.main}
    />
  );
};
