import { CatalogRawItem } from "@web/extensions/sidebar/core/processCatalog";
import { PostMessageProps } from "@web/extensions/sidebar/core/types";

import html from "../dist/web/sidebar/core/index.html?raw";
import clipVideoHtml from "../dist/web/sidebar/modals/clipVideo/index.html?raw";
import dataCatalogHtml from "../dist/web/sidebar/modals/datacatalog/index.html?raw";
import mapVideoHtml from "../dist/web/sidebar/modals/mapVideo/index.html?raw";
import welcomeScreenHtml from "../dist/web/sidebar/modals/welcomescreen/index.html?raw";
import helpPopupHtml from "../dist/web/sidebar/popups/help/index.html?raw";

const reearth = (globalThis as any).reearth;

let addedDatasets: string | undefined = undefined;

let rawCatalog: CatalogRawItem[] = [];

const doNotShowWelcome = true; // Make it `let doNotShowWelcome: boolean = false`, and then modify based on storage value when Storage API available

reearth.ui.show(html, { extended: true });

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  // Sidebar
  if (action === "init") {
    reearth.ui.postMessage({
      type: "init",
      payload: {
        projectID: reearth.viewport.query.projectID,
        inEditor: reearth.scene.inEditor,
        backendAccessToken: reearth.widget.property.default.plateauAccessToken ?? "",
        backendURL: reearth.widget.property.default.plateauURL ?? "",
        cmsURL: reearth.widget.property.default.cmsURL ?? "",
        reearthURL: reearth.widget.property.default.reearthURL ?? "",
      },
    });
    if (!doNotShowWelcome) {
      reearth.modal.show(welcomeScreenHtml, { background: "#000000bf" });
    }
  } else if (action === "updateOverrides") {
    reearth.visualizer.overrideProperty(payload);
  } else if (action === "addDatasetToScene") {
    // NEED TO HANDLE ADDING TO SCENE WHEN ABLE
  } else if (
    action === "screenshot" ||
    action === "screenshot-preview" ||
    action === "screenshot-save"
  ) {
    reearth.ui.postMessage({
      type: action,
      payload: reearth.scene.captureScreen(undefined, 0.01),
    });
  } else if (action === "msgFromModal") {
    reearth.ui.postMessage({ type: action, payload });
  } else if (action === "minimize") {
    if (payload) {
      reearth.ui.resize(undefined, undefined, false);
    } else {
      reearth.ui.resize(350, undefined, true);
    }
  } else if (action === "datacatalog-modal-open") {
    addedDatasets = payload.addedDatasets;
    rawCatalog = payload.rawCatalog;
    reearth.modal.show(dataCatalogHtml, { background: "transparent" });
    // Datacatalog modal
  } else if (action === "modal-close") {
    reearth.modal.close();
  } else if (action === "initDatasetCatalog") {
    reearth.modal.postMessage({
      type: "msgFromSidebar",
      payload: { rawCatalog, addedDatasets },
    });
  } else if (action === "welcome-modal-open") {
    reearth.modal.show(welcomeScreenHtml, { background: "transparent" });
  } else if (action === "show-popup") {
    reearth.popup.show(helpPopupHtml, { position: "right-start", offset: 4 });
  } else if (action === "popup-message-init") {
    reearth.ui.postMessage({ type: action });
  } else if (action === "popup-message") {
    reearth.popup.postMessage({ type: "msgFromHelp", message: payload }, "*");
  } else if (action === "close-popup") {
    reearth.popup.close();
  } else if (action === "show-map-modal") {
    reearth.modal.show(mapVideoHtml, { background: "transparent" });
  } else if (action === "show-clip-modal") {
    reearth.modal.show(clipVideoHtml, { background: "transparent" });
  }
});

reearth.on("update", () => {
  reearth.ui.postMessage({
    type: "extended",
    payload: reearth.widget.extended,
  });
});
