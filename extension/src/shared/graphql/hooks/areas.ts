import { AREAS } from "../base/queries/areas";

import { useLasyQuery } from "./base";

export const useAreas = ({
  longitude,
  latitude,
  includeRadii,
}: {
  longitude: number;
  latitude: number;
  includeRadii?: boolean;
}) => {
  return useLasyQuery(AREAS, {
    variables: {
      longitude,
      latitude,
      includeRadii,
    },
  });
};
