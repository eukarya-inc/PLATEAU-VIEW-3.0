import { ReEarth } from "./types";

declare global {
  interface Window {
    reearth: Partial<ReEarth>;
  }
}
