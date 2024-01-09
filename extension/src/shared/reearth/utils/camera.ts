import { CameraPosition, XYZ } from "../types";

export const flyToLayerId = (layerId: string) =>
  window.reearth?.camera?.flyTo(layerId, { duration: 0.5 });

export const flyToCamera = (camera: CameraPosition, duration = 0.5) =>
  window.reearth?.camera?.flyTo(camera, { duration });

export const flyToBBox = (bbox: [number, number, number, number], duration = 0.5) => {
  const camera = window.reearth?.camera?.position;
  window.reearth?.camera?.flyToBBox(bbox, {
    duration,
    heading: camera?.heading,
    pitch: camera?.pitch,
  });
};

export const setView = (camera: CameraPosition) => window.reearth?.camera?.setView(camera);

export const lookAtXYZ = ({ x, y, z, radius }: XYZ) => {
  const [lng, lat, height] = window.reearth?.scene?.toLngLatHeight(x, y, z, {
    useGlobeEllipsoid: true,
  }) ?? [0, 0, 0];
  window.reearth?.camera?.lookAt(
    {
      lng,
      lat,
      height,
      radius,
    },
    { duration: 0.5 },
  );
};
