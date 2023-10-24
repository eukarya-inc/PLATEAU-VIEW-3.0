import { PrimitiveAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect } from "react";

import type { LayerProps } from "../../../prototypes/layers";
import { ScreenSpaceSelectionEntry } from "../../../prototypes/screen-space-selection";
import { createViewLayerModel, ConfigurableLayerModel } from "../../../prototypes/view-layers";
import { POINT_COLOR_FIELD, POINT_SIZE_FIELD } from "../../api/types/fields/point";
import { GeneralLayerContainer } from "../../layerContainers/general";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Properties } from "../../reearth/utils";
import { useFindComponent } from "../hooks";
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

  const pointColorAtom = useFindComponent<typeof POINT_COLOR_FIELD>(
    componentAtoms ?? [],
    POINT_COLOR_FIELD,
  );
  const pointSizeAtom = useFindComponent<typeof POINT_SIZE_FIELD>(
    componentAtoms ?? [],
    POINT_SIZE_FIELD,
  );

  if (!url) {
    return null;
  }
  // TODO(ReEarth): Use GQL definition
  if (format && GENERAL_FORMAT.includes(format)) {
    return (
      <GeneralLayerContainer
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
        pointColorAtom={pointColorAtom}
        pointSizeAtom={pointSizeAtom}
        // showWireframe={showWireframe}
      />
    );
  }
  return null;
};
