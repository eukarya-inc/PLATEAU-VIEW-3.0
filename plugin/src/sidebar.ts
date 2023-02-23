import { DataCatalogItem } from "@web/extensions/sidebar/core/types";
import { PostMessageProps, Project, PluginMessage } from "@web/extensions/sidebar/types";

import html from "../dist/web/sidebar/core/index.html?raw";
import clipVideoHtml from "../dist/web/sidebar/modals/clipVideo/index.html?raw";
import dataCatalogHtml from "../dist/web/sidebar/modals/datacatalog/index.html?raw";
import mapVideoHtml from "../dist/web/sidebar/modals/mapVideo/index.html?raw";
import welcomeScreenHtml from "../dist/web/sidebar/modals/welcomescreen/index.html?raw";
import buildingSearchHtml from "../dist/web/sidebar/popups/buildingSearch/index.html?raw";
import groupSelectPopupHtml from "../dist/web/sidebar/popups/groupSelect/index.html?raw";
import helpPopupHtml from "../dist/web/sidebar/popups/help/index.html?raw";
import mobileDropdownHtml from "../dist/web/sidebar/popups/mobileDropdown/index.html?raw";

import { getRGBAFromString, RGBA, rgbaToString } from "./utils/color";
import { proxyGTFS } from "./utils/proxy";

