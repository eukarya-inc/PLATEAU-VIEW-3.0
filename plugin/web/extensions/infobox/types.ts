export type ActionType = "getInEditor" | "savePublicSetting";

export type PostMessageProps = { action: ActionType; payload?: any };

export type Layer = {
  id: string;
  primitives: Primitive[];
};

export type Primitive = {
  type?: TilesType;
  properties: PrimitiveProperty[];
};

export type PrimitiveProperty = { key: string; value?: any };

export type TilesType = "building" | "bridge";
export type TilesTypeTitle = "建物情報" | "ブリッジ情報";

export type PublicSetting = {
  type: TilesType;
  typeTitle?: TilesTypeTitle;
  properties: PublicProperty[];
};

export type PublicProperty = {
  key: string;
  title?: string;
  hidden?: boolean;
};

// Reearth types
export type PluginExtensionInstance = {
  id: string;
  pluginId: string;
  name: string;
  extensionId: string;
  extensionType: "widget" | "block";
};

// Communication

// Each 3d tiles will have a tilesType (set in database)
// When adding 3d tiles into the map, sidebar need to record the new layerId - tilesType.

// When 3dtiles been selected, infobox need to know
//  1) its type
//  2) the property settings for its type
// The requests are sepreated so that the property settings for a certain type can be catched to save requests.
// Since there might be multiple select (not sure), the layerIds is an array.

// infobox -> sidebar
export type Request3DTilesType = {
  action: "request3DTilesType";
  payload: {
    layerIds: string[];
  };
};

// sidebar -> infobox
export type LayerType = {
  layerId: string;
  tilesType: TilesType;
};

export type Get3DTilesType = {
  action: "Get3DTilesType";
  payload: {
    layerTypes: LayerType[];
  };
};

// infobox -> sidebar
export type RequestPublicSettings = {
  action: "requestPublicSettings";
  payload: {
    types: string[];
  };
};

// sidebar -> infobox
export type GetPublicSettings = {
  action: "getPublicSettings";
  payload: {
    publicSettings: PublicSetting[];
  };
};

// infobox -> sidebar
export type SavePublicSetting = {
  action: "savePublicSetting";
  payload: {
    publicSetting: PublicSetting;
  };
};
