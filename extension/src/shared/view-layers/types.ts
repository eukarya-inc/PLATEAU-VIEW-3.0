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

export interface LayerModelOverrides {
  [HEATMAP_LAYER]: never; // HeatmapLayerModel;
  [PEDESTRIAN_LAYER]: never; // PedestrianLayerModel;
  [SKETCH_LAYER]: never; // SketchLayerModel;

  // Dataset layers
  [BORDER_LAYER]: never; // BorderLayerModel
  [BRIDGE_LAYER]: never; // BridgeLayerModel;
  [BUILDING_LAYER]: BuildingLayerModel;
  [CITY_FURNITURE_LAYER]: never; // CityFurnitureLayerModel
  [EMERGENCY_ROUTE_LAYER]: never; // EmergencyRouteLayerModel
  [GENERIC_CITY_OBJECT_LAYER]: never; // GenericLayerModel
  [HIGH_TIDE_RISK_LAYER]: never; // HighTideRiskLayerModel
  [INLAND_FLOODING_RISK_LAYER]: never; // InlandFloodingRiskLayerModel
  [LAND_USE_LAYER]: never; // LandUseLayerModel;
  [LANDMARK_LAYER]: never; // LandmarkLayerModel
  [LAND_SLIDE_RISK_LAYER]: never; // LandSlideRiskLayerModel;
  [PARK_LAYER]: never; // ParkLayerModel
  [RAILWAY_LAYER]: never; // RailwayLayerModel
  [RIVER_FLOODING_RISK_LAYER]: never; // RiverFloodingRiskLayerModel;
  [ROAD_LAYER]: never; // RoadLayerModel;
  [SHELTER_LAYER]: never; // ShelterLayerModel
  [STATION_LAYER]: never; // StationLayerModel
  [TSUNAMI_RISK_LAYER]: never; // TsunamiRiskLayerModel
  [URBAN_PLANNING_LAYER]: never; // UrbanPlanningLayerModel;
  [USE_CASE_LAYER]: never; // UseCaseLayerModel
  [VEGETATION_LAYER]: never; // VegetationLayerModel
}
