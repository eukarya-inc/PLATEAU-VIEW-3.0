import { RawDataCatalogItem } from "@web/extensions/sidebar/modals/datacatalog/api/api";
import { generateID } from "@web/extensions/sidebar/utils";
import { cloneDeep, merge } from "lodash";

import { Data, DataCatalogItem } from "../../types";
import { cleanseOverrides } from "../content/common/DatasetCard/Field/fieldHooks";
import { FieldComponent } from "../content/common/DatasetCard/Field/Fields/types";

export const convertToData = (item: DataCatalogItem): Data => {
  return {
    dataID: item.dataID,
    public: item.public,
    components: item.components,
    fieldGroups: item.fieldGroups,
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
    .filter(c => c.updatedAt)
    .sort((a, b) => (a.updatedAt?.getTime?.() ?? 0) - (b.updatedAt?.getTime?.() ?? 0));
  for (const component of needOrderComponents) {
    merge(overrides, action === "cleanse" ? cleanseOverrides[component.type] : component.override);
  }

  for (let i = 0; i < components.length; i++) {
    if (components[i].updatedAt) {
      continue;
    }
    if (components[i].type === "switchDataset" && action === "cleanse") {
      merge(overrides, components[i].cleanseOverride);
      continue;
    }

    merge(
      overrides,
      action === "cleanse" ? cleanseOverrides[components[i].type] : components[i].override,
    );
  }

  return overrides;
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
    fieldGroups: [{ id: generateID(), name: "グループ1" }],
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
      };
    } else {
      return newItem(item);
    }
  });
