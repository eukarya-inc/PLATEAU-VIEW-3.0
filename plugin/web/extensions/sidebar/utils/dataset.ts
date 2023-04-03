import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";

import {
  ConfigData,
  FieldComponent,
  SwitchGroup,
} from "../core/components/content/common/DatasetCard/Field/Fields/types";
import { DataCatalogItem, Template } from "../core/types";

export const getActiveFieldIDs = (
  components?: FieldComponent[],
  selectedGroup?: string,
  config?: ConfigData[],
  templates?: Template[],
) =>
  flattenComponents(components, templates)
    ?.filter(
      c =>
        !selectedGroup ||
        !c.group ||
        c.type === "switchGroup" ||
        (c.group && c.group === selectedGroup),
    )
    ?.filter(c => !(!config && c.type === "switchDataset"))
    ?.map(c => c.id);

export const flattenComponents = (components?: FieldComponent[], baseTemplates?: Template[]) =>
  components?.reduce((a: FieldComponent[], c?: FieldComponent) => {
    if (!c) return a;
    if (c.type === "template") {
      return [
        ...a,
        c,
        ...((c as any).userSettings?.components ??
          baseTemplates?.find(t => t.id === c.templateID)?.components ??
          []),
      ];
    } else {
      return [...a, c];
    }
  }, []);

export const getDefaultGroup = (components?: FieldComponent[], baseTemplates?: Template[]) => {
  if (!components) return;

  const switchGroupComponents = flattenComponents(components, baseTemplates)?.filter(
    c => c.type === "switchGroup",
  ) as SwitchGroup[] | undefined;

  if (switchGroupComponents && switchGroupComponents.length > 0) {
    return switchGroupComponents[switchGroupComponents.length - 1].groups[0].fieldGroupID;
  }
};

export const getDefaultDataset = (dataset?: DataCatalogItem | UserDataItem) => {
  if (!dataset) return;

  if (dataset.config?.data && dataset.config?.data?.length > 0) {
    return dataset.config.data[0];
  }
};
