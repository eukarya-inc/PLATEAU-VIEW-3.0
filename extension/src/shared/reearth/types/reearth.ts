// NOTE: Pealse add exact type to this type when you use something API from plugin_types.ts.

import { Camera } from "./camera";
import { ReearthEventType } from "./event";
import { InteractionMode } from "./interactionMode";
import { Scene } from "./scene";

// https://github.com/reearth/reearth/blob/main/web/src/beta/lib/core/Crust/Plugins/plugin_types.ts
export type ReEarth = {
  readonly camera?: Camera;
  readonly scene?: Scene;
  readonly interactionMode?: InteractionMode;
  readonly on: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly off: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly once: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
};

declare global {
  interface Window {
    reearth?: Partial<ReEarth>;
  }
}
