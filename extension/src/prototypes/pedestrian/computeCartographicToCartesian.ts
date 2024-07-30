import { XYZ } from "../../shared/reearth/types";
import { isReEarthAPIv2 } from "../../shared/reearth/utils/reearth";

import { type Location } from "./types";

export function computeCartographicToCartesian(location: Location): XYZ {
  const height = isReEarthAPIv2(window.reearth)
    ? window.reearth?.viewer?.tools?.getGlobeHeight(
        location.longitude,
        location.latitude,
        location.height,
      )
    : window.reearth?.scene?.computeGlobeHeight(
        location.longitude,
        location.latitude,
        location.height,
      );
  const [x, y, z] = (isReEarthAPIv2(window.reearth)
    ? window.reearth?.viewer?.tools?.cartographicToCartesian(
        location.longitude,
        location.latitude,
        (height ?? 0) + (location.height ?? 0),
        { useGlobeEllipsoid: true },
      )
    : window.reearth?.scene?.toXYZ(
        location.longitude,
        location.latitude,
        (height ?? 0) + (location.height ?? 0),
        { useGlobeEllipsoid: true },
      )) ?? [0, 0, 0];
  return {
    x,
    y,
    z,
  };
}
