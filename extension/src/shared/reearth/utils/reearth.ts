import { ReEarthV1 } from "../types";
import { ReEarthV2 } from "../types/reearthPluginAPIv2";

const IS_PLUGIN_V2_KEY = "__reearth_plugin_api_v2__";

export function isReEarthAPIv2(
  reearth?: Partial<ReEarthV1> | Partial<ReEarthV2>,
): reearth is Partial<ReEarthV2> {
  let isV2 = (window as any)[IS_PLUGIN_V2_KEY];
  if (isV2) return true;
  isV2 = versionCompare(String(reearth?.apiVersion), "2.0.0") >= 0;
  if (isV2) (window as any)[IS_PLUGIN_V2_KEY] = isV2;
  return isV2;
}

export function versionCompare(current: string, target: string) {
  const [v1a, v1b, v1c] = current.split(".").map(Number);
  const [v2a, v2b, v2c] = target.split(".").map(Number);
  if (v1a !== v2a) return v1a - v2a;
  if (v1b !== v2b) return v1b - v2b;
  return v1c - v2c;
}
