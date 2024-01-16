import { type LayerType } from "../../layers";
import {
  BORDER_LAYER,
  BRIDGE_LAYER,
  BUILDING_LAYER,
  CITY_FURNITURE_LAYER,
  EMERGENCY_ROUTE_LAYER,
  GENERIC_CITY_OBJECT_LAYER,
  GLOBAL_LAYER,
  HEATMAP_LAYER,
  HIGH_TIDE_RISK_LAYER,
  INLAND_FLOODING_RISK_LAYER,
  LAND_SLIDE_RISK_LAYER,
  LAND_USE_LAYER,
  LANDMARK_LAYER,
  MY_DATA_LAYER,
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
} from "../../view-layers";

import { PlateauDatasetType } from "./plateau";

export const datasetTypeLayers = {
  [PlateauDatasetType.Border]: BORDER_LAYER,
  [PlateauDatasetType.Bridge]: BRIDGE_LAYER,
  [PlateauDatasetType.Building]: BUILDING_LAYER,
  [PlateauDatasetType.EmergencyRoute]: EMERGENCY_ROUTE_LAYER,
  [PlateauDatasetType.UrbanPlanning]: URBAN_PLANNING_LAYER,
  [PlateauDatasetType.RiverFloodingRisk]: RIVER_FLOODING_RISK_LAYER,
  [PlateauDatasetType.CityFurniture]: CITY_FURNITURE_LAYER,
  [PlateauDatasetType.GenericCityObject]: GENERIC_CITY_OBJECT_LAYER,
  [PlateauDatasetType.Global]: GLOBAL_LAYER,
  [PlateauDatasetType.HighTideRisk]: HIGH_TIDE_RISK_LAYER,
  [PlateauDatasetType.InlandFloodingRisk]: INLAND_FLOODING_RISK_LAYER,
  [PlateauDatasetType.Landmark]: LANDMARK_LAYER,
  [PlateauDatasetType.LandSlideRisk]: LAND_SLIDE_RISK_LAYER,
  [PlateauDatasetType.LandUse]: LAND_USE_LAYER,
  [PlateauDatasetType.Park]: PARK_LAYER,
  [PlateauDatasetType.Railway]: RAILWAY_LAYER,
  [PlateauDatasetType.Road]: ROAD_LAYER,
  [PlateauDatasetType.Shelter]: SHELTER_LAYER,
  [PlateauDatasetType.Station]: STATION_LAYER,
  [PlateauDatasetType.TsunamiRisk]: TSUNAMI_RISK_LAYER,
  [PlateauDatasetType.UseCase]: USE_CASE_LAYER,
  [PlateauDatasetType.Vegetation]: VEGETATION_LAYER,
} as const satisfies Record<PlateauDatasetType, LayerType | undefined>;

export const layerDatasetTypes = {
  [BORDER_LAYER]: PlateauDatasetType.Border,
  [BRIDGE_LAYER]: PlateauDatasetType.Bridge,
  [BUILDING_LAYER]: PlateauDatasetType.Building,
  [EMERGENCY_ROUTE_LAYER]: PlateauDatasetType.EmergencyRoute,
  [URBAN_PLANNING_LAYER]: PlateauDatasetType.UrbanPlanning,
  [RIVER_FLOODING_RISK_LAYER]: PlateauDatasetType.RiverFloodingRisk,
  [CITY_FURNITURE_LAYER]: PlateauDatasetType.CityFurniture,
  [GENERIC_CITY_OBJECT_LAYER]: PlateauDatasetType.GenericCityObject,
  [GLOBAL_LAYER]: PlateauDatasetType.Global,
  [HIGH_TIDE_RISK_LAYER]: PlateauDatasetType.HighTideRisk,
  [INLAND_FLOODING_RISK_LAYER]: PlateauDatasetType.InlandFloodingRisk,
  [LANDMARK_LAYER]: PlateauDatasetType.Landmark,
  [LAND_SLIDE_RISK_LAYER]: PlateauDatasetType.LandSlideRisk,
  [LAND_USE_LAYER]: PlateauDatasetType.LandUse,
  [PARK_LAYER]: PlateauDatasetType.Park,
  [RAILWAY_LAYER]: PlateauDatasetType.Railway,
  [ROAD_LAYER]: PlateauDatasetType.Road,
  [SHELTER_LAYER]: PlateauDatasetType.Shelter,
  [STATION_LAYER]: PlateauDatasetType.Station,
  [TSUNAMI_RISK_LAYER]: PlateauDatasetType.TsunamiRisk,
  [USE_CASE_LAYER]: PlateauDatasetType.UseCase,
  [VEGETATION_LAYER]: PlateauDatasetType.Vegetation,
  [HEATMAP_LAYER]: undefined,
  [PEDESTRIAN_LAYER]: undefined,
  [SKETCH_LAYER]: undefined,
  [MY_DATA_LAYER]: undefined,
} as const satisfies Record<LayerType, PlateauDatasetType | undefined>;
