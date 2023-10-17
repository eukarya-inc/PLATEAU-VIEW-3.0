import { CAMERA_AREAS } from "../../base/geo/queries/areas";

import { useLazyQuery } from "./base";

export const useCameraAreas = ({
  longitude,
  latitude,
  includeRadii,
}: {
  longitude: number;
  latitude: number;
  includeRadii?: boolean;
}) => {
  return useLazyQuery(CAMERA_AREAS, {
    variables: {
      longitude,
      latitude,
      includeRadii,
    },
  });
};
