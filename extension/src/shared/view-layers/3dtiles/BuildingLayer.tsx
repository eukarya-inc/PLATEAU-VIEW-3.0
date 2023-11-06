import { PrimitiveAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect } from "react";

import type { LayerProps } from "../../../prototypes/layers";
import { ScreenSpaceSelectionEntry } from "../../../prototypes/screen-space-selection";
import {
  createViewLayerModel,
  BUILDING_LAYER,
  ConfigurableLayerModel,
} from "../../../prototypes/view-layers";
import { TilesetLayerContainer } from "../../layerContainers/3dtiles";
import { TILESET_FEATURE } from "../../reearth/layers";
import { TILESET_BUILDING_MODEL_COLOR } from "../../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../../types/fieldComponents/general";
import { useFindComponent } from "../hooks";
import { LayerModel, LayerModelParams } from "../model";

import {
  PlateauTilesetLayerState,
  PlateauTilesetLayerStateParams,
  createPlateauTilesetLayerState,
} from "./createPlateauTilesetLayerState";

export interface BuildingLayerModelParams extends LayerModelParams, PlateauTilesetLayerStateParams {
  municipalityCode: string;
  title: string;
  version?: string;
  lod?: number;
  textured: boolean;
}

export interface BuildingLayerModel extends LayerModel, PlateauTilesetLayerState {
  municipalityCode: string;
  title: string;
  versionAtom: PrimitiveAtom<string | null>;
  lodAtom: PrimitiveAtom<number | null>;
  showWireframeAtom: PrimitiveAtom<boolean>;
  textured: boolean;
}

export function createBuildingLayer(
  params: BuildingLayerModelParams,
): ConfigurableLayerModel<BuildingLayerModel> {
  return {
    ...createViewLayerModel(params),
    ...createPlateauTilesetLayerState(params),
    type: BUILDING_LAYER,
    textured: params.textured,
    municipalityCode: params.municipalityCode,
    title: params.title,
    versionAtom: atom(params.version ?? null),
    lodAtom: atom(params.lod ?? null),
    showWireframeAtom: atom(false),
  };
}

export const BuildingLayer: FC<LayerProps<typeof BUILDING_LAYER>> = ({
  format,
  url,
  title,
  textured,
  titleAtom,
  hiddenAtom,
  layerIdAtom,
  versionAtom,
  lodAtom,
  featureIndexAtom,
  selections,
  // hiddenFeaturesAtom,
  propertiesAtom,
  colorPropertyAtom,
  colorSchemeAtom,
  colorMapAtom,
  colorRangeAtom,
  componentAtoms,
  // showWireframeAtom,
}) => {
  const hidden = useAtomValue(hiddenAtom);

  const [_version, _setVersion] = useAtom(versionAtom);
  const [_lod, _setLod] = useAtom(lodAtom);

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

  // Field components
  const opacityAtom = useFindComponent<typeof OPACITY_FIELD>(componentAtoms ?? [], OPACITY_FIELD);
  const buildingModelColorAtom = useFindComponent<typeof TILESET_BUILDING_MODEL_COLOR>(
    componentAtoms ?? [],
    TILESET_BUILDING_MODEL_COLOR,
  );

  if (!url) {
    return null;
  }
  // TODO(ReEarth): Use GQL definition
  if (format === "3dtiles" /* PlateauDatasetFormat.Cesium3DTiles */) {
    return (
      <TilesetLayerContainer
        url={url}
        onLoad={handleLoad}
        layerIdAtom={layerIdAtom}
        hidden={hidden}
        textured={textured}
        // component={PlateauBuildingTileset}
        featureIndexAtom={featureIndexAtom}
        // hiddenFeaturesAtom={hiddenFeaturesAtom}
        propertiesAtom={propertiesAtom}
        colorPropertyAtom={colorPropertyAtom}
        colorSchemeAtom={colorSchemeAtom}
        colorMapAtom={colorMapAtom}
        colorRangeAtom={colorRangeAtom}
        selections={selections as ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[]}
        // showWireframe={showWireframe}

        // Field components
        opacityAtom={opacityAtom}
        buildingModelColorAtom={buildingModelColorAtom}
      />
    );
  }
  return null;
};
