import { PostMessageProps } from "@web/extensions/sidebar/core/types";

import html from "../dist/web/sidebar/core/index.html?raw";
import dataCatalogHtml from "../dist/web/sidebar/modals/datacatalog/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html, { extended: true });

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  if (action === "updateOverrides") {
    reearth.visualizer.overrideProperty(payload);
  } else if (action === "screenshot" || action === "screenshot-save") {
    reearth.ui.postMessage({
      type: action,
      payload: reearth.scene.captureScreen(),
    });
  } else if (action === "msgFromModal") {
    reearth.ui.postMessage({ type: action, payload });
  } else if (action === "modal-open") {
    reearth.modal.show(dataCatalogHtml, { background: "transparent" });
  } else if (action === "modal-close") {
    reearth.modal.close();
  } else if (action === "minimize") {
    if (payload) {
      reearth.ui.resize(undefined, undefined, false);
    } else {
      reearth.ui.resize(347, undefined, true);
    }
  }
});

reearth.on("update", () => {
  reearth.ui.postMessage({
    type: "extended",
    payload: reearth.widget.extended,
  });
});
