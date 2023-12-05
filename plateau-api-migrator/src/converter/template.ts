import { Template as View2Template } from "../types/view2";
import {
  Template as View3Template,
  ComponentTemplate as View3ComponentTemplate,
  ComponentGroup,
} from "../types/view3";

import { convertComponentGroups } from "./components/componentGroups";
import { getView2ID, setView2ID } from "./id";
import { FieldFeatureType } from "./type";

const inferFormatFromTemplateName: Record<string, FieldFeatureType> = {
  ["ランドマーク情報"]: "point",
  ["ランドマーク情報(1.1)"]: "point",
  ["鉄道駅情報"]: "point",
  ["鉄道駅情報(1.1)"]: "point",
  ["避難施設情報"]: "point",
  ["行政界情報"]: "polygon",
};

export const convertTemplate = (
  view2Templates: View2Template[],
  view3Templates: View3Template[],
) => {
  const convertedView3Templates: View3Template[] = [];
  for (const template of view2Templates) {
    const prevView3Template = view3Templates.find(s => getView2ID(s) === template.id);
    if (!template.components?.length) continue;
    const convertedView3ComponentTemplate: Partial<View3ComponentTemplate> = {
      id: prevView3Template?.id,
      type: "component",
      name: `VIEW2.0/${template.name}`,
      groups: convertComponentGroups(template.components ?? [], {
        featureType: inferFormatFromTemplateName[template.name],
      }) as ComponentGroup[],
    };
    setView2ID(convertedView3ComponentTemplate, template);
    convertedView3Templates.push(convertedView3ComponentTemplate as View3ComponentTemplate);
  }
  return convertedView3Templates;
};
