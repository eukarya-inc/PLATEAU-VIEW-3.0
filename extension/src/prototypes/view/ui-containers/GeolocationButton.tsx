import { Button, CircularProgress, Fade } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useState, type FC } from "react";

import { useCamera } from "../../../shared/reearth/hooks";
import { isReEarthAPIv2 } from "../../../shared/reearth/types";
import { AppIconButton, LocationIcon } from "../../ui-components";

export const GeolocationButton: FC = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const { getCameraFovInfo, flyTo, getCameraPosition } = useCamera();
  useEffect(() => {
    setEnabled("geolocation" in navigator);
  }, []);

  const handleClick = useCallback(() => {
    if (isReEarthAPIv2(window.reearth)) {
      if (window.reearth?.viewer == null) {
        return;
      }
    } else {
      if (window.reearth?.scene == null) {
        return;
      }
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLoading(false);
        const toXYZ = isReEarthAPIv2(window.reearth)
          ? window.reearth?.viewer?.tools?.cartographicToCartesian
          : window.reearth?.scene?.toXYZ;
        const toLngLatHeight = isReEarthAPIv2(window.reearth)
          ? window.reearth?.viewer?.tools?.cartesianToCartographic
          : window.reearth?.scene?.toLngLatHeight;

        const target = toXYZ?.(coords.longitude, coords.latitude, 0, {
          useGlobeEllipsoid: true,
        });
        const fovInfo = getCameraFovInfo();
        const camera = getCameraPosition();

        const cameraPosition = toXYZ?.(camera?.lng ?? 0, camera?.lat ?? 0, camera?.height ?? 0, {
          useGlobeEllipsoid: true,
        });
        const intersectionPosition = toXYZ?.(
          fovInfo?.center?.lng ?? 0,
          fovInfo?.center?.lat ?? 0,
          fovInfo?.center?.height ?? 0,
          { useGlobeEllipsoid: true },
        );

        if (!cameraPosition || !intersectionPosition || !target) return;

        const offset = [
          cameraPosition[0] - intersectionPosition[0],
          cameraPosition[1] - intersectionPosition[1],
          cameraPosition[2] - intersectionPosition[2],
        ];
        const position = [target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]];

        const [x, y, z] = position;
        const [lng, lat, height] = toLngLatHeight?.(x, y, z, {
          useGlobeEllipsoid: true,
        }) ?? [0, 0, 0];
        flyTo({ lng, lat, height });
      },
      () => {
        setLoading(false);
        const snackbar = enqueueSnackbar({
          variant: "error",
          message: "現在地を取得できませんでした",
          action: (
            <Button
              variant="text"
              onClick={() => {
                closeSnackbar(snackbar);
              }}>
              閉じる
            </Button>
          ),
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
          TransitionComponent: Fade,
        });
      },
    );
  }, [getCameraFovInfo, getCameraPosition, flyTo, enqueueSnackbar, closeSnackbar]);

  const noSceneAPI = isReEarthAPIv2(window.reearth)
    ? window.reearth?.viewer == null
    : window.reearth?.scene == null;

  return (
    <AppIconButton
      title="現在地"
      disabled={!enabled || noSceneAPI || loading}
      onClick={handleClick}>
      {loading ? <CircularProgress size={21} /> : <LocationIcon />}
    </AppIconButton>
  );
};
