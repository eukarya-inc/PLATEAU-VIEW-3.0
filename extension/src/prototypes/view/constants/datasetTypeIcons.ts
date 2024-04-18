import {
  BorderIcon,
  BridgeIcon,
  BuildingIcon,
  CityFurnitureIcon,
  EmergencyRouteIcon,
  GenericCityObjectIcon,
  HighTideRiskIcon,
  InlandFloodingRiskIcon,
  LandmarkIcon,
  LandSlideRiskIcon,
  LandUseIcon,
  ParkIcon,
  RailwayIcon,
  RiverFloodingRiskIcon,
  RoadIcon,
  ShelterIcon,
  StationIcon,
  TsunamiRiskIcon,
  UrbanPlanningIcon,
  UseCaseIcon,
  VegetationIcon,
} from "../../ui-components";

import { PlateauDatasetType } from "./plateau";

export const datasetTypeIcons = {
  [PlateauDatasetType.Area]: UseCaseIcon,
  [PlateauDatasetType.Border]: BorderIcon,
  [PlateauDatasetType.Bridge]: BridgeIcon,
  [PlateauDatasetType.Building]: BuildingIcon,
  [PlateauDatasetType.EmergencyRoute]: EmergencyRouteIcon,
  [PlateauDatasetType.UrbanPlanning]: UrbanPlanningIcon,
  [PlateauDatasetType.RiverFloodingRisk]: RiverFloodingRiskIcon,
  [PlateauDatasetType.CityFurniture]: CityFurnitureIcon,
  [PlateauDatasetType.GenericCityObject]: GenericCityObjectIcon,
  [PlateauDatasetType.Global]: UseCaseIcon,
  [PlateauDatasetType.HighTideRisk]: HighTideRiskIcon,
  [PlateauDatasetType.InlandFloodingRisk]: InlandFloodingRiskIcon,
  [PlateauDatasetType.Landmark]: LandmarkIcon,
  [PlateauDatasetType.LandSlideRisk]: LandSlideRiskIcon,
  [PlateauDatasetType.LandUse]: LandUseIcon,
  [PlateauDatasetType.Park]: ParkIcon,
  [PlateauDatasetType.Railway]: RailwayIcon,
  [PlateauDatasetType.Road]: RoadIcon,
  [PlateauDatasetType.Shelter]: ShelterIcon,
  [PlateauDatasetType.Station]: StationIcon,
  [PlateauDatasetType.TsunamiRisk]: TsunamiRiskIcon,
  [PlateauDatasetType.UseCase]: UseCaseIcon,
  [PlateauDatasetType.Vegetation]: VegetationIcon,
  [PlateauDatasetType.Sample]: UseCaseIcon,
  [PlateauDatasetType.City]: UseCaseIcon,
  [PlateauDatasetType.Constructure]: UseCaseIcon,
  [PlateauDatasetType.Water]: UseCaseIcon,
  [PlateauDatasetType.WaterWay]: UseCaseIcon,
  [PlateauDatasetType.Traffic]: UseCaseIcon,
} as const;
