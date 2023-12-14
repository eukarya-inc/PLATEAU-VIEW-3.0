import { type FC, useCallback } from "react";

import { useReEarthEvent } from "../../shared/reearth/hooks";
import { LngLatHeight } from "../../shared/reearth/types";

import { LevitationCircle } from "./LevitationCircle";
import { useMotionPosition } from "./useMotionPosition";

export interface PedestrianToolProps {
  onCreate?: (position: LngLatHeight) => void;
}

export const PedestrianTool: FC<PedestrianToolProps> = ({ onCreate }) => {
  const motionPosition = useMotionPosition();

  useReEarthEvent(
    "mousemove",
    useCallback(
      ({ x, y, height }) => {
        if (!x || !y) return;
        motionPosition.setPosition({ x, y, z: height ?? 0 });
      },
      [motionPosition],
    ),
  );

  useReEarthEvent(
    "click",
    useCallback(
      ({ lng, lat, height }) => {
        if (!lng || !lat) return;
        onCreate?.({ lng, lat, height: height ?? 0 });
      },
      [onCreate],
    ),
  );

  return <LevitationCircle motionPosition={motionPosition} />;
};
