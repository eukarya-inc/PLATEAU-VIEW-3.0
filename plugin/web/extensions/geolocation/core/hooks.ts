import { useCallback } from "react";

import { CurrentLocation } from "./types";
import { postMsg } from "./utils";

export default () => {
  let currentLocation: CurrentLocation;

  const handleFlyToCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude ?? 5000,
          };
          postMsg({ action: "flyTo", payload: { currentLocation } });
        },
        function (error) {
          console.error("Error Code = " + error.code + " - " + error.message);
        },
      );
    }
  }, []);

  return {
    handleFlyToCurrentLocation,
  };
};
