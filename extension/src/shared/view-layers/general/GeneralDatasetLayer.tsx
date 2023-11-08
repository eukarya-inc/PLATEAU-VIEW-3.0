import { PrimitiveAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect, useMemo } from "react";

import type { LayerProps } from "../../../prototypes/layers";
import { ScreenSpaceSelectionEntry } from "../../../prototypes/screen-space-selection";
import { createViewLayerModel, ConfigurableLayerModel } from "../../../prototypes/view-layers";
import { GeneralLayerContainer } from "../../layerContainers/general";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Events } from "../../reearth/types";
import { Properties } from "../../reearth/utils";
import { findRootLayerAtom } from "../../states/rootLayer";
import { LayerModel, LayerModelParams } from "../model";

import { GENERAL_FORMAT } from "./format";
import { GeneralLayerType } from "./types";

export interface GeneralLayerModelParams extends LayerModelParams {
  municipalityCode: string;
  title: string;
  version?: string;
  type: GeneralLayerType;
}

export interface GeneralLayerModel extends LayerModel {
  municipalityCode: string;
  title: string;
  versionAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<Properties | null>;
}

export function createGeneralDatasetLayer(
  params: GeneralLayerModelParams,
): ConfigurableLayerModel<GeneralLayerModel> {
  return {
    ...createViewLayerModel(params),
    type: params.type,
    municipalityCode: params.municipalityCode,
    title: params.title,
    versionAtom: atom(params.version ?? null),
    propertiesAtom: atom<Properties | null>(null),
  };
}

export const GeneralDatasetLayer: FC<LayerProps<GeneralLayerType>> = ({
  id,
  format,
  url,
  type,
  title,
  titleAtom,
  hiddenAtom,
  layerIdAtom,
  versionAtom,
  selections,
  propertiesAtom,
  componentAtoms,
  // showWireframeAtom,
}) => {
  const hidden = useAtomValue(hiddenAtom);

  const [_version, _setVersion] = useAtom(versionAtom);

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

  const findRootLayer = useSetAtom(findRootLayerAtom);
  const rootLayer = findRootLayer(id);
  const general = rootLayer?.general;
  const events: Events | undefined = useMemo(
    () =>
      general?.featureClickEvent?.eventType === "openNewTab"
        ? {
            select: {
              openUrl: {
                ...(general.featureClickEvent.urlType === "manual"
                  ? { url: general.featureClickEvent.websiteURL }
                  : { urlKey: general.featureClickEvent.fieldName }),
              },
            },
          }
        : undefined,
    [general?.featureClickEvent],
  );
  const updateInterval = useMemo(
    () =>
      general?.dataFetching?.enabled
        ? (general?.dataFetching?.timeInterval ?? 0) * 1000
        : undefined,
    [general?.dataFetching],
  );

  // useEffect(() => {
  //   if (datum == null) {
  //     return;
  //   }
  //   setVersion(datum.version);
  //   setLod(datum.lod);
  //   setTextured(datum.textured);
  // }, [setVersion, setLod, setTextured, datum]);

  // TODO(ReEarth): Need a wireframe API
  // const showWireframe = useAtomValue(showWireframeAtom);

  if (!url) {
    return null;
  }
  if (format && GENERAL_FORMAT.includes(format)) {
    return (
      <GeneralLayerContainer
        id={id}
        url={url}
        format={format}
        type={type}
        onLoad={handleLoad}
        layerIdAtom={layerIdAtom}
        hidden={hidden}
        // component={PlateauBuildingTileset}
        // hiddenFeaturesAtom={hiddenFeaturesAtom}
        propertiesAtom={propertiesAtom}
        selections={selections as ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[]}
        componentAtoms={componentAtoms}
        events={events}
        updateInterval={updateInterval}
        // showWireframe={showWireframe}
      />
    );
  }
  return null;
};
