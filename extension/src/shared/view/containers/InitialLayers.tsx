import { useAtomValue } from "jotai";
import { useEffect, type FC, useMemo, useRef } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { PlateauDatasetType } from "../../../prototypes/view/constants/plateau";
import { MY_DATA_LAYER, PEDESTRIAN_LAYER } from "../../../prototypes/view-layers";
import { useDatasets } from "../../graphql";
import { DatasetItem, DatasetsInput } from "../../graphql/types/catalog";
import { settingsAtom } from "../../states/setting";
import { templatesAtom } from "../../states/template";
import {
  createRootLayerForDatasetAtom,
  createRootLayerForLayerAtom,
} from "../../view-layers/rootLayer";

export const InitialLayers: FC = () => {
  const addLayer = useAddLayer();

  const initialDatasetInput: DatasetsInput = useMemo(
    () => ({
      areaCodes: ["13101", "13102"],
      includeTypes: [PlateauDatasetType.Building],
      year: 2022,
    }),
    [],
  );
  const query = useDatasets(initialDatasetInput);
  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const initialDatasets = useMemo(() => query.data?.datasets ?? [], [query]);

  // TODO: Get share ID
  const shareId = undefined;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const templatesRef = useRef(templates);
  templatesRef.current = templates;
  useEffect(() => {
    if (query.loading) return;

    const remove = [
      ...initialDatasets.map(d => {
        const dataList = d.items as DatasetItem[];
        return addLayer(
          createRootLayerForDatasetAtom({
            dataset: d,
            areaCode: d.wardCode || d.cityCode || d.prefectureCode,
            currentDataId: dataList.find(v => v.name === "LOD2（テクスチャなし）")?.id,
            settings: settingsRef.current.filter(s => s.datasetId === d.id),
            templates: templatesRef.current,
            shareId,
          }),
          { autoSelect: false },
        );
      }),
      addLayer(
        createRootLayerForLayerAtom({
          type: PEDESTRIAN_LAYER,
          location: {
            longitude: 139.769,
            latitude: 35.68,
          },
        }),
        { autoSelect: false },
      ),
      addLayer(
        createRootLayerForLayerAtom({
          title: "3dtile",
          format: "3dtiles",
          type: MY_DATA_LAYER,
          url: "https://assets.cms.plateau.reearth.io/assets/a7/862f0f-1626-4793-98a1-0d08384d7f34/40130_fukuoka-shi_2022_3dtiles_1_0_bldg_40132_hakata-ku_lod1/tileset.json",
        }),
        { autoSelect: false },
      ),
    ];
    return () => {
      remove.forEach(remove => {
        remove();
      });
    };
  }, [addLayer, initialDatasets, shareId, query.loading]);

  return null;
};
