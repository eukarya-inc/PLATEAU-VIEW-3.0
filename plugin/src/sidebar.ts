import { PostMessageProps } from "@web/extensions/sidebar/core/types";

import html from "../dist/web/sidebar/core/index.html?raw";
import dataCatalogHtml from "../dist/web/sidebar/modals/datacatalog/index.html?raw";

const reearth = (globalThis as any).reearth;

let addedDatasets: string | undefined = undefined;

reearth.ui.show(html, { extended: true });

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  // Sidebar
  if (action === "init") {
    reearth.ui.postMessage({ type: "init", payload: { inEditor: reearth.scene.inEditor } });
  } else if (action === "updateOverrides") {
    reearth.visualizer.overrideProperty(payload);
  } else if (action === "addDatasetToScene") {
    // NEED TO HANDLE ADDING TO SCENE WHEN ABLE
  } else if (action === "screenshot" || action === "screenshot-save") {
    reearth.ui.postMessage({
      type: action,
      payload: reearth.scene.captureScreen(),
    });
  } else if (action === "msgFromModal") {
    reearth.ui.postMessage({ type: action, payload });
  } else if (action === "minimize") {
    if (payload) {
      reearth.ui.resize(undefined, undefined, false);
    } else {
      reearth.ui.resize(350, undefined, true);
    }
  } else if (action === "modal-open") {
    addedDatasets = payload;
    reearth.modal.show(dataCatalogHtml, { background: "transparent" });
    // Datacatalog modal
  } else if (action === "modal-close") {
    reearth.modal.close();
  } else if (action === "initDatasetCatalog") {
    reearth.modal.postMessage({ type: "msgFromSidebar", payload: addedDatasets });
  }
});

reearth.on("update", () => {
  reearth.ui.postMessage({
    type: "extended",
    payload: reearth.widget.extended,
  });
});
