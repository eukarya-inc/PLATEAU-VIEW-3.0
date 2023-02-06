import { Project, ReearthApi } from "@web/extensions/sidebar/types";
import { mergeProperty, postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Data, Template } from "../newTypes";
import processCatalog, { CatalogRawItem } from "../processCatalog";

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
  const [cmsURL, setCMSURL] = useState<string>();
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
  useEffect(() => {
    postMsg({ action: "init" }); // Needed to trigger sending initialization data to sidebar
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

  const handleProjectDatasetAdd = useCallback((dataset: CatalogRawItem) => {
    updateProject(({ sceneOverrides, selectedDatasets }) => {
      const updatedProject: Project = {
        sceneOverrides,
        selectedDatasets: [
          ...selectedDatasets,
          {
            id: dataset.id,
            dataId: `plateau-2022-${dataset.cityName ?? dataset.name}`,
            type: dataset.type,
            name: dataset.cityName ?? dataset.name,
            visible: true,
          } as Data,
        ],
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });

    postMsg({ action: "addDatasetToScene", payload: dataset }); // MIGHT NEED TO MOVE THIS ELSEWHEREEEE
  }, []);

  const handleProjectDatasetRemove = useCallback(
    (id: string) =>
      updateProject(({ sceneOverrides, selectedDatasets }) => {
        const updatedProject = {
          sceneOverrides,
          selectedDatasets: selectedDatasets.filter(d => d.id !== id),
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        return updatedProject;
      }),
    [],
  );

  const handleProjectDatasetRemoveAll = useCallback(
    () =>
      updateProject(({ sceneOverrides }) => {
        const updatedProject = {
          sceneOverrides,
          selectedDatasets: [],
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        return updatedProject;
      }),
    [],
  );

  const handleDatasetUpdate = useCallback(
    (updatedDataset: Data) => {
      if (processedSelectedDatasets.length < 1) return;

      const updatedProcessedDatasets = [...processedSelectedDatasets];
      const datasetIndex = updatedProcessedDatasets.findIndex(d2 => d2.id === updatedDataset.id);

      updatedProcessedDatasets[datasetIndex] = updatedDataset;
      setProcessedSelectedDatasets(updatedProcessedDatasets);
    },
    [processedSelectedDatasets],
  );

  const handleDatasetSave = useCallback(
    (datasetID: string) => {
      (async () => {
        if (!inEditor) return;
        const datasetToSave = processedSelectedDatasets.find(d => d.id === datasetID);
        const isNew = !data?.find(d => d.id === datasetID);

        if (!backendURL || !backendAccessToken || !datasetToSave) return;

        const fetchURL = !isNew
          ? `${backendURL}/sidebar/plateauview/data/${datasetToSave.id}`
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
  // Catalog
  const [plateauData, setPlateauData] = useState<any[]>([]);
  const [usecaseData, setUsecaseData] = useState<any[]>([]);
  const [datasetData, setDatasetData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRawData() {
      const plateau = (await (await fetch(`${cmsURL}/plateau`)).json()).results;
      const usecase = (await (await fetch(`${cmsURL}/usecase`)).json()).results;
      const dataset = (await (await fetch(`${cmsURL}/dataset`)).json()).results;
      setPlateauData(plateau);
      setUsecaseData(usecase);
      setDatasetData(dataset);
    }
    if (cmsURL) {
      fetchRawData();
    }
  }, [cmsURL, setPlateauData, setUsecaseData, setDatasetData]);

  const rawCatalog = useMemo(
    () => processCatalog(plateauData, usecaseData, datasetData),
    [plateauData, usecaseData, datasetData],
  );

  const handleModalOpen = useCallback(() => {
    const selectedIds = project.selectedDatasets.map(d => d.id);
    postMsg({
      action: "catalogModalOpen",
      payload: { addedDatasets: selectedIds, rawCatalog },
    });
  }, [rawCatalog, project.selectedDatasets]);
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
        setCMSURL(`${e.data.payload.cmsURL}/api/p/plateau-2022`);
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

  useEffect(() => {
    setProcessedSelectedDatasets(
      !data
        ? project.selectedDatasets
        : project.selectedDatasets
            .map(sd => {
              const savedData = data.find(d => d.dataId === sd.dataId);
              if (savedData) {
                return {
                  ...sd,
                  ...savedData,
                };
              } else {
                return sd;
              }
            })
            .flat(1)
            .filter(p => p),
    );
  }, [data, project.selectedDatasets]);

  const [currentPage, setCurrentPage] = useState<Pages>("data");

  const handlePageChange = useCallback((p: Pages) => {
    setCurrentPage(p);
  }, []);

  return {
    rawCatalog,
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
