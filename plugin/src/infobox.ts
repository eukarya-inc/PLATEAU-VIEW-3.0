import {
  PostMessageProps,
  PluginExtensionInstance,
  SavePublicSetting,
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

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  if (action === "getInEditor") {
    reearth.ui.postMessage({
      action: "getInEditor",
      payload: reearth.scene.inEditor,
    });
  } else if (action === "savePublicSetting") {
    getSidebarId();
    if (!sidebarId) return;
    reearth.plugins.postMessage(sidebarId, {
      action: "savePublicSetting",
      payload,
    } as SavePublicSetting);
  }
});
