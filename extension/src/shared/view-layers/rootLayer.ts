import { PrimitiveAtom, WritableAtom, atom } from "jotai";
import { isEqual } from "lodash-es";
import invariant from "tiny-invariant";

import { LayerModel, LayerType } from "../../prototypes/layers";
import { DEFAULT_SETTING_DATA_ID } from "../api/constants";
import { ComponentGroup, FeatureInspectorSettings, GeneralSetting, Setting } from "../api/types";
import { DatasetItem } from "../graphql/types/catalog";
import { REEARTH_DATA_FORMATS } from "../plateau/constants";
import { CameraPosition } from "../reearth/types";
import { sharedStoreAtomWrapper } from "../sharedAtoms";
import { CURRENT_COMPONENT_GROUP_ID, CURRENT_DATA_ID } from "../states/rootLayer";

import { makeComponentAtoms } from "./component";
import { createViewLayer } from "./createViewLayer";

export type RootLayerParams = {
  datasetId: string;
  type: LayerType;
  title: string;
  areaCode: string;
  settings: Setting[];
  dataList: DatasetItem[];
  currentDataId?: string;
  shareId?: string;
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

// TODO: Get component groups from specific template
const getComponentGroupsFromTemplate = (templateId: string): ComponentGroup[] | undefined => {
  console.log("TODO: Get component groups with templateId", templateId);
  return [] as ComponentGroup[];
};

const findComponentGroup = (
  setting: Setting | undefined,
  currentGroupId: string | undefined,
): ComponentGroup | undefined => {
  if (!setting) return;
  const groups = setting.fieldComponents?.templateId
    ? getComponentGroupsFromTemplate(setting.fieldComponents.templateId)
    : setting.fieldComponents?.groups;
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

  return setting?.fieldComponents?.groups?.some(g => !!g.components.length)
    ? setting
    : defaultSetting;
};

const findData = (dataList: DatasetItem[], currentDataId: string | undefined) =>
  currentDataId ? dataList.find(d => d.id === currentDataId) : dataList[0];

const createViewLayerWithComponentGroup = (
  datasetId: string,
  type: LayerType,
  title: string,
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
  };
};

// TODO: Get layer from specified dataset
const createRootLayer = (
  datasetId: string,
  type: LayerType,
  title: string,
  dataList: DatasetItem[],
  settings: Setting[],
  currentDataId: string | undefined,
  currentGroupId: string | undefined,
  shareId: string | undefined,
  shouldInitialize: boolean,
): RootLayer => {
  const setting = findSetting(settings, currentDataId);
  const componentGroup = findComponentGroup(setting, currentGroupId);
  const data = findData(dataList, currentDataId);

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
        data,
        componentGroup,
        shareId,
        shouldInitialize,
      ),
    ),
  };
};

export const createRootLayerAtom = (params: RootLayerParams): RootLayerConfig => {
  const initialSettings = params.settings;
  const initialCurrentDataId = params.currentDataId ?? params.dataList[0].id;
  const rootLayerAtom = atom<RootLayer>(
    createRootLayer(
      params.datasetId,
      params.type,
      params.title,
      params.dataList,
      initialSettings,
      initialCurrentDataId,
      undefined,
      params.shareId,
      true,
    ),
  );

  const settingsPrimitiveAtom = atom(initialSettings);
  const settingsAtom = atom(
    get => get(settingsPrimitiveAtom),
    (get, set, settings: Setting[]) => {
      const prevSettings = get(settingsPrimitiveAtom);
      const nextSettings = settings;

      if (isEqual(prevSettings, nextSettings)) return;

      const currentDataId = get(currentDataIdAtom);
      const currentGroupId = get(currentGroupIdAtom);

      set(
        rootLayerAtom,
        createRootLayer(
          params.datasetId,
          params.type,
          params.title,
          params.dataList,
          nextSettings,
          currentDataId,
          currentGroupId,
          params.shareId,
          false,
        ),
      );
      set(settingsPrimitiveAtom, nextSettings);
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
        createRootLayer(
          params.datasetId,
          params.type,
          params.title,
          params.dataList,
          get(settingsPrimitiveAtom),
          update ?? currentDataId,
          currentGroupId,
          params.shareId,
          false,
        ),
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
      const group = findComponentGroup(setting, update);

      set(
        rootLayer.layer,
        createViewLayerWithComponentGroup(
          params.datasetId,
          params.type,
          params.title,
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
