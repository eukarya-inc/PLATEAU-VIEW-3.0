import { debounce } from "lodash-es";
import { type FC, useCallback, useMemo } from "react";

import { useReEarthEvent } from "../../shared/reearth/hooks";
import { isReEarthAPIv2, LngLatHeight } from "../../shared/reearth/types";

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
      ({ lng, lat, height }) => {
        if (!lng || !lat) return;
        const [x, y, z] = (isReEarthAPIv2(window.reearth)
          ? window.reearth?.viewer?.tools?.cartographicToCartesian(lng, lat, height ?? 0, {
              useGlobeEllipsoid: true,
            })
          : window.reearth?.scene?.toXYZ(lng, lat, height ?? 0, {
              useGlobeEllipsoid: true,
            })) ?? [0, 0, 0];
        motionPosition.setPosition({ x, y, z });
      },
      [motionPosition],
    ),
  );

  useReEarthEvent(
    "click",
    useMemo(
      () =>
        debounce(({ lng, lat, height }) => {
          if (!lng || !lat) return;
          onCreate?.({ lng, lat, height: height ?? 0 });
        }, 10),
      [onCreate],
    ),
  );

  return <LevitationCircle motionPosition={motionPosition} />;
};
