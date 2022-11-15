import { useCallback, useEffect, useMemo, useState } from "react";

import { MouseEventData } from "./types";
import { postMsg } from "./utils";

export const distances = [
  1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000, 20000, 30000,
  50000, 100000, 200000, 300000, 500000, 1000000, 2000000, 3000000, 5000000, 10000000, 20000000,
  30000000, 50000000,
];

export default () => {
  let pixelDistance = 0;

  const [currentPoint, setCurrentPoint] = useState<MouseEventData>();
  const [currentDistance, setCurrentDistance] = useState("0 Km");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showTerraineModal, setShowTerrainModal] = useState(false);

  const updateCurrentPoint = useCallback((mousedata: MouseEventData) => {
    setCurrentPoint(mousedata);
  }, []);

  const handlegoogleModalChange = useCallback(() => {
    setShowGoogleModal(!showGoogleModal);
    postMsg({ action: !showGoogleModal ? "modal-google-open" : "modal-close" });
  }, [showGoogleModal]);

  const handleTerrainModalChange = useCallback(() => {
    setShowTerrainModal(!showTerraineModal);
    postMsg({ action: !showTerraineModal ? "modal-terrain-open" : "modal-close" });
  }, [showTerraineModal]);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.type) {
        if (e.data.type === "mousedata") {
          console.log(e.data);
          updateCurrentPoint(e.data);
        }
        if (e.data.type === "getLocations") {
          if (e.data.payload.point1 && e.data.payload.point2) {
            pixelDistance =
              getDistanceFromLatLonInKm(
                e.data.payload.point1.lat,
                e.data.payload.point1.lng,
                e.data.payload.point2.lat,
                e.data.payload.point2.lng,
              ) * 1000;
          }
        }
      }
    };
    addEventListener("message", e => eventListenerCallback(e));
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []);

  const DistanceLabel = useMemo<string>(() => {
    const maxBarWidth = 100;
    let distance = 0;
    for (let i = distances.length - 1; !distance && i >= 0; --i) {
      if (distances[i] / pixelDistance < maxBarWidth) {
        distance = distances[i];
      }
    }

    if (distance >= 1000) {
      return (distance / 1000).toString() + " km";
    } else {
      return distance.toString() + " m";
    }
  }, []);

  setCurrentDistance(DistanceLabel);

  return {
    currentPoint,
    currentDistance,
    handlegoogleModalChange,
    handleTerrainModalChange,
  };
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.137; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
