import { USE_LOCAL_STORAGE } from "../constants";

import { MOCK_SHARED_DATA } from "./mock";

let shareId: string | undefined;
export const getShareId = () => {
  if (shareId) return shareId;
  shareId = new URLSearchParams(window.location.search).get("share") || undefined;
  return shareId;
};

// Initialize stores for the share feature.
let SHARED_STORE: Promise<Record<string, any>> = Promise.resolve({});

// TODO(ReEarth): Support share feature

const fetchShare = () => {
  const shareId = new URLSearchParams(window.location.search).get("share");
  if (!shareId) return;
  // For testing
  if (shareId === "test" && import.meta.env.DEV) {
    SHARED_STORE = new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_SHARED_DATA);
      }, 3000);
    });
    return;
  }
  // window.__PLATEAUVIEW3_SHARED = fetch("share API").then(sharedData => {
  //   return { ...window.__PLATEAUVIEW3_SHARED, ...sharedData };
  // });
  // SHARED_STORE = new Promise(resolve => {
  //   setTimeout(() => {
  //     resolve({
  //       graphicsQuality: ["ultra"],
  //       environmentType: ["satellite"],
  //     });
  //   }, 3000);
  // });
};
fetchShare();

const STORAGE_PREFIX = "PLATEAUVIEW3_STORAGE";
const makeStorageKey = (k: string) => `${STORAGE_PREFIX}_${k}`;

export const getSharedStoreValue = async <T>(k: string): Promise<T | undefined> =>
  SHARED_STORE.then(v => v[k] as T);
export const getStorageStoreValue = <T>(k: string): T | undefined =>
  USE_LOCAL_STORAGE()
    ? JSON.parse(window.localStorage.getItem(makeStorageKey(k)) ?? "null")
    : undefined;

export const setSharedStoreValue = <T>(k: string, v: T) => {
  SHARED_STORE.then(o => (o[k] = v));
  SHARED_STORE.then(console.log);
};
export const setStorageStoreValue = <T>(k: string, v: T) =>
  window.localStorage.setItem(makeStorageKey(k), JSON.stringify(v ?? null));
