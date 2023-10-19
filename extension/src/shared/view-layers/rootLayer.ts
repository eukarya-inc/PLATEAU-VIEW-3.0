import { PrimitiveAtom, WritableAtom, atom } from "jotai";
import invariant from "tiny-invariant";

import { LayerModel, LayerType } from "../../prototypes/layers";
import { ComponentGroup, Infobox, Setting } from "../api/types";
import { DatasetItem } from "../graphql/types/plateau";
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
  infoboxRef: Infobox | undefined; // TODO: Use API definition
  camera: CameraPosition | undefined;
  layer: PrimitiveAtom<LayerModel>;
};

export type RootLayerConfig = {
  id: string;
  areaCode: string;
  rootLayerAtom: PrimitiveAtom<RootLayer>;
  currentGroupIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
  currentDataIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
};

// TODO: Get default component group from template
const getDefaultComponentGroup = (): ComponentGroup => {
  return {} as ComponentGroup;
};

const findComponentGroup = (
  setting: Setting,
  currentGroupId: string | undefined,
): ComponentGroup | undefined => {
  return (
    setting.groups?.find(g => (currentGroupId ? g.id === currentGroupId : g.default)) ??
    getDefaultComponentGroup()
  );
};

const findSetting = (settings: Setting[], currentDataId: string | undefined) =>
  (currentDataId ? settings.find(s => s.dataId === currentDataId) : settings[0]) ??
  getDefaultSetting();

const findData = (dataList: DatasetItem[], currentDataId: string | undefined) =>
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
  type: LayerType,
  title: string,
  data: DatasetItem | undefined,
  componentGroup: ComponentGroup | undefined,
  shareId: string | undefined,
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
    componentAtoms: makeComponentAtoms(datasetId, componentGroup?.components ?? [], shareId),
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
): RootLayer => {
  const setting = findSetting(settings, currentDataId);
  const group = findComponentGroup(setting, currentGroupId);
  const data = findData(dataList, currentDataId);
  return {
    infoboxRef: setting.infobox,
    camera: setting.camera,
    layer: atom(createViewLayerWithComponentGroup(datasetId, type, title, data, group, shareId)),
  };
};

export const createRootLayerAtom = (params: RootLayerParams): RootLayerConfig => {
  const settings = convertRootLayerParams(params);
  const rootLayerAtom = atom<RootLayer>(
    createRootLayer(
      params.datasetId,
      params.type,
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
          settings,
          update,
          currentGroupId,
          params.shareId,
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
      const setting = findSetting(settings, currentDataId);
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
  };
};
