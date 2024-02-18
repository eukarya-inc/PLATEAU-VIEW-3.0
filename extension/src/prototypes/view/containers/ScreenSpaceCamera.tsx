import { useAtomValue } from "jotai";
import { useEffect } from "react";

import { ScreenSpaceCameraControllerOptions } from "../../../shared/reearth/types";
import { setView } from "../../../shared/reearth/utils";
import { enableKeyboardCameraControlAtom } from "../states/app";

import { KeyboardHandlers } from "./KeyboardHandlers";

type ScreenSpaceCameraProps = {
  tiltByRightButton: boolean;
};
export const ScreenSpaceCamera = ({ tiltByRightButton = false }: ScreenSpaceCameraProps) => {
  const useKeyboard = useAtomValue(enableKeyboardCameraControlAtom);

  const screenSpaceCameraControllerOptions: ScreenSpaceCameraControllerOptions = {
    zoomEventTypes: [],
    tiltEventTypes: [],
    maximumZoomDistance: Infinity,
    minimumZoomDistance: 1.5,
    enableCollisionDetection: !useKeyboard,
    lookEventTypes: [
      "left_drag",
      {
        eventType: "left_drag",
        modifier: "ctrl",
      },
      {
        eventType: "left_drag",
        modifier: "shift",
      },
    ],
  };

  const tiltByRightButtonOption: ScreenSpaceCameraControllerOptions = {
    zoomEventTypes: ["middle_drag", "wheel", "pinch"],
    rotateEventTypes: ["left_drag"],
    tiltEventTypes: [
      "right_drag",
      "pinch",
      {
        eventType: "left_drag",
        modifier: "ctrl",
      },
      {
        eventType: "right_drag",
        modifier: "ctrl",
      },
    ],
    lookEventTypes: [
      {
        eventType: "left_drag",
        modifier: "shift",
      },
    ],
  };

  const cameraPotion = window?.reearth?.camera?.position;
  useEffect(() => {
    if (!cameraPotion || !useKeyboard) return;
    setView({
      heading: cameraPotion.heading,
      pitch: cameraPotion.pitch,
      roll: 0,
    });
  }, [cameraPotion, useKeyboard]);

  if (useKeyboard) {
    window?.reearth?.camera?.overrideScreenSpaceController(screenSpaceCameraControllerOptions);
  } else if (tiltByRightButton) {
    window?.reearth?.camera?.overrideScreenSpaceController(tiltByRightButtonOption);
  } else return window?.reearth?.camera?.overrideScreenSpaceController() ?? null;

  return useKeyboard ? <KeyboardHandlers isMoving={useKeyboard} /> : null;
};
