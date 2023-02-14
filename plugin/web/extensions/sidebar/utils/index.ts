import { PostMessageProps } from "@web/extensions/sidebar/types";
import { cloneDeep, mergeWith } from "lodash";

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

export function array_move(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}

export function generateID() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2);
}
