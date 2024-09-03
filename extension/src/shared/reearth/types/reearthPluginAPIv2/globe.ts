import { ReEarthV2 } from "./reearth";

export type GlobalThis = {
  reearth: ReEarthV2;
  console: {
    readonly log: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
  };
};
