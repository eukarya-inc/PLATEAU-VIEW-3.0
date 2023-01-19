import { CatalogRawItem } from "@web/extensions/sidebar/core/processCatalog";
import { PostMessageProps } from "@web/extensions/sidebar/types";

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

// let isMobile: boolean;

reearth.ui.show(html, { extended: true });

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  // Sidebar
  if (action === "initSidebar") {
    reearth.ui.postMessage({
      type: action,
      payload: {
        projectID: reearth.viewport.query.projectID,
        inEditor: reearth.scene.inEditor,
        backendAccessToken: reearth.widget.property.default.plateauAccessToken ?? "",
        backendURL: reearth.widget.property.default.plateauURL ?? "",
        cmsURL: reearth.widget.property.default.cmsURL ?? "",
        reearthURL: reearth.widget.property.default.reearthURL ?? "",
      },
    });
    reearth.clientStorage.setAsync("overrides", payload);
    if (!doNotShowWelcome) {
      reearth.modal.show(welcomeScreenHtml, { background: "#000000bf" });
    }
  } else if (action === "storageSave") {
    reearth.clientStorage.setAsync(payload.key, payload.value);
  } else if (action === "storageFetch") {
    reearth.clientStorage.getAsync(payload.key).then((value: any) => {
      reearth.ui.postMessage({
        type: "getAsync",
        payload: value,
      });
    });
  } else if (action === "storageKeys") {
    reearth.clientStorage.keysAsync().then((value: any) => {
      reearth.ui.postMessage({
        type: "keysAsync",
        payload: value,
      });
    });
  } else if (action === "storageDelete") {
    reearth.clientStorage.deleteAsync(payload.key);
  } else if (action === "updateOverrides") {
    reearth.visualizer.overrideProperty(payload);
    reearth.clientStorage.setAsync("overrides", payload);
  } else if (action === "addDatasetToScene") {
    // NEED TO HANDLE ADDING TO SCENE WHEN ABLE
  } else if (
    action === "screenshot" ||
    action === "screenshotPreview" ||
    action === "screenshotSave"
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
  } else if (action === "catalogModalOpen") {
    addedDatasets = payload.addedDatasets;
    rawCatalog = payload.rawCatalog;
    reearth.modal.show(dataCatalogHtml, { background: "transparent" });
    // Datacatalog modal
  } else if (action === "modalClose") {
    reearth.modal.close();
  } else if (action === "initDataCatalog") {
    reearth.modal.postMessage({
      type: action,
      payload: { rawCatalog, addedDatasets },
    });
  } else if (action === "welcomeModalOpen") {
    reearth.modal.show(welcomeScreenHtml, { background: "transparent" });
  } else if (action === "popupOpen") {
    reearth.popup.show(helpPopupHtml, { position: "right-start", offset: 4 });
  } else if (action === "initPopup") {
    reearth.ui.postMessage({ type: action });
  } else if (action === "msgToPopup") {
    reearth.popup.postMessage({ type: "msgToPopup", message: payload }, "*");
  } else if (action === "popupClose") {
    reearth.popup.close();
  } else if (action === "mapModalOpen") {
    reearth.modal.show(mapVideoHtml, { background: "transparent" });
  } else if (action === "clipModalOpen") {
    reearth.modal.show(clipVideoHtml, { background: "transparent" });
  }
});

reearth.on("update", () => {
  reearth.ui.postMessage({
    type: "extended",
    payload: reearth.widget.extended,
  });
});

// reearth.on("resize", (e: any) => {
//   if (e.isMobile !== isMobile) {
//     reearth.ui.postMessage({type: ""});
//     isMobile = e.isMobile;
//   }
// });
