import { PrimitiveAtom, WritableAtom, atom } from "jotai";
import invariant from "tiny-invariant";

import { LayerModel } from "../../prototypes/layers";
import { ComponentGroup, Data, FeatureInspectorConfig, Setting } from "../api/types";
import { CameraPosition } from "../reearth/types";
import { sharedStoreAtomWrapper, storageStoreAtomWrapper } from "../sharedAtoms";
import { CURRENT_COMPONENT_GROUP_ID, CURRENT_DATA_ID } from "../states/rootLayer";

import { makeComponentAtoms } from "./component";
import { createViewLayer } from "./createViewLayer";

export type RootLayerParams = {
  datasetId: string;
  title: string;
  settings: Setting[];
  dataList: Data[];
  currentDataId?: string;
  shareId?: string;
};

export type RootLayer = {
  featureInspector: FeatureInspectorConfig | undefined; // TODO: Use API definition
  camera: CameraPosition | undefined;
  layer: PrimitiveAtom<LayerModel>;
};

export type RootLayerConfig = {
  rootLayerAtom: PrimitiveAtom<RootLayer>;
  currentGroupIdAtom: WritableAtom<string | undefined, [update: string], void>;
  currentDataIdAtom: WritableAtom<string | undefined, [update: string], void>;
};

// TODO: Get default component group from template
const getDefaultComponentGroup = (): ComponentGroup => {
  return {} as ComponentGroup;
};

// TODO: Get component groups from specific template
const getComponentGroupsFromTemplate = (templateId: string): ComponentGroup[] | undefined => {
  console.log(templateId);
  return [] as ComponentGroup[];
};

const findComponentGroup = (
  setting: Setting,
  currentGroupId: string | undefined,
): ComponentGroup | undefined => {
  return (
    (setting.fieldComponents?.templateId
      ? getComponentGroupsFromTemplate(setting.fieldComponents.templateId)
      : setting.fieldComponents?.groups
    )?.find(g => (currentGroupId ? g.id === currentGroupId : g.default)) ??
    getDefaultComponentGroup()
  );
};

const findSetting = (settings: Setting[], currentDataId: string | undefined) =>
  (currentDataId ? settings.find(s => s.dataId === currentDataId) : settings[0]) ??
  getDefaultSetting();

const findData = (dataList: Data[], currentDataId: string | undefined) =>
  currentDataId ? dataList.find(d => d.id === currentDataId) : dataList[0];

// TODO: Set default settings
const getDefaultSetting = (): Setting => {
  return {} as Setting;
};

const convertRootLayerParams = (params: RootLayerParams) => {
  return params.dataList.map(data => {
    const setting = params.settings.find(s => s.dataId === data.id);
    if (setting) {
      return setting;
    } else {
      return getDefaultSetting();
    }
  });
};

const createViewLayerWithComponentGroup = (
  datasetId: string,
  title: string,
  data: Data | undefined,
  componentGroup: ComponentGroup | undefined,
  shareId: string | undefined,
): LayerModel => {
  const type = data?.type;
  invariant(type);
  return {
    ...createViewLayer({
      type,
      municipalityCode: "",
      title,
      datasetId,
      shareId,
    }),
    componentAtoms: makeComponentAtoms(datasetId, componentGroup?.components ?? [], shareId),
    id: datasetId,
    format: data?.format,
    url: data?.url,
  };
};

// TODO: Get layer from specified dataset
const createRootLayer = (
  datasetId: string,
  title: string,
  dataList: Data[],
  settings: Setting[],
  currentDataId: string | undefined,
  currentGroupId: string | undefined,
  shareId: string | undefined,
): RootLayer => {
  const setting = findSetting(settings, currentDataId);
  const componentGroup = findComponentGroup(setting, currentGroupId);
  const data = findData(dataList, currentDataId);
  return {
    // TODO: get settings from featureInspectorTemplate
    featureInspector: setting.featureInspector?.config,
    camera: setting.general?.camera,
    layer: atom(createViewLayerWithComponentGroup(datasetId, title, data, componentGroup, shareId)),
  };
};

export const createRootLayerAtom = (params: RootLayerParams): RootLayerConfig => {
  const settings = convertRootLayerParams(params);
  const rootLayerAtom = atom<RootLayer>(
    createRootLayer(
      params.datasetId,
      params.title,
      params.dataList,
      settings,
      params.currentDataId,
      undefined,
      params.shareId,
    ),
  );

  const currentDataIdAtom = atom<string | undefined>(params.currentDataId);

  const currentGroupIdAtom = atom<string | undefined>(undefined);

  const currentDataIdAtomAtom = atom(
    get => get(currentDataIdAtom),
    (get, set, update: string) => {
      const currentDataId = get(currentDataIdAtom);
      const currentGroupId = get(currentGroupIdAtom);
      set(
        rootLayerAtom,
        createRootLayer(
          params.datasetId,
          params.title,
          params.dataList,
          settings,
          currentDataId,
          currentGroupId,
          params.shareId,
        ),
      );
      set(currentDataIdAtom, () => update);
    },
  );

  const currentGroupIdAtomAtom = atom(
    get => get(currentGroupIdAtom),
    (get, set, update: string) => {
      const rootLayer = get(rootLayerAtom);
      const currentDataId = get(currentDataIdAtom);
      const setting = findSetting(settings, currentDataId);
      const data = findData(params.dataList, currentDataId);
      const group = findComponentGroup(setting, update);
      set(
        rootLayer.layer,
        createViewLayerWithComponentGroup(
          params.datasetId,
          params.title,
          data,
          group,
          params.shareId,
        ),
      );
      set(currentGroupIdAtom, () => update);
    },
  );

  const shareableCurrentDataIdName = `${params.datasetId}_${CURRENT_DATA_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentDataIdAtom = storageStoreAtomWrapper(
    shareableCurrentDataIdName,
    sharedStoreAtomWrapper(shareableCurrentDataIdName, currentDataIdAtomAtom),
  );

  const shareableCurrentComponentGroupIdName = `${params.datasetId}_${CURRENT_COMPONENT_GROUP_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentGroupIdAtom = storageStoreAtomWrapper(
    shareableCurrentComponentGroupIdName,
    sharedStoreAtomWrapper(shareableCurrentComponentGroupIdName, currentGroupIdAtomAtom),
  );

  return {
    rootLayerAtom: atom(
      get => get(rootLayerAtom),
      () => {}, // readonly
    ),
    currentDataIdAtom: shareableCurrentDataIdAtom,
    currentGroupIdAtom: shareableCurrentGroupIdAtom,
  };
};
