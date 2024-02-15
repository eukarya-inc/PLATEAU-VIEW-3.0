import { useAtomValue } from "jotai";

import { ScreenSpaceCameraControllerOptions } from "../../../shared/reearth/types";
import { enableKeyboardCameraControlAtom } from "../states/app";
import { toolAtom } from "../states/tool";

import { KeyboardHandlers } from "./KeyboardHandlers";

type ScreenSpaceCameraProps = {
  tiltByRightButton: boolean;
};
export const ScreenSpaceCamera = ({ tiltByRightButton = false }: ScreenSpaceCameraProps) => {
  const useKeyboard = useAtomValue(enableKeyboardCameraControlAtom);
  const tool = useAtomValue(toolAtom);
  const isHand = tool?.type === "hand";

  const screenSpaceCameraControllerOptions: ScreenSpaceCameraControllerOptions = {
    zoomEventTypes: [],
    rotateEventTypes: [],
    tiltEventTypes: [],
    maximumZoomDistance: Infinity,
    minimumZoomDistance: 1.5,
    enableCollisionDetection: !useKeyboard,
    enableRotate: isHand,
    enableLook: isHand,
    enableInputs: isHand,
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
    enableRotate: isHand,
    enableLook: isHand,
    enableInputs: isHand,
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
  if (useKeyboard) {
    window?.reearth?.camera?.overrideScreenSpaceController(screenSpaceCameraControllerOptions);
  } else if (tiltByRightButton) {
    window?.reearth?.camera?.overrideScreenSpaceController(tiltByRightButtonOption);
  } else return window?.reearth?.camera?.overrideScreenSpaceController() ?? null;

  return useKeyboard ? <KeyboardHandlers isMoving={useKeyboard} /> : null;
};
