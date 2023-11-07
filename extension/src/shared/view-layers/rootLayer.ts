import { PrimitiveAtom, WritableAtom, atom } from "jotai";
import invariant from "tiny-invariant";

import { LayerModel, LayerType } from "../../prototypes/layers";
import { DEFAULT_SETTING_DATA_ID } from "../api/constants";
import {
  ComponentGroup,
  ComponentTemplate,
  FeatureInspectorSettings,
  GeneralSetting,
  Setting,
  Template,
} from "../api/types";
import { DatasetItem } from "../graphql/types/catalog";
import { REEARTH_DATA_FORMATS } from "../plateau/constants";
import { CameraPosition } from "../reearth/types";
import { sharedStoreAtomWrapper } from "../sharedAtoms";
import { CURRENT_COMPONENT_GROUP_ID, CURRENT_DATA_ID } from "../states/rootLayer";
import { templatesAtom } from "../states/template";

import { makeComponentAtoms } from "./component";
import { createViewLayer } from "./createViewLayer";

export type RootLayerAtomParams = {
  datasetId: string;
  type: LayerType;
  title: string;
  areaCode: string;
  settings: Setting[];
  templates: Template[];
  dataList: DatasetItem[];
  currentDataId?: string;
  shareId?: string;
};

export type RootLayerParams = {
  datasetId: string;
  type: LayerType;
  title: string;
  dataList: DatasetItem[];
  settings: Setting[];
  templates: Template[];
  currentDataId: string | undefined;
  currentGroupId: string | undefined;
  shareId: string | undefined;
  shouldInitialize: boolean;
};

export type RootLayer = {
  general: GeneralSetting | undefined;
  featureInspector: FeatureInspectorSettings | undefined; // TODO: Use API definition
  camera: CameraPosition | undefined;
  layer: PrimitiveAtom<LayerModel>;
};

export type RootLayerConfig = {
  id: string;
  areaCode: string;
  rootLayerAtom: PrimitiveAtom<RootLayer>;
  currentGroupIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
  currentDataIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
  settingsAtom: WritableAtom<Setting[], [settings: Setting[]], void>;
};

const findComponentGroup = (
  setting: Setting | undefined,
  template: ComponentTemplate | undefined,
  currentGroupId: string | undefined,
): ComponentGroup | undefined => {
  const hasTemplate = setting?.fieldComponents?.useTemplate && setting?.fieldComponents?.templateId;
  const groups = hasTemplate ? template?.groups : setting?.fieldComponents?.groups;
  return currentGroupId ? groups?.find(g => g.id === currentGroupId) : groups?.[0];
};

const findSetting = (settings: Setting[], currentDataId: string | undefined) => {
  const result: (Setting | undefined)[] = new Array(2); // [found setting, default setting];
  for (const setting of settings) {
    if (setting.dataId === currentDataId) {
      result[0] = setting;
    }
    if (setting.dataId === DEFAULT_SETTING_DATA_ID) {
      result[1] = setting;
    }
  }

  const [setting, defaultSetting] = result;

  const fieldComponents = setting?.fieldComponents;
  const hasGroups = fieldComponents?.groups?.some(g => !!g.components.length);
  const hasTemplate = fieldComponents?.useTemplate && !!fieldComponents.templateId;

  return hasGroups || hasTemplate ? setting : defaultSetting;
};

// TODO: Get component groups from specific template
const findComponentTemplate = (
  setting: Setting | undefined,
  templates: Template[],
): ComponentTemplate | undefined => {
  const { useTemplate, templateId } = setting?.fieldComponents ?? {};
  if (!useTemplate || !templateId) return;

  const template = templates.find(t => t.id === templateId);

  return template?.type === "component" ? template : undefined;
};

const findData = (dataList: DatasetItem[], currentDataId: string | undefined) =>
  currentDataId ? dataList.find(d => d.id === currentDataId) : dataList[0];

const createViewLayerWithComponentGroup = (
  datasetId: string,
  type: LayerType,
  title: string,
  setting: Setting | undefined,
  data: DatasetItem | undefined,
  componentGroup: ComponentGroup | undefined,
  shareId: string | undefined,
  shouldInitialize: boolean,
): LayerModel => {
  invariant(type);
  return {
    ...createViewLayer({
      type,
      municipalityCode: "",
      title,
      datasetId,
      shareId,
      textured: data?.name !== "LOD1" && data?.name !== "LOD2（テクスチャなし）",
      shouldInitializeAtom: shouldInitialize,
    }),
    componentAtoms: makeComponentAtoms(
      datasetId,
      componentGroup?.components ?? [],
      shareId,
      shouldInitialize,
    ),
    id: datasetId,
    format: data?.format ? REEARTH_DATA_FORMATS[data.format] : undefined,
    url: data?.url,
    componentGroups: setting?.fieldComponents?.groups?.map(
      g => [g.id, g.name] as [id: string, name: string],
    ),
  };
};

