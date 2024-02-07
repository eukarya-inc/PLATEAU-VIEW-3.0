import { useAtomValue } from "jotai";
import { FC } from "react";

import { screenSpaceOptions } from "../../../shared/reearth/types";
import { enableKeyboardCameraControlAtom } from "../states/app";

import { KeyboardHandlers } from "./KeyboardHandlers";

type ScreenSpaceCameraProps = {
  tiltByRightButton: boolean;
};

export const ScreenSpaceCamera: FC<ScreenSpaceCameraProps> = ({ tiltByRightButton = false }) => {
  const useKeyboard = useAtomValue(enableKeyboardCameraControlAtom);

  const screenSpaceCameraOptions: screenSpaceOptions = {
    useKeyboard,
    tiltByRightButton,
    ctrl: "ctrl",
    shift: "shift",
  };
  window.reearth?.camera?.overrideScreenSpaceController(screenSpaceCameraOptions);

  return useKeyboard ? <KeyboardHandlers /> : null;
};
