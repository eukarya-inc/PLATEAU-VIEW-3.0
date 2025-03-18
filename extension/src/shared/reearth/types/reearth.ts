// NOTE: Please add exact type to this type when you use something API from plugin_types.ts.

import { Camera } from "./camera";
import { Clock } from "./clock";
import { ReearthEventType } from "./event";
import { InteractionMode } from "./interactionMode";
import { Layers } from "./layer";
import { ReEarthV2 } from "./reearthPluginAPIv2";
import { Scene } from "./scene";
import { Sketch } from "./sketch";
import { Viewer } from "./viewer";
import { Viewport } from "./viewport";

// https://github.com/reearth/reearth/blob/main/web/src/beta/lib/core/Crust/Plugins/plugin_types.ts
export type ReEarthV1 = {
  readonly apiVersion?: number | string;
  readonly camera?: Camera;
  readonly scene?: Scene;
  readonly viewer?: Viewer;
  readonly clock?: Clock;
  readonly interactionMode?: InteractionMode;
  readonly layers?: Layers;
  readonly viewport?: Viewport;
  readonly sketch?: Sketch;
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

export type ReEarth = ReEarthV1 | ReEarthV2;
