import { RawDataCatalogItem } from "@web/extensions/sidebar/modals/datacatalog/api/api";
import { cloneDeep, isEqual, merge } from "lodash";

import { Data, DataCatalogItem, Template } from "../types";

import { cleanseOverrides } from "./content/common/DatasetCard/Field/fieldConstants";
import { FieldComponent } from "./content/common/DatasetCard/Field/Fields/types";

export const convertToData = (item: DataCatalogItem, templates?: Template[]): Data => {
  return {
    dataID: item.dataID,
    public: item.public,
    components: item.components?.map((c: any) => {
      const newComp = Object.assign({}, c);
      if (newComp.type === "template" && newComp.components) {
        newComp.components =
          templates
            ?.find(t => t.id === newComp.templateID)
            ?.components?.map(c => {
              return { ...c, userSettings: undefined };
            }) ?? [];
      }
      return { ...newComp, userSettings: undefined };
    }),
  };
};

export const mergeOverrides = (
  action: "update" | "cleanse",
  components?: FieldComponent[],
  startingOverride?: any,
) => {
  if (!components || !components.length) {
    if (startingOverride) {
      return startingOverride;
    }
    return;
  }

  const overrides = cloneDeep(startingOverride ?? {});

  const needOrderComponents = components
    .filter(c => (c as any).userSettings?.updatedAt)
    .sort(
      (a, b) =>
        ((a as any).userSettings?.updatedAt?.getTime?.() ?? 0) -
        ((b as any).userSettings?.updatedAt?.getTime?.() ?? 0),
    );
  for (const component of needOrderComponents) {
    merge(
      overrides,
      action === "cleanse"
        ? cleanseOverrides[component.type]
        : (component as any).userSettings?.override ?? component.override,
    );
  }

  for (let i = 0; i < components.length; i++) {
    if ((components[i] as any).userSettings?.updatedAt) {
      continue;
    }
    if (components[i].type === "switchDataset") {
      const switchDatasetOverride =
        (components[i] as any).userSettings?.override ??
        (action === "cleanse"
          ? components[i].cleanseOverride
          : {
              data: {
                ...(components[i].cleanseOverride.data.url
                  ? { url: components[i].cleanseOverride.data.url }
                  : {}),
                time: {
                  updateClockOnLoad: true,
                },
              },
            });
      merge(overrides, switchDatasetOverride);
      continue;
    }

    merge(
      overrides,
      action === "cleanse"
        ? cleanseOverrides[components[i].type]
        : (components[i] as any).userSettings?.override ?? components[i].override,
    );
  }

  return isEqual(overrides, {}) ? undefined : overrides;
};

export const updateExtended = (e: { vertically: boolean }) => {
  const html = document.querySelector("html");
  const body = document.querySelector("body");
  const root = document.getElementById("root");

  if (e?.vertically) {
    html?.classList.add("extended");
    body?.classList.add("extended");
    root?.classList.add("extended");
  } else {
    html?.classList.remove("extended");
    body?.classList.remove("extended");
    root?.classList.remove("extended");
  }
};

export const newItem = (ri: RawDataCatalogItem): DataCatalogItem => {
  return {
    ...ri,
    dataID: ri.id,
    public: false,
    visible: true,
  };
};

export const handleDataCatalogProcessing = (
  catalog: (DataCatalogItem | RawDataCatalogItem)[],
  savedData?: Data[],
): DataCatalogItem[] =>
  catalog.map(item => {
    if (!savedData) return newItem(item);

    const savedData2 = savedData.find(d => d.dataID === ("dataID" in item ? item.dataID : item.id));
    if (savedData2) {
      return {
        ...item,
        ...savedData2,
        visible: true,
        selectedGroup: (savedData2.components?.find(c => c.type === "switchGroup") as any)
          ?.groups?.[0]?.fieldGroupID,
      };
    } else {
      return newItem(item);
    }
  });
