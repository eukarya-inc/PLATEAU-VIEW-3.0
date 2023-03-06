import { Project, ReearthApi } from "@web/extensions/sidebar/types";
import { generateID, mergeProperty, postMsg } from "@web/extensions/sidebar/utils";
import { merge, cloneDeep } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getDataCatalog, RawDataCatalogItem } from "../../modals/datacatalog/api/api";
import { UserDataItem } from "../../modals/datacatalog/types";
import { Data, DataCatalogItem, Template } from "../types";

import { cleanseOverrides } from "./content/common/DatasetCard/Field/fieldHooks";
import {
  FieldComponent,
  Story as FieldStory,
  StoryItem,
} from "./content/common/DatasetCard/Field/Fields/types";
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
    atmosphere: { shadows: true },
  },
  datasets: [],
  userStory: undefined,
};

export default () => {
  const [projectID, setProjectID] = useState<string>();
  const [inEditor, setInEditor] = useState(true);

  const [catalogURL, setCatalogURL] = useState<string>();
  const [catalogProjectName, setCatalogProjectName] = useState<string>();
  const [reearthURL, setReearthURL] = useState<string>();
  const [backendURL, setBackendURL] = useState<string>();
  const [backendProjectName, setBackendProjectName] = useState<string>();
  const [backendAccessToken, setBackendAccessToken] = useState<string>();

  const [data, setData] = useState<Data[]>();
  const [fieldTemplates, setFieldTemplates] = useState<Template[]>([]);
  const [project, updateProject] = useState<Project>(defaultProject);
  const [selectedDatasets, setSelectedDatasets] = useState<DataCatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cleanseOverride, setCleanseOverride] = useState<string>();

  const handleBackendFetch = useCallback(async () => {
    if (!backendURL) return;
    const res = await fetch(`${backendURL}/sidebar/${backendProjectName}`);
    if (res.status !== 200) return;
    const resData = await res.json();

    if (resData.templates) {
      setFieldTemplates(resData.templates.filter((t: Template) => t.type === "field"));
      setInfoboxTemplates(resData.templates.filter((t: Template) => t.type === "infobox"));
    }
    setData(resData.data);
  }, [backendURL, backendProjectName]);

  // ****************************************
  // Init
  const [catalogData, setCatalog] = useState<RawDataCatalogItem[]>([]);

  useEffect(() => {
    postMsg({ action: "init" }); // Needed to trigger sending initialization data to sidebar
  }, []);

  useEffect(() => {
    const catalogBaseUrl = catalogURL || backendURL;
    if (catalogBaseUrl) {
      getDataCatalog(catalogBaseUrl, catalogProjectName).then(res => {
        setCatalog(res);
      });
    }
  }, [backendURL, catalogProjectName, catalogURL]);

  useEffect(() => {
    if (backendURL) {
      handleBackendFetch();
    }
  }, [backendURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const processedCatalog = useMemo(() => {
    const c = handleDataCatalogProcessing(catalogData, data);
    return inEditor ? c : c.filter(c => !!c.public);
  }, [catalogData, inEditor, data]);

  useEffect(() => {
    postMsg({ action: "updateCatalog", payload: processedCatalog });
  }, [processedCatalog]);

  // ****************************************

  // ****************************************
  // Project

  const processOverrides = useCallback(
    (dataset: DataCatalogItem, activeIDs?: string[]) => {
      if (!activeIDs) return undefined;
      let overrides = undefined;

      const inactivefields = dataset?.components?.filter(c => !activeIDs.find(id => id === c.id));
      const inactiveTemplates = inactivefields?.filter(af => af.type === "template");
      if (inactiveTemplates) {
        const inactiveTemplateFields = inactiveTemplates
          .map(
            at =>
              fieldTemplates.find(ft => at.type === "template" && at.templateID === ft.id)
                ?.components,
          )
          .reduce((acc, field) => [...(acc ?? []), ...(field ?? [])], []);

        if (inactiveTemplateFields) {
          inactivefields?.push(...inactiveTemplateFields);
        }
      }

      const activeFields: FieldComponent[] | undefined = dataset?.components
        ?.filter(c => !!activeIDs.find(id => id === c.id))
        .map(c2 => {
          if (c2.type === "template") {
            return [c2, ...(fieldTemplates.find(ft => ft.id === c2.templateID)?.components ?? [])];
          }
          return c2;
        })
        .reduce((acc: FieldComponent[], field: FieldComponent | FieldComponent[] | undefined) => {
          if (!field) return acc;
          return [...acc, ...(Array.isArray(field) ? field : [field])];
        }, []);

      const cleanseOverrides = mergeOverrides("cleanse", inactivefields, cleanseOverride);
      overrides = mergeOverrides("update", activeFields, cleanseOverrides);

      setCleanseOverride(undefined);

      return overrides;
    },
    [fieldTemplates, cleanseOverride],
  );

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
      const datasetToAdd = { ...dataset } as DataCatalogItem;

      updateProject(project => {
        if (!dataset.components?.length) {
          const defaultTemplate = fieldTemplates.find(
            ft => ft.name === dataset.type2 || ft.name === dataset.type,
          );
          if (defaultTemplate && !datasetToAdd.components) {
            datasetToAdd.components = [
              {
                id: generateID(),
                type: "template",
                templateID: defaultTemplate.id,
              },
            ];
          }
        }

        const dataToAdd = convertToData(datasetToAdd);

        const updatedProject: Project = {
          ...project,
          datasets: [...project.datasets, dataToAdd],
        };

        postMsg({ action: "updateProject", payload: updatedProject });
        setSelectedDatasets(sds => [...sds, datasetToAdd]);

        return updatedProject;
      });

      const activeIDs = (
        !datasetToAdd.components?.find(c => c.type === "switchGroup") || !datasetToAdd.fieldGroups
          ? datasetToAdd.components
          : datasetToAdd.components.filter(
              c =>
                (c.group && c.group === datasetToAdd.fieldGroups?.[0].id) ||
                c.type === "switchGroup",
            )
      )
        ?.filter(c => !(!datasetToAdd.config?.data && c.type === "switchDataset"))
        ?.map(c => c.id);

      const overrides = processOverrides(datasetToAdd, activeIDs);

      postMsg({
        action: "addDatasetToScene",
        payload: {
          dataset: datasetToAdd,
          overrides,
        },
      });
    },
    [fieldTemplates, processOverrides],
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

  const handleDatasetUpdate = useCallback(
    (updatedDataset: DataCatalogItem, cleanseOverride?: any) => {
      setSelectedDatasets(selectedDatasets => {
        const updatedDatasets = [...selectedDatasets];
        const datasetIndex = updatedDatasets.findIndex(d2 => d2.dataID === updatedDataset.dataID);
        if (datasetIndex >= 0) {
          if (updatedDatasets[datasetIndex].visible !== updatedDataset.visible) {
            postMsg({
              action: "updateDatasetVisibility",
              payload: { dataID: updatedDataset.dataID, hide: !updatedDataset.visible },
            });
          }
          if (cleanseOverride) {
            setCleanseOverride(cleanseOverride);
          }
          updatedDatasets[datasetIndex] = updatedDataset;
        }
        updateProject(project => {
          return {
            ...project,
            datasets: updatedDatasets.map(ud => convertToData(ud)),
          };
        });
        return updatedDatasets;
      });
    },
    [],
  );

  const handleDataRequest = useCallback(
    async (dataset?: DataCatalogItem) => {
      if (!backendURL || !backendAccessToken || !dataset) return;
      const datasetToSave = convertToData(dataset);

      const isNew = !data?.find(d => d.dataID === dataset.dataID);

      const fetchURL = !isNew
        ? `${backendURL}/sidebar/${backendProjectName}/data/${dataset.id}` // should be id and not dataID because id here is the CMS item's id
        : `${backendURL}/sidebar/${backendProjectName}/data`;

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
      console.log("DATA JUST SAVED: ", data2);
      handleBackendFetch(); // MAYBE UPDATE THIS LATER TO JUST UPDATE THE LOCAL VALUE
    },
    [data, backendAccessToken, backendURL, backendProjectName, handleBackendFetch],
  );

  const handleDatasetSave = useCallback(
    (dataID: string) => {
      (async () => {
        if (!inEditor) return;
        setLoading(true);
        const selectedDataset = selectedDatasets.find(d => d.dataID === dataID);

        await handleDataRequest(selectedDataset);
        setLoading(false);
      })();
    },
    [inEditor, selectedDatasets, handleDataRequest],
  );

  const handleDatasetPublish = useCallback(
    (dataID: string, publish: boolean) => {
      (async () => {
        if (!inEditor || !processedCatalog) return;
        const dataset = processedCatalog.find(item => item.dataID === dataID);

        if (!dataset) return;

        dataset.public = publish;

        setSelectedDatasets(selectedDatasets => {
          const updatedDatasets = [...selectedDatasets];
          const datasetIndex = updatedDatasets.findIndex(d2 => d2.dataID === dataID);
          if (datasetIndex >= 0) {
            updatedDatasets[datasetIndex] = dataset;
          }

          updateProject(project => {
            return {
              ...project,
              datasets: updatedDatasets.map(ud => convertToData(ud)),
            };
          });

          return updatedDatasets;
        });

        await handleDataRequest(dataset);
      })();
    },
    [processedCatalog, inEditor, handleDataRequest],
  );

  const handleOverride = useCallback(
    (dataID: string, activeIDs?: string[]) => {
      const dataset = selectedDatasets.find(sd => sd.dataID === dataID);
      if (dataset) {
        const overrides = processOverrides(dataset, activeIDs);

        postMsg({
          action: "updateDatasetInScene",
          payload: { dataID, overrides },
        });
      }
    },
    [selectedDatasets, processOverrides],
  );

  // ****************************************

  // ****************************************
  // Templates

  const handleTemplateAdd = useCallback(async () => {
    if (!backendURL || !backendProjectName || !backendAccessToken) return;
    const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates`, {
      headers: {
        authorization: `Bearer ${backendAccessToken}`,
      },
      method: "POST",
      body: JSON.stringify({ type: "field", name: "新しいテンプレート" }),
    });
    if (res.status !== 200) return;
    const newTemplate = await res.json();
    setFieldTemplates(t => [...t, newTemplate]);
    return newTemplate as Template;
  }, [backendURL, backendProjectName, backendAccessToken]);

  const handleTemplateSave = useCallback(
    async (template: Template) => {
      if (!backendURL || !backendProjectName || !backendAccessToken) return;
      setLoading(true);
      const res = await fetch(
        `${backendURL}/sidebar/${backendProjectName}/templates/${template.id}`,
        {
          headers: {
            authorization: `Bearer ${backendAccessToken}`,
          },
          method: "PATCH",
          body: JSON.stringify(template),
        },
      );
      if (res.status !== 200) return;
      const updatedTemplate = await res.json();
      setFieldTemplates(t => {
        return t.map(t2 => {
          if (t2.id === updatedTemplate.id) {
            return updatedTemplate;
          }
          return t2;
        });
      });
      setLoading(false);
    },
    [backendURL, backendProjectName, backendAccessToken],
  );

  const handleTemplateRemove = useCallback(
    async (id: string) => {
      if (!backendURL || !backendProjectName || !backendAccessToken) return;
      const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates/${id}`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "DELETE",
      });
      if (res.status !== 200) return;
      setFieldTemplates(t => t.filter(t2 => t2.id !== id));
    },
    [backendURL, backendProjectName, backendAccessToken],
  );

  // ****************************************
  // Story
  const handleStorySaveData = useCallback((story: StoryItem & { dataID?: string }) => {
    if (story.id && story.dataID) {
      // save database story
      setSelectedDatasets(sd => {
        const tarStory = (
          sd
            .find(s => s.dataID === story.dataID)
            ?.components?.find(c => c.type === "story") as FieldStory
        )?.stories?.find((st: StoryItem) => st.id === story.id);
        if (tarStory) {
          tarStory.scenes = story.scenes;
        }
        return sd;
      });
    }

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

  const handleInitUserStory = useCallback((story: StoryItem) => {
    postMsg({ action: "storyPlay", payload: story });
  }, []);

  // ****************************************

  // Infobox
  const [infoboxTemplates, setInfoboxTemplates] = useState<Template[]>([]);

  const handleInfoboxTemplateAdd = useCallback(
    async (template: Omit<Template, "id">) => {
      if (!backendURL || !backendProjectName || !backendAccessToken) return;
      const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates`, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method: "POST",
        body: JSON.stringify(template),
      });
      if (res.status !== 200) return;
      const newTemplate = await res.json();
      setInfoboxTemplates(t => [...t, newTemplate]);
      return newTemplate as Template;
    },
    [backendURL, backendProjectName, backendAccessToken],
  );

  const handleInfoboxTemplateSave = useCallback(
    async (template: Template) => {
      if (!backendURL || backendProjectName || !backendAccessToken) return;
      const res = await fetch(
        `${backendURL}/sidebar/${backendProjectName}/templates/${template.id}`,
        {
          headers: {
            authorization: `Bearer ${backendAccessToken}`,
          },
          method: "PATCH",
          body: JSON.stringify(template),
        },
      );
      if (res.status !== 200) return;
      const updatedTemplate = await res.json();
      setInfoboxTemplates(t => {
        return t.map(t2 => {
          if (t2.id === updatedTemplate.id) {
            return updatedTemplate;
          }
          return t2;
        });
      });
      postMsg({
        action: "infoboxFieldsSaved",
      });
    },
    [backendURL, backendProjectName, backendAccessToken],
  );

  const handleInfoboxFieldsFetch = useCallback(
    (dataID: string) => {
      const name = catalogData?.find(d => d.id === dataID)?.type ?? "";
      const fields = infoboxTemplates.find(ft => ft.type === "infobox" && ft.name === name) ?? {
        id: "",
        type: "infobox",
        name,
        fields: [],
      };
      postMsg({
        action: "infoboxFieldsFetch",
        payload: fields,
      });
    },
    [catalogData, infoboxTemplates],
  );
  const handleInfoboxFieldsFetchRef = useRef<any>();
  handleInfoboxFieldsFetchRef.current = handleInfoboxFieldsFetch;

  const handleInfoboxFieldsSave = useCallback(
    async (template: Template) => {
      if (template.id) {
        handleInfoboxTemplateSave(template);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...templateData } = template;
        handleInfoboxTemplateAdd(templateData);
      }
    },
    [handleInfoboxTemplateAdd, handleInfoboxTemplateSave],
  );
  const handleInfoboxFieldsSaveRef = useRef<any>();
  handleInfoboxFieldsSaveRef.current = handleInfoboxFieldsSave;

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
        setCatalogURL(e.data.payload.catalogURL);
        setCatalogProjectName(e.data.payload.catalogProjectName);
        setReearthURL(`${e.data.payload.reearthURL}`);
        setBackendURL(e.data.payload.backendURL);
        setBackendProjectName(e.data.payload.backendProjectName);
        setBackendAccessToken(e.data.payload.backendAccessToken);
        if (e.data.payload.draftProject) {
          updateProject(e.data.payload.draftProject);
        }
      } else if (e.data.action === "updateDataset") {
        handleDatasetPublish(e.data.payload.dataID, e.data.payload.publish);
      } else if (e.data.action === "triggerCatalogOpen") {
        handleModalOpen();
      } else if (e.data.action === "triggerHelpOpen") {
        handlePageChange("help");
      } else if (e.data.action === "storyShare") {
        setCurrentPage("share");
      } else if (e.data.action === "storySaveData") {
        handleStorySaveData(e.data.payload);
      } else if (e.data.action === "infoboxFieldsFetch") {
        handleInfoboxFieldsFetchRef.current(e.data.payload);
      } else if (e.data.action === "infoboxFieldsSave") {
        handleInfoboxFieldsSaveRef.current(e.data.payload);
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, [handleDatasetPublish]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchedSharedProject = useRef(false);

  useEffect(() => {
    if (!backendURL || !backendProjectName || fetchedSharedProject.current) return;
    if (projectID && processedCatalog.length) {
      (async () => {
        const res = await fetch(`${backendURL}/share/${backendProjectName}/${projectID}`);
        if (res.status !== 200) return;
        const data = await res.json();
        if (data) {
          updateProject(data);
          postMsg({ action: "updateProject", payload: data });
          (data.datasets as Data[]).forEach(d => {
            const dataset = processedCatalog.find(item => item.dataID === d.dataID);
            if (dataset) {
              setSelectedDatasets(sds => [...sds, dataset]);
              postMsg({
                action: "addDatasetToScene",
                payload: { dataset, overrides: mergeOverrides("update", dataset.components) },
              });
            }
          });
          if (data.userStory) {
            handleInitUserStory(data.userStory);
          }
        }
        fetchedSharedProject.current = true;
      })();
    }
  }, [projectID, backendURL, backendProjectName, processedCatalog, handleInitUserStory]);

  const [currentPage, setCurrentPage] = useState<Pages>("data");

  const handlePageChange = useCallback((p: Pages) => {
    setCurrentPage(p);
  }, []);

  // ThreeDTilesSearch
  const handleThreeDTilesSearch = useCallback(
    (dataID: string) => {
      const plateauItem = catalogData.find(pd => pd.id === dataID);
      const searchIndex = plateauItem?.["search_index"];

      postMsg({
        action: "buildingSearchOpen",
        payload: {
          title: plateauItem?.["name"] ?? "",
          dataID,
          searchIndex,
        },
      });
    },
    [catalogData],
  );

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
    backendProjectName,
    templates: fieldTemplates,
    currentPage,
    loading,
    handlePageChange,
    handleTemplateAdd,
    handleTemplateSave,
    handleTemplateRemove,
    handleDatasetSave,
    handleDatasetUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectSceneUpdate,
    handleModalOpen,
    handleThreeDTilesSearch,
    handleOverride,
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
    visible: true,
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
    visible: item.visible ?? true,
    template: item.template,
    components: item.components,
    fieldGroups: item.fieldGroups,
  };
};

export const mergeOverrides = (
  action: "update" | "cleanse",
  components?: FieldComponent[],
  startingOverride?: any,
) => {
  if (!components || !components.length) {
    if (startingOverride) {
      return startingOverride;
    }
    return;
  }

  const overrides = cloneDeep(startingOverride ?? {});

  const needOrderComponents = components
    .filter(c => c.updatedAt)
    .sort((a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0));
  for (const component of needOrderComponents) {
    merge(overrides, action === "cleanse" ? cleanseOverrides[component.type] : component.override);
  }

  for (let i = 0; i < components.length; i++) {
    if (components[i].updatedAt) {
      continue;
    }

    merge(
      overrides,
      action === "cleanse" ? cleanseOverrides[components[i].type] : components[i].override,
    );
  }

  return overrides;
};
