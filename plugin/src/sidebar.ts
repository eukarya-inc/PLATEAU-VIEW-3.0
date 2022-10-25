import { PostMessageProps } from "@web/extensions/sidebar/core/types";

import html from "../dist/web/sidebar/core/index.html?raw";
import dataCatalogHtml from "../dist/web/sidebar/modals/datacatalog/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html);

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  if (action === "updateOverrides") {
    reearth.visualizer.overrideProperty(payload);
  } else if (action === "screenshot" || action === "screenshot-save") {
    reearth.ui.postMessage({
      type: action,
      payload: reearth.scene.captureScreen(),
    });
  } else if (action === "modal-open") {
    reearth.modal.show(dataCatalogHtml);
  } else if (action === "modal-close") {
    reearth.modal.close();
  }
});

reearth.on("update", () => {
  reearth.ui.postMessage({
    type: "extended",
    payload: reearth.widget.extended,
  });
});
