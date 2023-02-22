import {
  PostMessageProps,
  PluginExtensionInstance,
  PluginMessage,
} from "@web/extensions/infobox/types";

import html from "../dist/web/infobox/core/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html);

let sidebarId: string;
const getSidebarId = () => {
  if (sidebarId) return;
  sidebarId = reearth.plugins.instances.find(
    (instance: PluginExtensionInstance) => instance.extensionId === "sidebar",
  )?.id;
};
getSidebarId();

const infoboxFieldsFetch = () => {
  getSidebarId();
  if (!sidebarId) return;
  reearth.plugins.postMessage(sidebarId, {
    action: "infoboxFieldsFetch",
  });
};

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  if (action === "init") {
    reearth.ui.postMessage({
      action: "getInEditor",
      payload: reearth.scene.inEditor,
    });
    infoboxFieldsFetch();
  } else if (action === "saveFields") {
    getSidebarId();
    if (!sidebarId) return;
    reearth.plugins.postMessage(sidebarId, {
      action: "infoboxFieldsSave",
      payload,
    });
  }
});

reearth.on("pluginmessage", (pluginMessage: PluginMessage) => {
  if (pluginMessage.data.action === "infoboxFieldsFetch") {
    if (reearth.layers.selectedFeature) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { attributes, ...rawProperties } = reearth.layers.selectedFeature.properties;
      const properties: { key: string; value?: any }[] = [];
      Object.keys(rawProperties).forEach(key => {
        properties.push({
          key,
          value: rawProperties[key],
        });
      });
      reearth.ui.postMessage({
        action: "fillData",
        payload: {
          feature: {
            properties,
          },
          fields: pluginMessage.data.payload,
        },
      });
    } else {
      reearth.ui.postMessage({
        action: "setEmpty",
      });
    }
  } else if (pluginMessage.data.action === "infoboxFieldsSaved") {
    reearth.ui.postMessage({
      action: "saveFinish",
    });
  }
});

reearth.on("select", () => {
  infoboxFieldsFetch();

  reearth.ui.postMessage({
    action: "setLoading",
  });
});
