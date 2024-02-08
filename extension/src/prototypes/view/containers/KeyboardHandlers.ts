import { useCallback, useRef, useState } from "react";

import { useConstant, useWindowEvent } from "../../react-helpers";

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

  const state = useConstant(() => ({
    time: Date.now(),
    speed: 0,
  }));
  const camera = window.reearth?.camera;
  const globeHeight = window.reearth?.scene?.getGlobeHeight();

  const previousTime = state.time;
  const currentTime = Date.now();
  const deltaSeconds = (currentTime - previousTime) / 1000;
  state.time = currentTime;

  const acceleration = 0.1;
  const damping = 0.3;
  const maximumSpeed = 3;

  const [amount, setAmount] = useState(1);
  const checkOnKeyboard = useCallback(
    (assignment: string) => {
      const cameraHeight = camera?.position?.height;
      if (state.speed > 1) {
        state.speed = Math.max(maximumSpeed, state.speed - damping);
      } else {
        state.speed = Math.min(maximumSpeed, state.speed + acceleration);
      }
      if (globeHeight != null && cameraHeight) {
        let speed = state.speed;
        speed *= 1 + Math.max(0, cameraHeight - globeHeight) * 0.1;
        setAmount(speed * deltaSeconds);
      }
      camera?.moveOverTerrain(1.8);

      switch (assignment) {
        case "forward":
          return camera?.moveForward(amount);
        case "backward":
          return camera?.moveBackward(amount);
        case "up":
          return camera?.moveUp(amount);
        case "down":
          return camera?.moveDown(amount);
        case "left":
          return camera?.moveLeft(amount);
        case "right":
          return camera?.moveRight(amount);
        default:
          return;
      }
    },
    [amount, camera, deltaSeconds, globeHeight, state],
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
