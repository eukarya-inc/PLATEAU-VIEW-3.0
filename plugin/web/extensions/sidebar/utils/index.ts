import { PostMessageProps } from "@web/extensions/sidebar/types";
import { cloneDeep, mergeWith } from "lodash";

export * from "./array";

export function postMsg({ action, payload }: PostMessageProps) {
  parent.postMessage(
    {
      action,
      payload,
    },
    "*",
  );
}

export function mergeProperty(a: any, b: any) {
  const a2 = cloneDeep(a);
  return mergeWith(
    a2,
    b,
    (s: any, v: any, _k: string | number | symbol, _obj: any, _src: any, stack: { size: number }) =>
      stack.size > 0 || Array.isArray(v) ? v ?? s : undefined,
  );
}

export function generateID() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2);
}

export const checkKeyPress = (e: React.MouseEvent<HTMLButtonElement>, keys: string[]) => {
  let keyPressed = false;
  keys.forEach(k => {
    if (e[`${k}Key` as keyof typeof e]) {
      keyPressed = true;
    }
  });
  return keyPressed;
};
