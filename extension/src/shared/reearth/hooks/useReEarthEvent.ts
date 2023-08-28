import { useEffect } from "react";

import { ReearthEventType } from "../event";

export const useReEarthEvent = <T extends keyof ReearthEventType>(
  eventName: T,
  cb: (...args: ReearthEventType[T]) => void,
) => {
  useEffect(() => {
    window.reearth.on?.(eventName, cb);
    return () => {
      window.reearth.off?.(eventName, cb);
    };
  }, [eventName, cb]);
};
