import { Project, ReearthApi } from "@web/extensions/sidebar/types";
import { generateID, mergeProperty, postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { DataCatalogItem, getDataCatalog } from "../../modals/datacatalog/api/api";
import { UserDataItem } from "../../modals/datacatalog/types";
import { Data, Template } from "../types";

import { Pages } from "./Header";

export const defaultProject: Project = {
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

export default () => {
  const [projectID, setProjectID] = useState<string>();
  const [inEditor, setInEditor] = useState(true);
  const [backendAccessToken, setBackendAccessToken] = useState<string>();
  const [backendURL, setBackendURL] = useState<string>();
  // const [cmsURL, setCMSURL] = useState<string>();
  const [reearthURL, setReearthURL] = useState<string>();

  const [data, setData] = useState<Data[]>();
  const [project, updateProject] = useState<Project>(defaultProject);
  const [processedSelectedDatasets, setProcessedSelectedDatasets] = useState<Data[]>([]);

  const handleBackendFetch = useCallback(async () => {
    if (!backendURL) return;
    const res = await fetch(`${backendURL}/sidebar/plateauview`);
    if (res.status !== 200) return;
    const resData = await res.json();

    setTemplates(resData.templates);
    setData(resData.data);
  }, [backendURL]);

  // ****************************************
  // Init
  const [catalogData, setCatalog] = useState<DataCatalogItem[]>([]);

  useEffect(() => {
    getDataCatalog("https://api.plateau.reearth.io/").then(res => {
      setCatalog(res);
      postMsg({ action: "init", payload: { dataCatalog: res } }); // Needed to trigger sending initialization data to sidebar
    });
  }, []);
  // ****************************************

  // ****************************************
  // Project

  const handleProjectSceneUpdate = useCallback(
    (updatedProperties: Partial<ReearthApi>) => {
      updateProject(({ sceneOverrides, selectedDatasets }) => {
        const updatedProject: Project = {
          sceneOverrides: [sceneOverrides, updatedProperties].reduce((p, v) => mergeProperty(p, v)),
          selectedDatasets,
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        return updatedProject;
      });
    },
    [updateProject],
  );

  const handleProjectDatasetAdd = useCallback(
    (dataset: DataCatalogItem | UserDataItem) => {
      updateProject(({ sceneOverrides, selectedDatasets }) => {
        let datasetToAdd = data?.find(d => d.dataID === `plateau-2022-${dataset.name}`);

        if (!datasetToAdd) {
          datasetToAdd = {
            id: dataset.id,
            dataID: `plateau-2022-${dataset.name}`,
            type: dataset.type,
            name: dataset.name,
            url:
              "dataUrl" in dataset ? dataset.dataUrl : "url" in dataset ? dataset.url : undefined,
            visible: true,
            fieldGroups: [{ id: generateID(), name: "グループ1" }],
          };
        }

        const updatedProject: Project = {
          sceneOverrides,
          selectedDatasets: [...selectedDatasets, datasetToAdd],
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        return updatedProject;
      });

      // const options = data?.find(d => d.id === dataset.id)?.components;
      postMsg({ action: "addDatasetToScene", payload: { dataset } });
    },
    [data],
  );

  const handleProjectDatasetRemove = useCallback((dataID: string) => {
    updateProject(({ sceneOverrides, selectedDatasets }) => {
      const updatedProject = {
        sceneOverrides,
        selectedDatasets: selectedDatasets.filter(d => d.dataID !== dataID),
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
    postMsg({ action: "removeDatasetFromScene", payload: dataID });
  }, []);

  const handleProjectDatasetRemoveAll = useCallback(() => {
    updateProject(({ sceneOverrides }) => {
      const updatedProject = {
        sceneOverrides,
        selectedDatasets: [],
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
    postMsg({ action: "removeAllDatasetsFromScene" });
  }, []);

  const handleDatasetUpdate = useCallback(
    (updatedDataset: Data) => {
      if (processedSelectedDatasets.length < 1) return;

      const updatedProcessedDatasets = [...processedSelectedDatasets];
      const datasetIndex = updatedProcessedDatasets.findIndex(
        d2 => d2.dataID === updatedDataset.dataID,
      );

      updatedProcessedDatasets[datasetIndex] = updatedDataset;
      setProcessedSelectedDatasets(updatedProcessedDatasets);
    },
    [processedSelectedDatasets],
  );

  const handleDatasetSave = useCallback(
    (dataID: string) => {
      (async () => {
        if (!inEditor) return;
        const datasetToSave = processedSelectedDatasets.find(d => d.dataID === dataID);
        const isNew = !data?.find(d => d.dataID === dataID);

        if (!backendURL || !backendAccessToken || !datasetToSave) return;

        const fetchURL = !isNew
          ? `${backendURL}/sidebar/plateauview/data/${datasetToSave.id}` // should be id and not dataID because id here is the CMS item's id
          : `${backendURL}/sidebar/plateauview/data`;

        const method = !isNew ? "PATCH" : "POST";

        const res = await fetch(fetchURL, {
          headers: {
            authorization: `Bearer ${backendAccessToken}`,
          },
          method,
          body: JSON.stringify(datasetToSave),
        });
        if (res.status !== 200) {
          handleBackendFetch();
          return;
        }
        const data2 = await res.json();
        // setTemplates(t => [...t, data.results]);
        console.log("DATA JUST SAVED: ", data2);
        handleBackendFetch(); // MAYBE UPDATE THIS LATER TO JUST UPDATE THE LOCAL VALUE
      })();
    },
    [data, processedSelectedDatasets, inEditor, backendAccessToken, backendURL, handleBackendFetch],
  );

  // ****************************************

  // ****************************************
  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);

  const handleTemplateAdd = useCallback(
    async (newTemplate?: Template) => {
      if (!backendURL || !backendAccessToken) return;
      const res = await fetch(`${backendURL}/sidebar/plateauview/templates`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "POST",
        body: JSON.stringify(newTemplate),
      });
      if (res.status !== 200) return;
      const data = await res.json();
      setTemplates(t => [...t, data.results]);
      return data.results as Template;
    },
    [backendURL, backendAccessToken],
  );

  const handleTemplateUpdate = useCallback(
    async (template: Template) => {
      if (!template.modelId || !backendURL || !backendAccessToken) return;
      const res = await fetch(`${backendURL}/sidebar/plateauview/templates/${template.modelId}`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "PATCH",
        body: JSON.stringify(template),
      });
      if (res.status !== 200) return;
      const updatedTemplate = (await res.json()).results;
      setTemplates(t => {
        return t.map(t2 => {
          if (t2.id === updatedTemplate.id) {
            return updatedTemplate;
          }
          return t2;
        });
      });
    },
    [backendURL, backendAccessToken],
  );

  const handleTemplateRemove = useCallback(
    async (template: Template) => {
      if (!template.modelId || !backendURL || !backendAccessToken) return;
      const res = await fetch(`${backendURL}/sidebar/plateauview/templates/${template.modelId}`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "DELETE",
      });
      if (res.status !== 200) return;
      setTemplates(t => t.filter(t2 => t2.modelId !== template.modelId));
    },
    [backendURL, backendAccessToken],
  );

  // ****************************************

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "msgFromModal") {
        if (e.data.payload.dataset) {
          handleProjectDatasetAdd(e.data.payload.dataset);
        }
      } else if (e.data.action === "init" && e.data.payload) {
        setProjectID(e.data.payload.projectID);
        setInEditor(e.data.payload.inEditor);
        setBackendAccessToken(e.data.payload.backendAccessToken);
        setBackendURL(e.data.payload.backendURL);
        // setCMSURL(`${e.data.payload.cmsURL}/api/p/plateau-2022`);
        setReearthURL(`${e.data.payload.reearthURL}`);
        if (e.data.payload.draftProject) {
          updateProject(e.data.payload.draftProject);
        }
      } else if (e.data.action === "triggerCatalogOpen") {
        handleModalOpen();
      } else if (e.data.action === "triggerHelpOpen") {
        handlePageChange("help");
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!backendURL) return;
    if (projectID) {
      (async () => {
        const res = await fetch(`${backendURL}/share/plateauview/${projectID}`);
        if (res.status !== 200) return;
        const data = await res.json();
        if (data) {
          updateProject(data);
          postMsg({ action: "updateProject", payload: data });
        }
      })();
    }
  }, [projectID, backendURL]);

  useEffect(() => {
    if (backendURL) {
      handleBackendFetch();
    }
  }, [backendURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDatasetProcessing = useCallback((dataset: Data, savedData?: Data[]) => {
    if (!savedData) return dataset;

    const datasetSavedData = savedData.find(d => d.dataID === dataset.dataID);
    if (datasetSavedData) {
      return {
        ...dataset,
        ...datasetSavedData,
      };
    } else {
      return dataset;
    }
  }, []);

  useEffect(() => {
    setProcessedSelectedDatasets(
      project.selectedDatasets.map(sd => handleDatasetProcessing(sd, data)),
    );
  }, [data, project.selectedDatasets, handleDatasetProcessing]);

  const [currentPage, setCurrentPage] = useState<Pages>("data");

  const handlePageChange = useCallback((p: Pages) => {
    setCurrentPage(p);
  }, []);

  const handleModalOpen = useCallback(() => {
    postMsg({
      action: "catalogModalOpen",
    });
  }, []);

  return {
    catalogData,
    project,
    processedSelectedDatasets,
    inEditor,
    reearthURL,
    backendURL,
    templates,
    currentPage,
    handlePageChange,
    handleTemplateAdd,
    handleTemplateUpdate,
    handleTemplateRemove,
    handleDatasetSave,
    handleDatasetUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectSceneUpdate,
    handleModalOpen,
  };
};

addEventListener("message", e => {
  if (e.source !== parent) return;
  if (e.data.type) {
    if (e.data.type === "extended") {
      updateExtended(e.data.payload);
    }
  }
});

function updateExtended(e: { vertically: boolean }) {
  const html = document.querySelector("html");
  const body = document.querySelector("body");
  const root = document.getElementById("root");

  if (e?.vertically) {
    html?.classList.add("extended");
    body?.classList.add("extended");
    root?.classList.add("extended");
  } else {
    html?.classList.remove("extended");
    body?.classList.remove("extended");
    root?.classList.remove("extended");
  }
}
