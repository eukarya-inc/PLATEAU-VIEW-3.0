// import { Cartesian2, PerspectiveFrustum, type Camera } from "@cesium/engine";
// import invariant from "tiny-invariant";

import { Camera } from "../../shared/reearth/types";

export function getFieldOfView(_camera: Camera, _zoom: number): number {
  // const fov = getFieldOfViewSeparate(camera, zoom, cartesianScratch);
  // const frustum = camera.frustum;
  // invariant(frustum instanceof PerspectiveFrustum);
  // return frustum.aspectRatio > 1 ? fov.x : fov.y;
  return 0;
}

export function getFieldOfViewSeparate(_camera: Camera, _zoom: number): { x: number; y: number } {
  // const frustum = camera.frustum;
  // invariant(frustum instanceof PerspectiveFrustum);
  // result.x = Math.atan(Math.pow(2, 1 - zoom)) * 2;
  // result.y = 2 * Math.atan(frustum.aspectRatio * Math.tan(result.x / 2));
  // return result;
  return { x: 0, y: 0 };
}
