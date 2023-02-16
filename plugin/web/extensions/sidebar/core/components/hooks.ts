import { Project, ReearthApi } from "@web/extensions/sidebar/types";
import { generateID, mergeProperty, postMsg } from "@web/extensions/sidebar/utils";
import { Story } from "@web/extensions/storytelling/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getDataCatalog, RawDataCatalogItem } from "../../modals/datacatalog/api/api";
import { UserDataItem } from "../../modals/datacatalog/types";
import { Data, DataCatalogItem, Template } from "../types";

import { Pages } from "./Header";

export const defaultProject: Project = {
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
  },
  datasets: [],
  userStory: undefined,
};

export default () => {
  const [projectID, setProjectID] = useState<string>();
  const [inEditor, setInEditor] = useState(true);
  const [backendAccessToken, setBackendAccessToken] = useState<string>();
  const [backendURL, setBackendURL] = useState<string>();
  const [reearthURL, setReearthURL] = useState<string>();

  const [data, setData] = useState<Data[]>();
  const [project, updateProject] = useState<Project>(defaultProject);
  const [selectedDatasets, setSelectedDatasets] = useState<DataCatalogItem[]>([]);

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
  const [catalogData, setCatalog] = useState<RawDataCatalogItem[]>([]);

  useEffect(() => {
    postMsg({ action: "init" }); // Needed to trigger sending initialization data to sidebar
    getDataCatalog("https://api.plateau.reearth.io/").then(res => {
      setCatalog(res);
    });
  }, []);

  useEffect(() => {
    if (backendURL) {
      handleBackendFetch();
    }
  }, [backendURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const processedCatalog = useMemo(
    () => handleDataCatalogProcessing(catalogData, data),
    [catalogData, data],
  );

  useEffect(() => {
    postMsg({ action: "updateCatalog", payload: processedCatalog });
  }, [processedCatalog]);

  // ****************************************

  // ****************************************
  // Project

  const handleProjectSceneUpdate = useCallback(
    (updatedProperties: Partial<ReearthApi>) => {
      updateProject(({ sceneOverrides, datasets }) => {
        const updatedProject: Project = {
          sceneOverrides: [sceneOverrides, updatedProperties].reduce((p, v) => mergeProperty(p, v)),
          datasets,
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        return updatedProject;
      });
    },
    [updateProject],
  );

  const handleProjectDatasetAdd = useCallback(
    (dataset: DataCatalogItem | UserDataItem) => {
      updateProject(project => {
        if (!("dataID" in dataset)) {
          postMsg({ action: "addDatasetToScene", payload: { dataset } });
          return project;
        }

        let dataToAdd = data?.find(d => d.dataID === dataset.dataID);

        if (!dataToAdd) {
          dataToAdd = convertToData(dataset);
        }

        const updatedProject: Project = {
          ...project,
          datasets: [...project.datasets, dataToAdd],
        };

        postMsg({ action: "updateProject", payload: updatedProject });
        setSelectedDatasets(sds => [...sds, dataset]);

        return updatedProject;
      });

      // const options = data?.find(d => d.id === dataset.id)?.components;
      postMsg({ action: "addDatasetToScene", payload: { dataset } });
    },
    [data],
  );

  const handleProjectDatasetRemove = useCallback((dataID: string) => {
    updateProject(({ sceneOverrides, datasets }) => {
      const updatedProject = {
        sceneOverrides,
        datasets: datasets.filter(d => d.dataID !== dataID),
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
    setSelectedDatasets(sds => sds.filter(sd => sd.dataID !== dataID));
    postMsg({ action: "removeDatasetFromScene", payload: dataID });
  }, []);

  const handleProjectDatasetRemoveAll = useCallback(() => {
    updateProject(({ sceneOverrides }) => {
      const updatedProject = {
        sceneOverrides,
        datasets: [],
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
    setSelectedDatasets([]);
    postMsg({ action: "removeAllDatasetsFromScene" });
  }, []);

  const handleDatasetUpdate = useCallback((updatedDataset: DataCatalogItem) => {
    setSelectedDatasets(selectedDatasets => {
      const updatedDatasets = [...selectedDatasets];
      const datasetIndex = updatedDatasets.findIndex(d2 => d2.dataID === updatedDataset.dataID);
      if (datasetIndex >= 0) {
        updatedDatasets[datasetIndex] = updatedDataset;
      }
      return updatedDatasets;
    });
  }, []);

  const handleDatasetSave = useCallback(
    (dataID: string) => {
      (async () => {
        if (!inEditor) return;
        const selectedDataset = selectedDatasets.find(d => d.dataID === dataID);

        if (!backendURL || !backendAccessToken || !selectedDataset) return;

        const datasetToSave = convertToData(selectedDataset);

        const isNew = !data?.find(d => d.dataID === dataID);

        const fetchURL = !isNew
          ? `${backendURL}/sidebar/plateauview/data/${selectedDataset.id}` // should be id and not dataID because id here is the CMS item's id
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
    [data, selectedDatasets, inEditor, backendAccessToken, backendURL, handleBackendFetch],
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

  const handleStorySaveData = useCallback((story: Story) => {
    // save user story
    updateProject(project => {
      const updatedProject: Project = {
        ...project,
        userStory: {
          scenes: story.scenes,
        },
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
  }, []);

  const handleInitUserStory = useCallback((story: Story) => {
    postMsg({ action: "storyPlay", payload: story });
  }, []);

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
        setReearthURL(`${e.data.payload.reearthURL}`);
        if (e.data.payload.draftProject) {
          updateProject(e.data.payload.draftProject);
        }
      } else if (e.data.action === "triggerCatalogOpen") {
        handleModalOpen();
      } else if (e.data.action === "triggerHelpOpen") {
        handlePageChange("help");
      } else if (e.data.action === "storyShare") {
        setCurrentPage("share");
      } else if (e.data.action === "storySaveData") {
        handleStorySaveData(e.data.payload);
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
          if (data.userStory) {
            handleInitUserStory(data.userStory);
          }
        }
      })();
    }
  }, [projectID, backendURL, handleInitUserStory]);

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
    catalog: processedCatalog,
    project,
    selectedDatasets,
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

const newItem = (ri: RawDataCatalogItem): DataCatalogItem => {
  return {
    ...ri,
    dataID: ri.id,
    public: false,
    fieldGroups: [{ id: generateID(), name: "グループ1" }],
  };
};

const handleDataCatalogProcessing = (
  catalog: (DataCatalogItem | RawDataCatalogItem)[],
  savedData?: Data[],
): DataCatalogItem[] =>
  catalog.map(item => {
    if (!savedData) return newItem(item);

    const savedData2 = savedData.find(d => d.dataID === ("dataID" in item ? item.dataID : item.id));
    if (savedData2) {
      return {
        ...item,
        ...savedData2,
      };
    } else {
      return newItem(item);
    }
  });

const convertToData = (item: DataCatalogItem): Data => {
  return {
    dataID: item.dataID,
    public: item.public,
    visible: item.visible,
    template: item.template,
    components: item.components,
    fieldGroups: item.fieldGroups,
  };
};
