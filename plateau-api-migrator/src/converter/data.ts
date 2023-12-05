import { DEFAULT_SETTING_DATA_ID } from "../../../extension/src/shared/api/constants";
import { RawDataCatalogItem, Data as View2Data } from "../types/view2";
import { TemplateField as View2TemplateField } from "../types/view2/fields";
import {
  Template as View3Template,
  Setting as View3Setting,
  ComponentGroup as View3ComponentGroup,
} from "../types/view3";

import { convertComponentGroups } from "./components";
import { getView2ID, setView2ID } from "./id";

export const convertData = (
  view2DataList: View2Data[],
  view2Datacatalog: RawDataCatalogItem[],
  view3Settings: View3Setting[],
  view3Templates: View3Template[],
) => {
  const convertedView3Settings: Partial<View3Setting>[] = [];
  for (const data of view2DataList) {
    if (!data.components?.length) continue;

    if (!view2Datacatalog.some(d => d.id === data.dataID)) continue;

    const templateField = data.components.find(
      (c): c is View2TemplateField => c.type === "template",
    );
    const view3Template = templateField
      ? view3Templates.find(t => getView2ID(t) === templateField.templateID)
      : undefined;

    const prevView3Setting = view3Settings.find(s => getView2ID(s) === data.id);
    const convertedView3Setting: Partial<View3Setting> = {
      id: prevView3Setting?.id,
      datasetId: `d_${data.dataID}`,
      dataId: DEFAULT_SETTING_DATA_ID,
      fieldComponents: {
        useTemplate: !!view3Template?.id,
        templateId: view3Template?.id,
        groups: convertComponentGroups(data.components) as View3ComponentGroup[],
      },
    };
    setView2ID(convertedView3Setting, data);
    convertedView3Settings.push(convertedView3Setting);
  }
  return convertedView3Settings;
};
