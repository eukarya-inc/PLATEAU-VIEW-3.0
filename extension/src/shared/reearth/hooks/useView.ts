import { useEffect } from "react";

import { FlyToDestination } from "../types";

export const useView = (destination: FlyToDestination) => {
  useEffect(() => {
    window.reearth?.camera?.flyTo(destination, { withoutAnimation: true });
  }, [destination]);
};
