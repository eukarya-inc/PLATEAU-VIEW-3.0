import { useAtom, type PrimitiveAtom } from "jotai";
import { useCallback, type FC } from "react";

import { useCameraZoom } from "../../../shared/reearth/hooks/useCamera";
import {
  AppIconButton,
  KeyboardMovementIcon,
  MinusIcon,
  PlusIcon,
  RotateAroundIcon,
} from "../../ui-components";
import { enableKeyboardCameraControlAtom } from "../states/app";

import { GeolocationButton } from "./GeolocationButton";

function useBooleanAtomProps(atom: PrimitiveAtom<boolean>): {
  selected: boolean;
  onClick: () => void;
} {
  const [selected, setSelected] = useAtom(atom);
  const handleClick = useCallback(() => {
    setSelected(value => !value);
  }, [setSelected]);
  return { selected, onClick: handleClick };
}

export const CameraButtons: FC = () => {
  const enableKeyboardCameraControlProps = useBooleanAtomProps(enableKeyboardCameraControlAtom);

  const { zoomIn, zoomOut } = useCameraZoom();

  return (
    <>
      <AppIconButton title="キーボード操作" {...enableKeyboardCameraControlProps} disabled>
        <KeyboardMovementIcon />
      </AppIconButton>
      <GeolocationButton />
      <AppIconButton title="自動回転" disabled>
        <RotateAroundIcon />
      </AppIconButton>
      <AppIconButton title="縮小" onClick={zoomOut}>
        <MinusIcon />
      </AppIconButton>
      <AppIconButton title="拡大" onClick={zoomIn}>
        <PlusIcon />
      </AppIconButton>
    </>
  );
};
