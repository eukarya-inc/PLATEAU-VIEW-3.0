import { CameraPosition, XYZ } from "../types";

export const flyToLayerId = (layerId: string) =>
  window.reearth?.camera?.flyTo(layerId, { duration: 0.5 });

export const flyToCamera = (camera: CameraPosition, duration = 0.5) =>
  window.reearth?.camera?.flyTo(camera, { duration });

export const setView = (camera: CameraPosition) => window.reearth?.camera?.setView(camera);

export const lookAtXYZ = ({ x, y, z, radius }: XYZ) => {
  const [lng, lat, height] = window.reearth?.scene?.toLngLatHeight(x, y, z) ?? [0, 0, 0];
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
