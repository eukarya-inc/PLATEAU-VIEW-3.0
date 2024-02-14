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

type ScreenSpaceCameraProps = {
  tiltByRightButton: boolean;
};
export const ScreenSpaceCamera = ({ tiltByRightButton = false }: ScreenSpaceCameraProps) => {
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
  if (useKeyboard) {
    const handler = window?.reearth?.camera?.overrideScreenSpaceController(
      screenSpaceCameraControllerOptions,
    );
    handler != null && assignPropertyProps(handler, options, defaultOptions);
  } else if (tiltByRightButton) {
    const handler = window?.reearth?.camera?.overrideScreenSpaceController(tiltByRightButtonOption);
    handler != null && assignPropertyProps(handler, options, defaultOptions);
  } else return window?.reearth?.camera?.overrideScreenSpaceController() ?? null;

  return useKeyboard ? <KeyboardHandlers isMoving={useKeyboard} /> : null;
};
