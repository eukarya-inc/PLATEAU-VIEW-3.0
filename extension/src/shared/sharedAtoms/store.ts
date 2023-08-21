declare global {
  interface Window {
    __PLATEAUVIEW3_SHARED?: Record<string, any>;
  }
}

// Initialize stores for the share feature.
window.__PLATEAUVIEW3_SHARED = window.__PLATEAUVIEW3_SHARED ?? {};

// TODO: Support share feature
// await fetch("share API").then(sharedData => {
//   window.__PLATEAUVIEW3_SHARED = { ...window.__PLATEAUVIEW3_SHARED, ...sharedData };
// });

const STORAGE_PREFIX = "PLATEAUVIEW3_STORAGE";
const makeStorageKey = (k: string) => `${STORAGE_PREFIX}_${k}`;

export const getSharedStoreValue = <T>(k: string): T | undefined =>
  window.__PLATEAUVIEW3_SHARED?.[k] as T;
export const getStorageStoreValue = <T>(k: string): T | undefined =>
  JSON.parse(window.localStorage.getItem(makeStorageKey(k)) ?? "null");

export const setSharedStoreValue = <T>(k: string, v: T) =>
  window.__PLATEAUVIEW3_SHARED?.[k] ? (window.__PLATEAUVIEW3_SHARED[k] = v) : undefined;
export const setStorageStoreValue = <T>(k: string, v: T) =>
  window.localStorage.setItem(makeStorageKey(k), JSON.stringify(v ?? null));
