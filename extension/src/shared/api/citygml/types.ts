export type CityGMLGetFilesParams = {
  meshId?: string;
  spaceZFXYStr?: string;
  spaceId?: string;
  centerCoordinate?: {
    lng: number;
    lat: number;
  };
  rangeCoordinates?: {
    lng1: number;
    lat1: number;
    lng2: number;
    lat2: number;
  };
  geoName?: string;
  cityIds?: string[];
};
