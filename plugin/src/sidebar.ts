import { CatalogRawItem } from "@web/extensions/sidebar/core/processCatalog";
import { PostMessageProps, Project } from "@web/extensions/sidebar/types";

import html from "../dist/web/sidebar/core/index.html?raw";
import clipVideoHtml from "../dist/web/sidebar/modals/clipVideo/index.html?raw";
import dataCatalogHtml from "../dist/web/sidebar/modals/datacatalog/index.html?raw";
import mapVideoHtml from "../dist/web/sidebar/modals/mapVideo/index.html?raw";
import welcomeScreenHtml from "../dist/web/sidebar/modals/welcomescreen/index.html?raw";
import buildingSearchHtml from "../dist/web/sidebar/popups/buildingSearch/index.html?raw";
import groupSelectPopupHtml from "../dist/web/sidebar/popups/groupSelect/index.html?raw";
import helpPopupHtml from "../dist/web/sidebar/popups/help/index.html?raw";
import mobileDropdownHtml from "../dist/web/sidebar/popups/mobileDropdown/index.html?raw";

const defaultProject: Project = {
  sceneOverrides: {
    default: {
      sceneMode: "3d",
      depthTestAgainstTerrain: false,
    },
    terrain: {
      terrain: true,
      terrainType: "cesiumion",
      terrainCesiumIonAccessToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NGI5ZDM0Mi1jZDIzLTRmMzEtOTkwYi0zZTk4Yzk3ODZlNzQiLCJpZCI6NDA2NDYsImlhdCI6MTYwODk4MzAwOH0.3rco62ErML11TMSEflsMqeUTCDbIH6o4n4l5sssuedE",
      terrainCesiumIonAsset: "286503",
    },
    tiles: [
      {
        id: "tokyo",
        tile_url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
        tile_type: "url",
      },
    ],
  },
  selectedDatasets: [],
};

type PluginExtensionInstance = {
  id: string;
  runTimes?: number;
};

const reearth = (globalThis as any).reearth;

let welcomePageIsOpen = false;
let mobileDropdownIsOpen = false;
let buildingSearchIsOpen = false;

const defaultLocation = { zone: "outer", section: "left", area: "middle" };
const mobileLocation = { zone: "outer", section: "center", area: "top" };

let rawCatalog: CatalogRawItem[] = [];
let addedDatasets: string | undefined = undefined;

const sidebarInstance: PluginExtensionInstance = reearth.plugins.instances.find(
  (i: PluginExtensionInstance) => i.id === reearth.widget.id,
);

// ************************************************
// initializations

reearth.ui.show(html, { extended: true });