const defaultProject: Project = {
  sceneOverrides: {
    default: {
      camera: {
        lat: 35.65075152248653,
        lng: 139.7617718208305,
        altitude: 2219.7187259974316,
        heading: 6.132702058010316,
        pitch: -0.5672459184621266,
        roll: 0.00019776785897196447,
        fov: 1.0471975511965976,
        height: 2219.7187259974316,
      },
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
    atmosphere: { shadows: true },
  },
  datasets: [],
};

type PluginExtensionInstance = {
  id: string;
  name: string;
  pluginId: string;
  extensionId: string;
  runTimes?: number;
};

const reearth = (globalThis as any).reearth;

let welcomePageIsOpen = false;
let mobileDropdownIsOpen = false;
let buildingSearchIsOpen = false;

// this is used for infobox
let currentSelected: string | undefined = undefined;

const defaultLocation = { zone: "outer", section: "left", area: "middle" };
const mobileLocation = { zone: "outer", section: "center", area: "top" };

let dataCatalog: DataCatalogItem[] = [];

let addedDatasets: [dataID: string, status: "showing" | "hidden", layerID?: string][] = [];

// For storing 3dtiles color
const colorStoreFor3dtiles: {
  [dataID: string]:
    | {
        color?: string | { expression: { conditions: [expression: string, color: string][] } };
        transparency?: number;
      }
    | undefined;
} = {};

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
        const outBoundPayload = {
          projectID: reearth.viewport.query.projectID,
          inEditor: reearth.scene.inEditor,
          catalogURL: reearth.widget.property.default?.catalogURL ?? "",
          reearthURL: reearth.widget.property.default?.reearthURL ?? "",
          backendURL: reearth.widget.property.default?.plateauURL ?? "",
          backendProjectName: reearth.widget.property.default?.projectName ?? "",
          backendAccessToken: reearth.widget.property.default?.plateauAccessToken ?? "",
          draftProject,
        };
        if (isMobile) {
          reearth.popup.postMessage({ action, payload: outBoundPayload });
        } else {
          reearth.ui.postMessage({ action, payload: outBoundPayload });
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
  } else if (action === "updateCatalog") {
    dataCatalog = payload;
    reearth.modal.postMessage({ action, payload });
  } else if (action === "updateProject") {
    reearth.visualizer.overrideProperty(payload.sceneOverrides);
    reearth.clientStorage.setAsync("draftProject", payload);
  } else if (action === "addDatasetToScene") {
    if (addedDatasets.find(d => d[0] === payload.dataset.dataID)) {
      const idx = addedDatasets.findIndex(ad => ad[0] === payload.dataset.dataID);
      addedDatasets[idx][1] = "showing";
      reearth.layers.show(addedDatasets[idx][2]);
    } else {
      const data = createLayer(payload.dataset, payload.updates);
      const layerID = reearth.layers.add(data);
      const idx = addedDatasets.push([payload.dataset.dataID, "showing", layerID]);
      if (!payload.dataset.visible) {
        reearth.layers.hide(addedDatasets[idx][2]);
        addedDatasets[idx][1] = "hidden";
      }
    }
  } else if (action === "updateDatasetInScene") {
    const layerId = addedDatasets.find(ad => ad[0] === payload.dataID)?.[2];
    const layer = reearth.layers.findById(layerId);
    reearth.layers.override(
      layerId,
      layer.data.type === "gtfs" ? proxyGTFS(payload.update) : payload.update,
    );
  } else if (action === "updateDatasetVisibility") {
    const idx = addedDatasets.findIndex(ad => ad[0] === payload.dataID);
    if (payload.hide) {
      reearth.layers.hide(addedDatasets[idx][2]);
      addedDatasets[idx][1] = "hidden";
    } else {
      reearth.layers.show(addedDatasets[idx][2]);
      addedDatasets[idx][1] = "showing";
    }
  } else if (action === "removeDatasetFromScene") {
    reearth.layers.delete(addedDatasets.find(ad => ad[0] === payload)?.[2]);
    const idx = addedDatasets.findIndex(ad => ad[0] === payload);
    addedDatasets.splice(idx, 1);
  } else if (action === "removeAllDatasetsFromScene") {
    reearth.layers.delete(...addedDatasets.map(ad => ad[2]));
    addedDatasets = [];
  } else if (action === "updateDataset") {
    reearth.ui.postMessage({ action, payload });
  } else if (
    action === "screenshot" ||
    action === "screenshotPreview" ||
    action === "screenshotSave"
  ) {
    reearth.ui.postMessage({
      action,
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
      action,
      payload: {
        dataCatalog,
        addedDatasets: addedDatasets.map(d => d[0]),
        inEditor: reearth.scene.inEditor,
      },
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
    if (Array.isArray(payload)) {
      reearth.camera.flyTo(...payload);
    } else {
      const layerID = addedDatasets.find(ad => ad[0] === payload)?.[2];
      reearth.camera.flyTo(layerID);
    }
  } else if (action === "cameraLookAt") {
    reearth.camera.lookAt(...payload);
  } else if (action === "getCurrentCamera") {
    reearth.ui.postMessage({ action, payload: reearth.camera.position });
  } else if (action === "checkIfMobile") {
    reearth.ui.postMessage({ action, payload: reearth.viewport.isMobile });
  } else if (action === "extendPopup") {
    reearth.popup.update({
      height: reearth.viewport.height - 68,
      width: reearth.viewport.width - 12,
    });
  } else if (action === "updateInterval") {
    const { dataID, interval } = payload;
    const layerId = addedDatasets.find(ad => ad[0] === dataID)?.[2];
    reearth.layers.override(layerId, {
      data: {
        updateInterval: interval,
      },
    });
  } else if (action === "updateTimeBasedDisplay") {
    const { dataID, timeBasedDisplay, timeFieldName } = payload;
    const layerId = addedDatasets.find(ad => ad[0] === dataID)?.[2];
    if (timeBasedDisplay) {
      reearth.layers.override(layerId, {
        data: {
          time: {
            property: timeFieldName,
            interval: 86400000,
          },
        },
      });
    } else {
      reearth.layers.override(layerId, {
        data: {
          time: undefined,
        },
      });
    }
  }

  // ************************************************
  // Story
  else if (
    action === "storyPlay" ||
    action === "storyEdit" ||
    action === "storyEditFinish" ||
    action === "storyDelete"
  ) {
    const storyTellingWidgetId = reearth.plugins.instances.find(
      (instance: PluginExtensionInstance) => instance.extensionId === "storytelling",
    )?.id;
    if (!storyTellingWidgetId) return;
    reearth.plugins.postMessage(storyTellingWidgetId, {
      action,
      payload,
    });
  }

  // ************************************************
  // CSV
  if (action === "updatePointCSV") {
    const { dataID, lng, lat, height } = payload;
    const layerId = addedDatasets.find(ad => ad[0] === dataID)?.[2];
    reearth.layers.override(layerId, {
      data: {
        csv: {
          lngColumn: lng,
          latColumn: lat,
          heightColumn: height,
        },
      },
    });
  } else if (action === "resetPointCSV") {
    const { dataID } = payload;
    const layerId = addedDatasets.find(ad => ad[0] === dataID)?.[2];
    reearth.layers.override(layerId, {
      data: {
        csv: undefined,
      },
    });
  }
  // FIXME(@keiya01): support auto csv field complement
  // else if (action === "getLocationNamesFromCSVFeatureProperty") {
  // const { dataID } = payload;
  // const layerId = addedDatasets.find(ad => ad[0] === dataID)?.[2];
  // const layer = reearth.layers.findById(layerId);
  // reearth.ui.postMessage({
  //   action,
  //   locationNames: getLocationNamesFromFeatureProperties({
  //     ...(layer.computed?.features[0] || {}),
  //   }),
  // });
  // }

  // ************************************************
  // for infobox
  else if (action === "infoboxFieldsFetch") {
    const infoboxInstanceId = reearth.plugins.instances.find(
      (instance: PluginExtensionInstance) => instance.extensionId === "infobox",
    )?.id;
    if (!infoboxInstanceId) return;
    reearth.plugins.postMessage(infoboxInstanceId, {
      action: "infoboxFieldsFetch",
      payload,
    });
  } else if (action === "infoboxFieldsSaved") {
    const infoboxInstanceId = reearth.plugins.instances.find(
      (instance: PluginExtensionInstance) => instance.extensionId === "infobox",
    )?.id;
    if (!infoboxInstanceId) return;
    reearth.plugins.postMessage(infoboxInstanceId, {
      action: "infoboxFieldsSaved",
    });
  }

  // ************************************************
  // For 3dtiles
  if (action === "findTileset") {
    const { dataID } = payload;
    const tilesetLayerID = addedDatasets.find(a => a[0] === dataID)?.[2];
    const tilesetLayer = reearth.layers.findById(tilesetLayerID);
    reearth.ui.postMessage({
      action,
      payload: {
        layer: {
          id: tilesetLayer.id,
          data: tilesetLayer.data,
          ["3dtiles"]: tilesetLayer?.["3dtiles"],
        },
      },
    });
  }

  const override3dtiles = (
    dataID: string,
    property: Record<string, any>,
    clippingBox?: Record<string, any>,
  ) => {
    const tilesetLayerID = addedDatasets.find(a => a[0] === dataID)?.[2];
    reearth.layers.override(tilesetLayerID, {
      "3dtiles": property,
      ...(clippingBox ? { box: clippingBox } : {}),
    });
  };

  // For clipping box
  if (action === "updateClippingBox") {
    const { dataID, box, clipping } = payload;
    override3dtiles(dataID, { experimental_clipping: { ...clipping, useBuiltinBox: true } }, box);
  } else if (action === "removeClippingBox") {
    const { dataID } = payload;

    override3dtiles(dataID, {
      experimental_clipping: undefined,
    });
  }
  // For 3dtiles show
  if (action === "update3dtilesShow") {
    const { dataID, show } = payload;
    override3dtiles(dataID, { show });
  } else if (action === "reset3dtilesShow") {
    const { dataID } = payload;

    override3dtiles(dataID, {
      show: true,
    });
  }

  // For 3dtiles shadow
  if (action === "update3dtilesShadow") {
    const { dataID, shadows } = payload;
    override3dtiles(dataID, { shadows });
  } else if (action === "reset3dtilesShadow") {
    const { dataID } = payload;
    override3dtiles(dataID, { shadows: "enabled" });
  }

  // For 3dtiles transparency
  if (action === "update3dtilesTransparency") {
    const { dataID, transparency } = payload;
    const storedObj = colorStoreFor3dtiles[dataID];
    const color = storedObj?.color;
    colorStoreFor3dtiles[dataID] = {
      ...(storedObj || {}),
      transparency,
    };

    const defaultRGBA = rgbaToString([255, 255, 255, transparency]);
    const expression = (() => {
      if (!color) {
        return defaultRGBA;
      }
      if (typeof color === "string") {
        const rgba = getRGBAFromString(color);
        return rgba ? rgbaToString([...rgba.slice(0, -1), transparency] as RGBA) : defaultRGBA;
      }
      return {
        expression: {
          conditions: color.expression.conditions.map(([k, v]: [string, string]) => {
            const rgba = getRGBAFromString(v);
            if (!rgba) {
              return [k, defaultRGBA];
            }
            const composedRGBA = [...rgba.slice(0, -1), transparency] as RGBA;
            return [k, rgbaToString(composedRGBA)];
          }),
        },
      };
    })();
    override3dtiles(dataID, { color: expression });
  } else if (action === "reset3dtilesTransparency") {
    const { dataID } = payload;
    const storedObj = colorStoreFor3dtiles[dataID];
    delete colorStoreFor3dtiles[dataID]?.transparency;
    override3dtiles(dataID, { color: storedObj?.color || "rgba(255, 255, 255, 1)" });
  }
  // For 3dtiles color
  if (action === "update3dtilesColor") {
    const { dataID, color } = payload;
    const storedObj = colorStoreFor3dtiles[dataID];
    const transparency = storedObj?.transparency;
    colorStoreFor3dtiles[dataID] = {
      ...(storedObj || {}),
      color,
    };

    const expression = {
      ...color,
      expression: {
        ...color.expression,
        conditions: color.expression.conditions.map(([k, v]: [string, string]) => {
          const rgba = getRGBAFromString(v);
          if (!rgba) {
            return [k, v];
          }
          const composedRGBA = [...rgba.slice(0, -1), transparency || rgba[3]] as RGBA;
          return [k, rgbaToString(composedRGBA)];
        }),
      },
    };
    override3dtiles(dataID, { color: expression });
  } else if (action === "reset3dtilesColor") {
    const { dataID } = payload;
    const storedObj = colorStoreFor3dtiles[dataID];
    delete colorStoreFor3dtiles[dataID]?.color;
    override3dtiles(dataID, { color: `rgba(255, 255, 255, ${storedObj?.transparency || 1})` });
  }
  // ************************************************
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

reearth.on("pluginmessage", (pluginMessage: PluginMessage) => {
  if (pluginMessage.data.action === "storyShare") {
    reearth.ui.postMessage(pluginMessage.data);
  } else if (pluginMessage.data.action === "storySaveData") {
    reearth.ui.postMessage(pluginMessage.data);
  } else if (pluginMessage.data.action === "infoboxFieldsFetch") {
    reearth.ui.postMessage({
      action: "infoboxFieldsFetch",
      payload: addedDatasets.find(ad => ad[2] === currentSelected)?.[0],
    });
  } else if (pluginMessage.data.action === "infoboxFieldsSave") {
    reearth.ui.postMessage(pluginMessage.data);
  }
});

reearth.on("select", (selected: string | undefined) => {
  // this is used for infobox
  currentSelected = selected;
});

function createLayer(dataset: DataCatalogItem, options?: any) {
  const format = dataset.format?.toLowerCase();
  return {
    type: "simple",
    title: dataset.name,
    data: {
      type: format,
      url: dataset.config?.data?.[0].url ?? dataset.url,
      layers:
        format === "mvt" ? dataset.config?.data?.[0].layers?.[0] ?? dataset.layers?.[0] : undefined,
    },
    visible: true,
    infobox:
      format === "3dtiles"
        ? {
            blocks: [
              {
                pluginId: reearth.plugins.instances.find(
                  (i: PluginExtensionInstance) => i.name === "plateau-plugin",
                ).pluginId,
                extensionId: "infobox",
              },
            ],
            property: {
              default: {
                bgcolor: "#d9d9d9ff",
                heightType: "auto",
                showTitle: false,
                size: "medium",
              },
            },
          }
        : null,
    ...(options
      ? options
      : format === "geojson"
      ? {
          marker: {},
        }
      : format === "gtfs"
      ? proxyGTFS(options)
      : format === "mvt"
      ? {
          polygon: {},
        }
      : format === "czml"
      ? { resource: {} }
      : { ...(options ?? {}) }),
  };
}
