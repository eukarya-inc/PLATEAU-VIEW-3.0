import { useCallback } from "react";

import { isReEarthAPIv2 } from "../types";

export const useTimeline = () => {
  const getTimeline = useCallback(() => {
    return isReEarthAPIv2(window.reearth) ? window.reearth?.timeline : window.reearth?.clock;
  }, []);

  const handleTimelinePlay = useCallback(
    ({
      start,
      stop,
      current,
      speed,
    }: {
      start: Date;
      stop: Date;
      current: Date;
      speed: number;
    }) => {
      if (isReEarthAPIv2(window.reearth)) {
        window.reearth?.timeline?.setTime?.({
          start,
          stop,
          current,
        });
        window.reearth?.timeline?.setSpeed?.(speed);
        window.reearth?.timeline?.play?.();
      } else {
        window.reearth?.clock?.setTime?.({
          start,
          stop,
          current,
        });
        window.reearth?.clock?.setSpeed?.(speed);
        window.reearth?.clock?.play?.();
      }
    },
    [],
  );

  const handleTimelinePlayReverse = useCallback(
    ({
      start,
      stop,
      current,
      speed,
    }: {
      start: Date;
      stop: Date;
      current: Date;
      speed: number;
    }) => {
      if (isReEarthAPIv2(window.reearth)) {
        window.reearth?.timeline?.setTime?.({
          start,
          stop,
          current,
        });
        window.reearth?.timeline?.setSpeed?.(-speed);
        window.reearth?.timeline?.play?.();
      } else {
        window.reearth?.clock?.setTime?.({
          start,
          stop,
          current,
        });
        window.reearth?.clock?.setSpeed?.(-speed);
        window.reearth?.clock?.play?.();
      }
    },
    [],
  );

  const handleTimelinePause = useCallback(() => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.timeline?.pause?.()
      : window.reearth?.clock?.pause?.();
  }, []);

  const handleTimelineJump = useCallback(
    ({ start, stop, current }: { start: Date; stop: Date; current: Date }) => {
      if (isReEarthAPIv2(window.reearth)) {
        window.reearth?.timeline?.pause?.();
        window.reearth?.timeline?.setTime?.({
          start,
          stop,
          current,
        });
      } else {
        window.reearth?.clock?.pause?.();
        window.reearth?.clock?.setTime?.({
          start,
          stop,
          current,
        });
      }
    },
    [],
  );

  const handleTimelineSetSpeed = useCallback((speed: number) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.timeline?.setSpeed?.(speed)
      : window.reearth?.clock?.setSpeed?.(speed);
  }, []);

  const handleTimelineSetRangeType = useCallback(
    (rangeType: "unbounded" | "clamped" | "bounced") => {
      isReEarthAPIv2(window.reearth)
        ? window.reearth?.timeline?.setRangeType?.(rangeType)
        : window.reearth?.clock?.setRangeType?.(rangeType);
    },
    [],
  );

  const handleTimelineOnTickEventAdd = useCallback((callback: (date: Date) => void) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.timeline?.on?.("tick", callback)
      : window.reearth?.on?.("tick", callback);
  }, []);

  const handleTimelineOnTickEventRemove = useCallback((callback: (date: Date) => void) => {
    isReEarthAPIv2(window.reearth)
      ? window.reearth?.timeline?.off?.("tick", callback)
      : window.reearth?.off?.("tick", callback);
  }, []);

  return {
    getTimeline,
    handleTimelinePlay,
    handleTimelinePlayReverse,
    handleTimelinePause,
    handleTimelineJump,
    handleTimelineSetSpeed,
    handleTimelineSetRangeType,
    handleTimelineOnTickEventAdd,
    handleTimelineOnTickEventRemove,
  };
};
