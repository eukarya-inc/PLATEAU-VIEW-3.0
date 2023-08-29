import { useCallback } from "react";

export interface CameraZoom {
  zoomIn: () => void;
  zoomOut: () => void;
}

export function useCameraZoom(): CameraZoom {
  const camera = window.reearth?.camera;

  const zoomOut = useCallback(() => {
    camera?.zoomOut(1.5);
  }, [camera]);

  const zoomIn = useCallback(() => {
    camera?.zoomIn(1.5);
  }, [camera]);

  return { zoomIn, zoomOut };
}
