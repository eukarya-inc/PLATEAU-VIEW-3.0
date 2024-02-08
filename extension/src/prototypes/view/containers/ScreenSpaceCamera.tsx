import { useAtomValue } from "jotai";
import { FC } from "react";

import { screenSpaceOptions } from "../../../shared/reearth/types";
import { assignPropertyProps } from "../../react-helpers";
import { enableKeyboardCameraControlAtom } from "../states/app";
import { toolAtom } from "../states/tool";

import { KeyboardHandlers } from "./KeyboardHandlers";

type ScreenSpaceCameraProps = {
  tiltByRightButton: boolean;
};

const defaultOptions = {
  enableInputs: true,
  enableTranslate: true,
  enableZoom: true,
  enableRotate: true,
  enableTilt: true,
  enableLook: true,
};

export const ScreenSpaceCamera: FC<ScreenSpaceCameraProps> = ({ tiltByRightButton = false }) => {
  const useKeyboard = useAtomValue(enableKeyboardCameraControlAtom);
  const tool = useAtomValue(toolAtom);
  const isHand = tool?.type === "hand";

  const options = {
    enableRotate: isHand,
    enableLook: isHand,
    enableInputs: isHand,
  };

  const screenSpaceCameraOptions: screenSpaceOptions = {
    useKeyboard,
    tiltByRightButton: tiltByRightButton,
    ctrl: "ctrl",
    shift: "shift",
  };
  const handler = window.reearth?.camera?.overrideScreenSpaceController(screenSpaceCameraOptions);

  if (handler != null) {
    assignPropertyProps(handler, options, defaultOptions);
  }
  return useKeyboard ? <KeyboardHandlers /> : null;
};
