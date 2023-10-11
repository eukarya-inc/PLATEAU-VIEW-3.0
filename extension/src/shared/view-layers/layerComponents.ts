// import { BridgeLayer } from "./BridgeLayer";
// import { HeatmapLayer } from "./HeatmapLayer";
// import { LandSlideRiskLayer } from "./LandSlideRiskLayer";
// import { LandUseLayer } from "./LandUseLayer";
import { type LayerComponents } from "../../prototypes/layers";
import {
  BORDER_LAYER,
  BRIDGE_LAYER,
  BUILDING_LAYER,
  CITY_FURNITURE_LAYER,
  EMERGENCY_ROUTE_LAYER,
  GENERIC_CITY_OBJECT_LAYER,
  HEATMAP_LAYER,
  HIGH_TIDE_RISK_LAYER,
  INLAND_FLOODING_RISK_LAYER,
  LAND_SLIDE_RISK_LAYER,
  LAND_USE_LAYER,
  LANDMARK_LAYER,
  PARK_LAYER,
  PEDESTRIAN_LAYER,
  RAILWAY_LAYER,
  RIVER_FLOODING_RISK_LAYER,
  ROAD_LAYER,
  SHELTER_LAYER,
  SKETCH_LAYER,
  STATION_LAYER,
  TSUNAMI_RISK_LAYER,
  URBAN_PLANNING_LAYER,
  USE_CASE_LAYER,
  VEGETATION_LAYER,
} from "../../prototypes/view-layers/layerTypes";

import { BuildingLayer, GeneralDatasetLayer } from ".";
// import { PedestrianLayer } from "./PedestrianLayer";
// import { RiverFloodingRiskLayer } from "./RiverFloodingRiskLayer";
// import { RoadLayer } from "./RoadLayer";
// import { SketchLayer } from "./SketchLayer";
// import { UrbanPlanningLayer } from "./UrbanPlanningLayer";

export const layerComponents: LayerComponents = {
  [HEATMAP_LAYER]: undefined, // HeatmapLayer,
  [PEDESTRIAN_LAYER]: undefined, // PedestrianLayer,
  [SKETCH_LAYER]: undefined, // SketchLayer,

  // Dataset layers
  [BORDER_LAYER]: GeneralDatasetLayer,
  [BRIDGE_LAYER]: GeneralDatasetLayer, // BridgeLayer,
  [BUILDING_LAYER]: BuildingLayer,
  [CITY_FURNITURE_LAYER]: GeneralDatasetLayer,
  [EMERGENCY_ROUTE_LAYER]: GeneralDatasetLayer,
  [GENERIC_CITY_OBJECT_LAYER]: GeneralDatasetLayer,
  [HIGH_TIDE_RISK_LAYER]: GeneralDatasetLayer,
  [INLAND_FLOODING_RISK_LAYER]: GeneralDatasetLayer,
  [LAND_USE_LAYER]: GeneralDatasetLayer, // LandUseLayer,
  [LANDMARK_LAYER]: GeneralDatasetLayer,
  [LAND_SLIDE_RISK_LAYER]: GeneralDatasetLayer, // LandSlideRiskLayer,
  [PARK_LAYER]: GeneralDatasetLayer,
  [RAILWAY_LAYER]: GeneralDatasetLayer,
  [RIVER_FLOODING_RISK_LAYER]: GeneralDatasetLayer, // RiverFloodingRiskLayer,
  [ROAD_LAYER]: GeneralDatasetLayer, // RoadLayer,
  [SHELTER_LAYER]: GeneralDatasetLayer,
  [STATION_LAYER]: GeneralDatasetLayer,
  [TSUNAMI_RISK_LAYER]: GeneralDatasetLayer,
  [URBAN_PLANNING_LAYER]: GeneralDatasetLayer, // UrbanPlanningLayer,
  [USE_CASE_LAYER]: GeneralDatasetLayer,
  [VEGETATION_LAYER]: GeneralDatasetLayer,
};
