import { DatasetFormat } from "../graphql/types/plateau";
import { DataType } from "../reearth/types/layer";

export const REEARTH_DATA_FORMATS: Record<DatasetFormat, DataType> = {
  [DatasetFormat.Cesium3Dtiles]: "3dtiles",
  [DatasetFormat.Csv]: "csv",
  [DatasetFormat.Czml]: "czml",
  [DatasetFormat.Geojson]: "geojson",
  [DatasetFormat.Gltf]: "gltf",
  [DatasetFormat.GtfsRealtime]: "gtfs",
  [DatasetFormat.Mvt]: "mvt",
  [DatasetFormat.Tiles]: "tiles",
  [DatasetFormat.Tms]: "tms",
  [DatasetFormat.Wms]: "wms",
};
