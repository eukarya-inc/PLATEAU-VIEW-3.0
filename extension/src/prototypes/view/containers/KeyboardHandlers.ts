import { useCallback, useRef } from "react";

import { useWindowEvent } from "../../react-helpers";

const directions = ["forward", "backward", "right", "left", "up", "down"] as const;

type Direction = (typeof directions)[number];

function isDirection(value: unknown): value is Direction {
  return directions.includes(value as Direction);
}

const modes = ["sprint"] as const;

type Mode = (typeof modes)[number];

function isMode(value: unknown): value is Mode {
  return modes.includes(value as Mode);
}

type KeyAssignments = Record<string, Direction | Mode>;

const defaultKeyAssignments: KeyAssignments = {
  KeyW: "forward",
  KeyS: "backward",
  KeyA: "left",
  KeyD: "right",
  Space: "up",
  ControlLeft: "down",
  ShiftLeft: "sprint",
};

export const KeyboardHandlers = () => {
  const directionsRef = useRef<{
    forward?: number;
    backward?: number;
    right?: number;
    left?: number;
    up?: number;
    down?: number;
  }>({});

  const modesRef = useRef<{
    sprint?: boolean;
  }>({});

  const camera = window.reearth?.camera;

  const checkOnKeyboard = useCallback(
    (assignment: string) => {
      switch (assignment) {
        case "forward":
          return camera?.moveForward(3);
        case "backward":
          return camera?.moveBackward(3);
        case "up":
          return camera?.moveUp(3);
        case "down":
          return camera?.moveDown(3);
        case "left":
          return camera?.moveLeft(3);
        case "right":
          return camera?.moveRight(3);
        default:
          return;
      }
    },
    [camera],
  );

  useWindowEvent("keydown", event => {
    const assignment = defaultKeyAssignments[event.code];
    if (assignment == null) {
      return;
    }
    if (isDirection(assignment)) {
      directionsRef.current[assignment] = event.timeStamp;
      event.preventDefault();
      if (event.key) {
        checkOnKeyboard(assignment);
      }
    } else if (isMode(assignment)) {
      modesRef.current[assignment] = true;
      event.preventDefault();
    }
  });

  useWindowEvent("keyup", event => {
    const assignment = defaultKeyAssignments[event.code];
    if (assignment == null) {
      return;
    }
    if (isDirection(assignment)) {
      directionsRef.current[assignment] = undefined;
      if (event.key) {
        checkOnKeyboard(assignment);
      }
      event.preventDefault();
    } else if (isMode(assignment)) {
      modesRef.current[assignment] = false;
      event.preventDefault();
    }
  });
  useWindowEvent("blur", () => {
    directionsRef.current = {};
    modesRef.current = {};
  });
  return null;
};
