import { PrimitiveAtom, atom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect } from "react";

import type { LayerProps } from "../../../prototypes/layers";
import { ScreenSpaceSelectionEntry } from "../../../prototypes/screen-space-selection";
import {
  createViewLayerModel,
  ConfigurableLayerModel,
  MY_DATA_LAYER,
} from "../../../prototypes/view-layers";
import { MyDataLayerContainer } from "../../layerContainers/myData";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Properties } from "../../reearth/utils";
import { LayerModel, LayerModelParams } from "../model";

import { MY_DATA_SUPPORTED_FORMAT } from "./format";

export interface MyDataLayerModelParams extends LayerModelParams {
  title: string;
}

export interface MyDataLayerModel extends LayerModel {
  title: string;
  propertiesAtom: PrimitiveAtom<Properties | null>;
}

export function createMyDataLayer(
  params: MyDataLayerModelParams,
): ConfigurableLayerModel<MyDataLayerModel> {
  return {
    ...createViewLayerModel(params),
    type: MY_DATA_LAYER,
    title: params.title,
    url: params.url,
    format: params.format as (typeof MY_DATA_SUPPORTED_FORMAT)[number],
    propertiesAtom: atom<Properties | null>(null),
  };
}

export const MyDataLayer: FC<LayerProps<typeof MY_DATA_LAYER>> = ({
  id,
  format,
  url,
  type,
  title,
  layers,
  titleAtom,
  hiddenAtom,
  layerIdAtom,
  selections,
  propertiesAtom,
  cameraAtom,
}) => {
  const hidden = useAtomValue(hiddenAtom);

  const setLayerId = useSetAtom(layerIdAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      setLayerId(layerId);
    },
    [setLayerId],
  );

  const setTitle = useSetAtom(titleAtom);
  useEffect(() => {
    setTitle(title ?? null);
  }, [title, setTitle]);

  if (!url) {
    return null;
  }
  if (format && MY_DATA_SUPPORTED_FORMAT.includes(format)) {
    return (
      <MyDataLayerContainer
        id={id}
        url={url}
        format={format}
        layers={layers}
        type={type}
        onLoad={handleLoad}
        layerIdAtom={layerIdAtom}
        cameraAtom={cameraAtom}
        hidden={hidden}
        propertiesAtom={propertiesAtom}
        selections={selections as ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[]}
      />
    );
  }
  return null;
};