reearth.clientStorage.getAsync("draftProject").then((draftProject: Project) => {
  if (
    sidebarInstance.runTimes === 1 ||
    (sidebarInstance.runTimes === 2 && reearth.viewport.isMobile && draftProject === defaultProject)
  ) {
    reearth.visualizer.overrideProperty(defaultProject.sceneOverrides);
    reearth.clientStorage.setAsync("draftProject", defaultProject);

    if (reearth.viewport.isMobile) {
      reearth.clientStorage.setAsync("isMobile", true);
      reearth.widget.moveTo(mobileLocation);
    } else {
      reearth.clientStorage.setAsync("isMobile", false);
    }
    reearth.clientStorage.getAsync("doNotShowWelcome").then((value: any) => {
      if (!value && !reearth.scene.inEditor) {
        reearth.modal.show(welcomeScreenHtml, {
          width: reearth.viewport.width,
          height: reearth.viewport.height,
        });
        welcomePageIsOpen = true;
      }
    });
  } else {
    reearth.clientStorage.getAsync("isMobile").then((value: any) => {
      if (reearth.viewport.isMobile) {
        if (!value) {
          reearth.widget.moveTo(mobileLocation);
          reearth.clientStorage.setAsync("isMobile", true);
        }
      } else {
        if (value) {
          reearth.widget.moveTo(defaultLocation);
          reearth.clientStorage.setAsync("isMobile", false);
        }
      }
    });
  }
});
// ************************************************

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  // Mobile specific
  if (action === "mobileDropdownOpen") {
    reearth.popup.show(mobileDropdownHtml, {
      position: "bottom",
      width: reearth.viewport.width - 12,
    });
    mobileDropdownIsOpen = true;
  } else if (action === "msgToMobileDropdown") {
    reearth.popup.postMessage({ action: "msgToPopup", payload });
  }

  // Sidebar
  if (action === "init") {
    reearth.clientStorage.getAsync("isMobile").then((isMobile: boolean) => {
      reearth.clientStorage.getAsync("draftProject").then((draftProject: Project) => {
        const payload = {
          projectID: reearth.viewport.query.projectID,
          inEditor: reearth.scene.inEditor,
          backendAccessToken: reearth.widget.property.default?.plateauAccessToken ?? "",
          backendURL: reearth.widget.property.default?.plateauURL ?? "",
          cmsURL: reearth.widget.property.default?.cmsURL ?? "",
          reearthURL: reearth.widget.property.default?.reearthURL ?? "",
          draftProject,
        };
        if (isMobile) {
          reearth.popup.postMessage({ action, payload });
        } else {
          reearth.ui.postMessage({ action, payload });
        }
      });
    });
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
  } else if (action === "updateProject") {
    reearth.visualizer.overrideProperty(payload.sceneOverrides);
    reearth.clientStorage.setAsync("draftProject", payload);
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
    reearth.ui.postMessage({ action, payload });
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
  } else if (action === "triggerCatalogOpen") {
    reearth.ui.postMessage({ action });
  } else if (action === "triggerHelpOpen") {
    reearth.ui.postMessage({ action });
  } else if (action === "modalClose") {
    reearth.modal.close();
    welcomePageIsOpen = false;
  } else if (action === "initDataCatalog") {
    reearth.modal.postMessage({
      type: action,
      payload: { rawCatalog, addedDatasets },
    });
  } else if (action === "helpPopupOpen") {
    reearth.popup.show(helpPopupHtml, { position: "right-start", offset: 4 });
  } else if (action === "groupSelectOpen") {
    reearth.popup.show(groupSelectPopupHtml, { position: "right", offset: 4 });
    reearth.popup.postMessage({ action: "groupSelectInit", payload });
  } else if (action === "saveGroups") {
    reearth.ui.postMessage({ action, payload });
    reearth.popup.close();
  } else if (action === "initPopup") {
    reearth.ui.postMessage({ action });
  } else if (action === "initWelcome") {
    reearth.modal.postMessage({ type: "msgToModal", message: reearth.viewport.isMobile });
  } else if (action === "msgToPopup") {
    reearth.popup.postMessage({ action: "msgToPopup", payload });
  } else if (action === "msgFromPopup") {
    if (payload.height) {
      reearth.popup.update({ height: payload.height, width: reearth.viewport.width - 12 });
    } else if (payload.currentTab) {
      reearth.ui.postMessage({ action: "msgFromPopup", payload: payload.currentTab });
    }
  } else if (action === "popupClose") {
    reearth.popup.close();
    reearth.ui.postMessage({ action });
    mobileDropdownIsOpen = false;
  } else if (action === "mapModalOpen") {
    reearth.modal.show(mapVideoHtml, { background: "transparent" });
  } else if (action === "clipModalOpen") {
    reearth.modal.show(clipVideoHtml, { background: "transparent" });
  } else if (action === "buildingSearchOpen") {
    reearth.popup.show(buildingSearchHtml, {
      position: reearth.viewport.isMobile ? "bottom-start" : "right-start",
      offset: {
        mainAxis: 4,
        crossAxis: reearth.viewport.isMobile ? reearth.viewport.width * 0.05 : 0,
      },
    });
    reearth.popup.postMessage({
      type: "buildingSearchInit",
      payload: {
        viewport: reearth.viewport,
        data: payload,
      },
    });
    buildingSearchIsOpen = true;
  } else if (action === "cameraFlyTo") {
    reearth.camera.flyTo(...payload);
  } else if (action === "checkIfMobile") {
    reearth.ui.postMessage({ action, payload: reearth.viewport.isMobile });
  } else if (action === "extendPopup") {
    reearth.popup.update({
      height: reearth.viewport.height - 68,
      width: reearth.viewport.width - 12,
    });
  }
});

reearth.on("update", () => {
  reearth.ui.postMessage({
    type: "extended",
    payload: reearth.widget.extended,
  });
});

reearth.on("resize", () => {
  // Modals
  if (welcomePageIsOpen) {
    reearth.modal.update({
      width: reearth.viewport.width,
      height: reearth.viewport.height,
    });
    reearth.modal.postMessage({ type: "msgToModal", payload: reearth.viewport.isMobile });
  }
  // Popups
  if (mobileDropdownIsOpen) {
    reearth.popup.update({
      width: reearth.viewport.width - 10,
    });
  }

  if (buildingSearchIsOpen) {
    reearth.popup.postMessage({
      type: "resize",
      payload: reearth.viewport,
    });
    if (reearth.viewport.isMobile) {
      reearth.popup.update({
        offset: {
          mainAxis: 4,
          crossAxis: reearth.viewport.isMobile ? reearth.viewport.width * 0.05 : 0,
        },
      });
    }
  }
});
