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
  LANDMARK_LAYER,
  LAND_SLIDE_RISK_LAYER,
  LAND_USE_LAYER,
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
} from "../../prototypes/view-layers";

import { BuildingLayerModel } from "./3dtiles";
import { GeneralLayerModel } from "./general";

export interface LayerModelOverrides {
  [HEATMAP_LAYER]: never; // HeatmapLayerModel;
  [PEDESTRIAN_LAYER]: never; // PedestrianLayerModel;
  [SKETCH_LAYER]: never; // SketchLayerModel;

  // Dataset layers
  [BORDER_LAYER]: GeneralLayerModel; // BorderLayerModel
  [BRIDGE_LAYER]: GeneralLayerModel; // BridgeLayerModel;
  [BUILDING_LAYER]: BuildingLayerModel;
  [CITY_FURNITURE_LAYER]: GeneralLayerModel; // CityFurnitureLayerModel
  [EMERGENCY_ROUTE_LAYER]: GeneralLayerModel; // EmergencyRouteLayerModel
  [GENERIC_CITY_OBJECT_LAYER]: GeneralLayerModel; // GenericLayerModel
  [HIGH_TIDE_RISK_LAYER]: GeneralLayerModel; // HighTideRiskLayerModel
  [INLAND_FLOODING_RISK_LAYER]: GeneralLayerModel; // InlandFloodingRiskLayerModel
  [LAND_USE_LAYER]: GeneralLayerModel; // LandUseLayerModel;
  [LANDMARK_LAYER]: GeneralLayerModel; // LandmarkLayerModel
  [LAND_SLIDE_RISK_LAYER]: GeneralLayerModel; // LandSlideRiskLayerModel;
  [PARK_LAYER]: GeneralLayerModel; // ParkLayerModel
  [RAILWAY_LAYER]: GeneralLayerModel; // RailwayLayerModel
  [RIVER_FLOODING_RISK_LAYER]: GeneralLayerModel; // RiverFloodingRiskLayerModel;
  [ROAD_LAYER]: GeneralLayerModel; // RoadLayerModel;
  [SHELTER_LAYER]: GeneralLayerModel; // ShelterLayerModel
  [STATION_LAYER]: GeneralLayerModel; // StationLayerModel
  [TSUNAMI_RISK_LAYER]: GeneralLayerModel; // TsunamiRiskLayerModel
  [URBAN_PLANNING_LAYER]: GeneralLayerModel; // UrbanPlanningLayerModel;
  [USE_CASE_LAYER]: GeneralLayerModel; // UseCaseLayerModel
  [VEGETATION_LAYER]: GeneralLayerModel; // VegetationLayerModel
}
