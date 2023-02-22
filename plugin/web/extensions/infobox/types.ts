import type { Template } from "@web/extensions/sidebar/core/types";

export type { Field } from "@web/extensions/sidebar/core/types";
export type ActionType = "getInEditor" | "saveFields" | "init";

export type PostMessageProps = { action: ActionType; payload?: any };

export type Fields = Omit<Template, "components">;

export type Feature = {
  properties: { key: string; value?: any }[];
};

// Reearth types
export type PluginExtensionInstance = {
  id: string;
  pluginId: string;
  name: string;
  extensionId: string;
  extensionType: "widget" | "block";
};

type PluginActionType = "infoboxFieldsFetch";

export type PluginMessage = {
  data: {
    action: PluginActionType;
    payload: any;
  };
  sender: string;
};
