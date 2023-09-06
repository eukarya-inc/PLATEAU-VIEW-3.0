import { PrimitiveAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect, useMemo } from "react";

import { TilesetLayer } from "../../shared/reearth/layers/3dtiles";
import { LayerProps } from "../layers";

import {
  PlateauTilesetLayerState,
  PlateauTilesetLayerStateParams,
  createPlateauTilesetLayerState,
} from "./createPlateauTilesetLayerState";
import { ViewLayerModel, ViewLayerModelParams, createViewLayerModel } from "./createViewLayerModel";
import { BUILDING_LAYER } from "./layerTypes";
import { ConfigurableLayerModel } from "./types";

export interface BuildingLayerModelParams
  extends ViewLayerModelParams,
    PlateauTilesetLayerStateParams {
  municipalityCode: string;
  version?: string;
  lod?: number;
  textured?: boolean;
}

export interface BuildingLayerModel extends ViewLayerModel, PlateauTilesetLayerState {
  municipalityCode: string;
  versionAtom: PrimitiveAtom<string | null>;
  lodAtom: PrimitiveAtom<number | null>;
  texturedAtom: PrimitiveAtom<boolean | null>;
  showWireframeAtom: PrimitiveAtom<boolean>;
}

export function createBuildingLayer(
  params: BuildingLayerModelParams,
): ConfigurableLayerModel<BuildingLayerModel> {
  return {
    ...createViewLayerModel(params),
    ...createPlateauTilesetLayerState(params),
    type: BUILDING_LAYER,
    municipalityCode: params.municipalityCode,
    versionAtom: atom(params.version ?? null),
    lodAtom: atom(params.lod ?? null),
    texturedAtom: atom(params.textured ?? null),
    showWireframeAtom: atom(false),
  };
}

// TODO(ReEarth): Support GraphQL
// function matchDatum(
//   data: readonly PlateauBuildingDatasetDatum[],
//   predicate: {
//     version: string | null;
//     lod: number | null;
//     textured: boolean | null;
//   },
// ): PlateauBuildingDatasetDatum | undefined {
//   const version = predicate.version ?? "2020";
//   const lod = predicate.lod ?? 2;
//   const textured = predicate.textured ?? false;
//   const sorted = [...data].sort((a, b) =>
//     a.version !== b.version
//       ? a.version === version
//         ? -1
//         : 1
//       : a.lod !== b.lod
//       ? a.lod === lod
//         ? -1
//         : 1
//       : a.textured !== b.textured
//       ? a.textured === textured
//         ? -1
//         : 1
//       : 0,
//   );
//   return sorted[0];
// }

const mockData = [
  {
    municipalityCode: "13101",
    municipalityName: "東京都 千代田区",
    format: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/ca/ee4cb0-9ce4-4f6c-bca1-9c7623e84cb1/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13101_chiyoda-ku_lod2_no_texture/tileset.json",
    version: "2022",
    textured: false,
    lod: 2,
  },
  {
    municipalityCode: "13102",
    municipalityName: "東京都 中央区",
    format: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/4a/30f295-cd07-46b0-b0ab-4a4b1b3af06b/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13102_chuo-ku_lod2_no_texture/tileset.json",
    version: "2022",
    textured: false,
    lod: 2,
  },
];
const findMockData = (municipalityCode: string) => {
  const v = mockData.find(v => v.municipalityCode === municipalityCode);
  return v as (typeof mockData)[number];
};

export const BuildingLayer: FC<LayerProps<typeof BUILDING_LAYER>> = ({
  titleAtom,
  hiddenAtom,
  layerIdAtom,
  municipalityCode,
  versionAtom,
  lodAtom,
  texturedAtom,
  // featureIndexAtom,
  // hiddenFeaturesAtom,
  // propertiesAtom,
  // colorPropertyAtom,
  // colorSchemeAtom,
  // opacityAtom,
  // showWireframeAtom,
}) => {
  // const query = useMunicipalityDatasetsQuery({
  //   variables: {
  //     municipalityCode,
  //     includeTypes: [PlateauDatasetType.Building],
  //   },
  // });
  // const municipality = query.data?.municipality;
  // const municipalityName = useMunicipalityName(municipality);
  const mockData = findMockData(municipalityCode);
  const municipalityName = mockData.municipalityName;
  const setTitle = useSetAtom(titleAtom);
  useEffect(() => {
    setTitle(municipalityName ?? null);
  }, [municipalityName, setTitle]);

  const hidden = useAtomValue(hiddenAtom);
  // const scene = useCesium(({ scene }) => scene);
  // scene.requestRender();

  // useEffect(() => {
  //   return () => {
  //     if (!scene.isDestroyed()) {
  //       scene.requestRender();
  //     }
  //   };
  // }, [scene]);

  const [_version, setVersion] = useAtom(versionAtom);
  const [_lod, setLod] = useAtom(lodAtom);
  const [_textured, setTextured] = useAtom(texturedAtom);
  const datum = useMemo(() => {
    // const data = (
    //   query.data?.municipality?.datasets as PlateauBuildingDataset[] | undefined
    // )?.flatMap(({ data }) => data);
    // if (data == null || data.length === 0) {
    //   return;
    // }
    // return matchDatum(data, {
    //   version,
    //   lod,
    //   textured,
    // });
    return {
      ...mockData,
    };
  }, [mockData]); // [version, lod, textured, query.data]);

  const setLayerId = useSetAtom(layerIdAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      setLayerId(layerId);
    },
    [setLayerId],
  );

  useEffect(() => {
    if (datum == null) {
      return;
    }
    setVersion(datum.version);
    setLod(datum.lod);
    setTextured(datum.textured);
  }, [setVersion, setLod, setTextured, datum]);

  // TODO(ReEarth): Need a wireframe API
  // const showWireframe = useAtomValue(showWireframeAtom);

  if (hidden || datum == null) {
    return null;
  }
  // TODO(ReEarth): Use GQL definition
  if (datum.format === "3dtiles" /* PlateauDatasetFormat.Cesium3DTiles */) {
    return (
      <TilesetLayer
        url={datum.url}
        onLoad={handleLoad}
        // component={PlateauBuildingTileset}
        // featureIndexAtom={featureIndexAtom}
        // hiddenFeaturesAtom={hiddenFeaturesAtom}
        // propertiesAtom={propertiesAtom}
        // colorPropertyAtom={colorPropertyAtom}
        // colorSchemeAtom={colorSchemeAtom}
        // opacityAtom={opacityAtom}
        // showWireframe={showWireframe}
      />
    );
  }
  return null;
};