// TODO: Get layer from specified dataset
const createRootLayer = ({
  datasetId,
  type,
  title,
  dataList,
  settings,
  templates,
  currentDataId,
  currentGroupId,
  shareId,
  shouldInitialize,
}: RootLayerParams): RootLayer => {
  const setting = findSetting(settings, currentDataId);
  const data = findData(dataList, currentDataId);
  const template = findComponentTemplate(setting, templates);
  const componentGroup = findComponentGroup(setting, template, currentGroupId);

  return {
    // TODO: get settings from featureInspectorTemplate
    general: setting?.general,
    featureInspector: setting?.featureInspector,
    camera: setting?.general?.camera,
    layer: atom(
      createViewLayerWithComponentGroup(
        datasetId,
        type,
        title,
        setting,
        data,
        componentGroup,
        shareId,
        shouldInitialize,
      ),
    ),
  };
};

export const createRootLayerAtom = (params: RootLayerAtomParams): RootLayerConfig => {
  const initialSettings = params.settings;
  const initialTemplates = params.templates;
  const initialCurrentDataId = params.currentDataId ?? params.dataList[0].id;
  const rootLayerAtom = atom<RootLayer>(
    createRootLayer({
      datasetId: params.datasetId,
      type: params.type,
      title: params.title,
      dataList: params.dataList,
      settings: initialSettings,
      templates: initialTemplates,
      currentDataId: initialCurrentDataId,
      currentGroupId: undefined,
      shareId: params.shareId,
      shouldInitialize: true,
    }),
  );

  const settingsPrimitiveAtom = atom(initialSettings);

  const settingsAtom = atom(
    get => get(settingsPrimitiveAtom),
    (get, set, settings: Setting[]) => {
      const currentDataId = get(currentDataIdAtom);
      const currentGroupId = get(currentGroupIdAtom);

      set(
        rootLayerAtom,
        createRootLayer({
          datasetId: params.datasetId,
          type: params.type,
          title: params.title,
          dataList: params.dataList,
          settings: settings,
          templates: get(templatesAtom),
          currentDataId: currentDataId,
          currentGroupId: currentGroupId,
          shareId: params.shareId,
          shouldInitialize: false,
        }),
      );
      set(settingsPrimitiveAtom, settings);
    },
  );

  const currentDataIdAtom = atom<string | undefined>(initialCurrentDataId);

  const currentGroupIdAtom = atom<string | undefined>(undefined);

  const currentDataIdAtomAtom = atom(
    get => get(currentDataIdAtom),
    (get, set, update: string | undefined) => {
      const currentDataId = get(currentDataIdAtom);
      if (currentDataId === update) return;

      const currentGroupId = get(currentGroupIdAtom);
      set(
        rootLayerAtom,
        createRootLayer({
          datasetId: params.datasetId,
          type: params.type,
          title: params.title,
          dataList: params.dataList,
          settings: get(settingsPrimitiveAtom),
          templates: get(templatesAtom),
          currentDataId: update ?? currentDataId,
          currentGroupId: currentGroupId,
          shareId: params.shareId,
          shouldInitialize: false,
        }),
      );
      set(currentDataIdAtom, () => update);
    },
  );

  const currentGroupIdAtomAtom = atom(
    get => get(currentGroupIdAtom),
    (get, set, update: string | undefined) => {
      const currentGroupId = get(currentGroupIdAtom);
      if (currentGroupId === update) return;

      const rootLayer = get(rootLayerAtom);
      const currentDataId = get(currentDataIdAtom);
      const setting = findSetting(get(settingsPrimitiveAtom), currentDataId);
      const data = findData(params.dataList, currentDataId);
      const template = findComponentTemplate(setting, get(templatesAtom));
      const group = findComponentGroup(setting, template, update);

      set(
        rootLayer.layer,
        createViewLayerWithComponentGroup(
          params.datasetId,
          params.type,
          params.title,
          setting,
          data,
          group,
          params.shareId,
          false,
        ),
      );
      set(currentGroupIdAtom, () => update);
    },
  );

  const shareableCurrentDataIdName = `${params.datasetId}_${CURRENT_DATA_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentDataIdAtom = sharedStoreAtomWrapper(
    shareableCurrentDataIdName,
    currentDataIdAtomAtom,
  );

  const shareableCurrentComponentGroupIdName = `${params.datasetId}_${CURRENT_COMPONENT_GROUP_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentGroupIdAtom = sharedStoreAtomWrapper(
    shareableCurrentComponentGroupIdName,
    currentGroupIdAtomAtom,
  );

  return {
    id: params.datasetId,
    areaCode: params.areaCode,
    rootLayerAtom: atom(
      get => get(rootLayerAtom),
      () => {}, // readonly
    ),
    currentDataIdAtom: shareableCurrentDataIdAtom,
    currentGroupIdAtom: shareableCurrentGroupIdAtom,
    settingsAtom,
  };
};
