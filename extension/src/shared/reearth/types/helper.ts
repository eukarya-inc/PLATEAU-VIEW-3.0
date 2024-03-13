export type Helper = {
  readonly planeFromPolygonCoordinates?: (coordinates: [lng: number, lat: number][]) =>
    | {
        normal: {
          x: number;
          y: number;
          z: number;
        };
        distance: number;
      }[]
    | undefined;
};
