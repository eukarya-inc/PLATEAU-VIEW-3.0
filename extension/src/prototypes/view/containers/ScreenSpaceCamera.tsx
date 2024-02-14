import { useAtomValue } from "jotai";

import { ScreenSpaceCameraControllerOptions } from "../../../shared/reearth/types";
import { assignPropertyProps } from "../../react-helpers";
import { enableKeyboardCameraControlAtom } from "../states/app";
import { toolAtom } from "../states/tool";

import { KeyboardHandlers } from "./KeyboardHandlers";

const defaultOptions = {
  enableInputs: true,
  enableTranslate: true,
  enableZoom: true,
  enableRotate: true,
  enableTilt: true,
  enableLook: true,
};

export const ScreenSpaceCamera = () => {
  const useKeyboard = useAtomValue(enableKeyboardCameraControlAtom);
  const tool = useAtomValue(toolAtom);
  const isHand = tool?.type === "hand";

  const options = {
    enableRotate: isHand,
    enableLook: isHand,
    enableInputs: isHand,
  };

  const screenSpaceCameraControllerOptions: ScreenSpaceCameraControllerOptions = {
    zoomEventTypes: [],
    rotateEventTypes: [],
    tiltEventTypes: [],
    maximumZoomDistance: Infinity,
    minimumZoomDistance: 1.5,
    enableCollisionDetection: isHand,
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

  if (useKeyboard) {
    const handler = window?.reearth?.camera?.overrideScreenSpaceController(
      screenSpaceCameraControllerOptions,
    );
    handler != null && assignPropertyProps(handler, options, defaultOptions);
  }
  return useKeyboard ? <KeyboardHandlers isMoving={useKeyboard} /> : null;
};
