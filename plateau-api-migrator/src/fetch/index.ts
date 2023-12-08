import { env } from "../env";
import { Data as View2Data, Template as View2Template, RawDataCatalogItem } from "../types/view2";
import { Setting as View3Setting, Template as View3Template } from "../types/view3";

import { fetchWithGet, fetchWithPatch, fetchWithPost } from "./base";

const handleError = <T>(obj: T) => {
  if (!obj) return [];
  if (typeof obj === "object" && "error" in obj) return [];
  if (!Array.isArray(obj)) return [];
  return obj;
};

export const fetchView2Data = async () => {
  const e = env();
  return handleError(
    await fetchWithGet<View2Data[]>(
      `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW2}/data`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

export const fetchView2Template = async () => {
  const e = env();
  return handleError(
    await fetchWithGet<View2Template[]>(
      `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW2}/templates`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

export const fetchView2Datacatalog = async () => {
  const e = env();
  return handleError(await fetchWithGet<RawDataCatalogItem[]>(e.PLATEAU_DATACATALOG_API_VIEW2));
};

export const fetchView3Data = async () => {
  const e = env();
  return handleError(
    await fetchWithGet<View3Setting[]>(
      `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/data`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

export const fetchView3Template = async () => {
  const e = env();
  return handleError(
    await fetchWithGet<View3Template[]>(
      `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/templates`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

export const postView3Data = (data: View3Setting[]) => {
  const e = env();
  return Promise.all(
    data.map(d => {
      if (d.id) {
        return fetchWithPatch<View3Setting>(
          `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/data/${d.id}`,
          d,
          e.PLATEAU_SIDEBAR_API_TOKEN,
        );
      }
      return fetchWithPost<View3Setting>(
        `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/data`,
        d,
        e.PLATEAU_SIDEBAR_API_TOKEN,
      );
    }),
  );
};

export const postView3Template = (templates: View3Template[]) => {
  const e = env();
  return Promise.all(
    templates.map(t => {
      if (t.id) {
        return fetchWithPatch<View3Template>(
          `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/templates/${t.id}`,
          t,
          e.PLATEAU_SIDEBAR_API_TOKEN,
        );
      }
      return fetchWithPost<View3Template>(
        `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/templates`,
        t,
        e.PLATEAU_SIDEBAR_API_TOKEN,
      );
    }),
  );
};
