import { PrimitiveAtom, WritableAtom, atom } from "jotai";
import invariant from "tiny-invariant";

import { LayerModel, LayerType } from "../../prototypes/layers";
import { datasetTypeLayers } from "../../prototypes/view/constants/datasetTypeLayers";
import { PlateauDatasetType } from "../../prototypes/view/constants/plateau";
import { DEFAULT_SETTING_DATA_ID } from "../api/constants";
import {
  ComponentGroup,
  ComponentTemplate,
  EmphasisProperty,
  FeatureInspectorSettings,
  GeneralSetting,
  Setting,
  Template,
} from "../api/types";
import { DatasetFragmentFragment, DatasetItem, DatasetType } from "../graphql/types/catalog";
import { REEARTH_DATA_FORMATS } from "../plateau/constants";
import { CameraPosition } from "../reearth/types";
import { sharedStoreAtomWrapper } from "../sharedAtoms";
import { CURRENT_COMPONENT_GROUP_ID, CURRENT_DATA_ID } from "../states/rootLayer";
import { templatesAtom } from "../states/template";
import { generateID } from "../utils/id";

import { makeComponentAtoms } from "./component";
import { ViewLayerModelParams, createViewLayer } from "./createViewLayer";

export type RootLayerForDatasetAtomParams = {
  areaCode: string;
  settings: Setting[];
  templates: Template[];
  currentDataId?: string;
  shareId?: string;
  dataset: DatasetFragmentFragment;
};

