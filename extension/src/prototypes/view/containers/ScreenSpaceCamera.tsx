import { useAtomValue } from "jotai";

import { enableKeyboardCameraControlAtom } from "../states/app";

import { KeyboardHandlers } from "./KeyboardHandlers";

export const ScreenSpaceCamera = () => {
  const useKeyboard = useAtomValue(enableKeyboardCameraControlAtom);

  return useKeyboard ? <KeyboardHandlers /> : null;
};
