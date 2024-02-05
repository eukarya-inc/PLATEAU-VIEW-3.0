import { useRef } from "react";

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

  useWindowEvent("keydown", event => {
    const assignment = defaultKeyAssignments[event.code];
    if (assignment == null) {
      return;
    }
    if (isDirection(assignment)) {
      directionsRef.current[assignment] = event.timeStamp;
      event.preventDefault();
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

  //here comes the API FROM reeath;
  console.log("called", directions);
  return null;
};