export type RootLayerForDatasetParams = {
  datasetId: string;
  datasetType: DatasetType;
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

export type RootLayerForLayerAtomParams<T extends LayerType> = {
  id?: string;
  type: T;
  title?: string;
  shareId?: string;
  shouldInitialize?: boolean;
} & ViewLayerModelParams<T>;

export type RootLayerForDataset = {
  type: "dataset";
  general: GeneralSetting | undefined;
  featureInspector: FeatureInspectorSettings | undefined; // TODO: Use API definition
  layer: PrimitiveAtom<LayerModel>;
};

export type RootLayerForLayer<T extends LayerType = LayerType> = {
  id: string;
  type: "layer";
  layer: PrimitiveAtom<LayerModel<T>>;
};

export type RootLayerConfigForDataset = {
  type: "dataset";
  id: string;
  areaCode: string;
  rootLayerAtom: PrimitiveAtom<RootLayerForDataset>;
  currentGroupIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
  currentDataIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
  settingsAtom: WritableAtom<Setting[], [settings: Setting[]], void>;
  rawDataset: DatasetFragmentFragment;
};

export type RootLayerAtom = PrimitiveAtom<RootLayerForDataset | RootLayerForLayer>;

export type RootLayerConfigForLayer = {
  type: "layer";
  rootLayerAtom: PrimitiveAtom<RootLayerForLayer>;
};

export type RootLayerConfig = RootLayerConfigForDataset | RootLayerConfigForLayer;

const findComponentGroup = (
  setting: Setting | undefined,
  template: ComponentTemplate | undefined,
  currentGroupId: string | undefined,
): ComponentGroup | undefined => {
  const groups = template ? template.groups : setting?.fieldComponents?.groups;
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

const findComponentTemplate = (
  setting: Setting | undefined,
  templates: Template[],
  dataName: string | undefined,
): ComponentTemplate | undefined => {
  const { useTemplate, templateId, groups } = setting?.fieldComponents ?? {};

  // Default template
  const templateWithName = dataName
    ? templates.find(t => t.name.split("/").slice(-1)[0] === dataName)
    : undefined;

  if (
    (!useTemplate || !templateId) &&
    // If there is no group, use the default template
    (groups?.some(g => !!g.components.length) || !templateWithName)
  )
    return;

  const template =
    !useTemplate || !templateId ? templateWithName : templates.find(t => t.id === templateId);

  return template?.type === "component" ? template : undefined;
};

const findEmphasisProperties = (
  featureInspector: FeatureInspectorSettings | undefined,
  templates: Template[],
  dataName: string | undefined,
): EmphasisProperty[] | undefined => {
  const { useTemplate, templateId, properties } = featureInspector?.emphasisProperty ?? {};

  // Default template
  const templateWithName = dataName
    ? templates.find(t => t.name.split("/").slice(-1)[0] === dataName)
    : undefined;

  // If there is no emphasis property, use the default template
  if ((!useTemplate || !templateId) && (!!properties?.length || !templateWithName))
    return properties;

  const template =
    !useTemplate || !templateId ? templateWithName : templates.find(t => t.id === templateId);

  return template?.type === "emphasis" ? template.properties : undefined;
};

const findData = (dataList: DatasetItem[], currentDataId: string | undefined) =>
  currentDataId ? dataList.find(d => d.id === currentDataId) : dataList[0];

const createViewLayerWithComponentGroup = (
  datasetId: string,
  type: LayerType,
  title: string,
  setting: Setting | undefined,
  template: ComponentTemplate | undefined,
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
    layers: data?.layers ?? undefined,
    cameraAtom: atom<CameraPosition | undefined>(undefined),
    componentGroups: (template ?? setting?.fieldComponents)?.groups?.map(
      g => [g.id, g.name] as [id: string, name: string],
    ),
  };
};

const createRootLayerForDataset = ({
  datasetId,
  type,
  title,
  datasetType,
  dataList,
  settings,
  templates,
  currentDataId,
  currentGroupId,
  shareId,
  shouldInitialize,
}: RootLayerForDatasetParams): RootLayerForDataset => {
  const setting = findSetting(settings, currentDataId);
  const data = findData(dataList, currentDataId);
  const componentTemplate = findComponentTemplate(setting, templates, datasetType.name);
  const emphasisProperties = findEmphasisProperties(
    setting?.featureInspector,
    templates,
    datasetType.name,
  );
  const componentGroup = findComponentGroup(setting, componentTemplate, currentGroupId);

  return {
    type: "dataset",
    // TODO: get settings from featureInspectorTemplate
    general: setting?.general,
    featureInspector: setting?.featureInspector
      ? {
          ...setting.featureInspector,
          emphasisProperty: {
            ...(setting.featureInspector.emphasisProperty ?? {}),
            properties: emphasisProperties,
          },
        }
      : undefined,
    layer: atom(
      createViewLayerWithComponentGroup(
        datasetId,
        type,
        title,
        setting,
        componentTemplate,
        data,
        componentGroup,
        shareId,
        shouldInitialize,
      ),
    ),
  };
};

export const createRootLayerForDatasetAtom = (
  params: RootLayerForDatasetAtomParams,
): RootLayerConfig => {
  const dataset = params.dataset;
  const dataList = dataset.items as DatasetItem[];
  const type = datasetTypeLayers[dataset.type.code as PlateauDatasetType];

  const initialSettings = params.settings;
  const initialTemplates = params.templates;
  const initialCurrentDataId = params.currentDataId ?? dataList[0].id;
  const rootLayerAtom = atom<RootLayerForDataset>(
    createRootLayerForDataset({
      datasetId: dataset.id,
      type,
      title: dataset.name,
      datasetType: dataset.type,
      dataList,
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
        createRootLayerForDataset({
          datasetId: dataset.id,
          type,
          title: dataset.name,
          datasetType: dataset.type,
          dataList,
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
        createRootLayerForDataset({
          datasetId: dataset.id,
          type,
          title: dataset.name,
          datasetType: dataset.type,
          dataList,
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
      if (rootLayer.type !== "dataset") return;

      const currentDataId = get(currentDataIdAtom);
      const setting = findSetting(get(settingsPrimitiveAtom), currentDataId);
      const data = findData(dataList, currentDataId);
      const template = findComponentTemplate(setting, get(templatesAtom), dataset.type.name);
      const group = findComponentGroup(setting, template, update);

      set(
        rootLayer.layer,
        createViewLayerWithComponentGroup(
          dataset.id,
          type,
          dataset.name,
          setting,
          template,
          data,
          group,
          params.shareId,
          false,
        ),
      );
      set(currentGroupIdAtom, () => update);
      return;
    },
  );

  const shareableCurrentDataIdName = `${dataset.id}_${CURRENT_DATA_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentDataIdAtom = sharedStoreAtomWrapper(
    shareableCurrentDataIdName,
    currentDataIdAtomAtom,
  );

  const shareableCurrentComponentGroupIdName = `${dataset.id}_${CURRENT_COMPONENT_GROUP_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentGroupIdAtom = sharedStoreAtomWrapper(
    shareableCurrentComponentGroupIdName,
    currentGroupIdAtomAtom,
  );

  return {
    type: "dataset",
    id: dataset.id,
    areaCode: params.areaCode,
    rootLayerAtom: atom(
      get => get(rootLayerAtom),
      () => {}, // readonly
    ),
    currentDataIdAtom: shareableCurrentDataIdAtom,
    currentGroupIdAtom: shareableCurrentGroupIdAtom,
    settingsAtom,
    rawDataset: dataset,
  };
};

export const createRootLayerForLayerAtom = <T extends LayerType>({
  id,
  type,
  title,
  shareId,
  shouldInitialize,
  ...props
}: RootLayerForLayerAtomParams<T>): RootLayerConfig => {
  const rootLayerId = id ?? generateID();
  const rootLayer: RootLayerForLayer<T> = {
    id: rootLayerId,
    type: "layer",
    layer: atom({
      ...(createViewLayer({
        id: rootLayerId,
        type: type as LayerType,
        title: title ?? "",
        datasetId: undefined,
        shareId,
        municipalityCode: "",
        shouldInitializeAtom: shouldInitialize,
        ...props,
      }) as LayerModel<T>),
    }),
  };
  return {
    type: "layer",
    rootLayerAtom: atom(
      () => rootLayer,
      () => {}, // readonly
    ) as unknown as PrimitiveAtom<RootLayerForLayer>,
  };
};
