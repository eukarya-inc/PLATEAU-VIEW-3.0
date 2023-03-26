import { postMsg, generateID } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getDataCatalog, RawDataCatalogItem } from "../../../../modals/datacatalog/api/api";
import { BuildingSearch, Data, Template } from "../../../types";
import { Pages } from "../../Header";
import { handleDataCatalogProcessing, updateExtended } from "../../utils";

import useDatasetHooks from "./datasetHooks";
import useProjectHooks from "./projectHooks";
import useTemplateHooks from "./templateHooks";

export default () => {
  const [inEditor, setInEditor] = useState(true);

  const [catalogURL, setCatalogURL] = useState<string>();
  const [catalogProjectName, setCatalogProjectName] = useState<string>();
  const [reearthURL, setReearthURL] = useState<string>();
  const [backendURL, setBackendURL] = useState<string>();
  const [backendProjectName, setBackendProjectName] = useState<string>();
  const [backendAccessToken, setBackendAccessToken] = useState<string>();
  const [publishToGeospatial, setPublishToGeospatial] = useState(false);
  const [buildingSearch, setBuildingSearch] = useState<BuildingSearch>([]);

  const [data, setData] = useState<Data[]>();

  const [loading, setLoading] = useState<boolean>(false);

  const [catalogData, setCatalog] = useState<RawDataCatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(value);
    postMsg({ action: "saveSearchTerm", payload: { searchTerm: value } });
  }, []);

  const processedCatalog = useMemo(() => {
    const c = handleDataCatalogProcessing(catalogData, data);
    return inEditor ? c : c.filter(c => !!c.public);
  }, [catalogData, inEditor, data]);

  const {
    fieldTemplates,
    handleInfoboxFieldsFetch,
    handleInfoboxFieldsSave,
    setFieldTemplates,
    setInfoboxTemplates,
    handleTemplateAdd,
    handleTemplateSave,
    handleTemplateRemove,
  } = useTemplateHooks({
    backendURL,
    backendProjectName,
    backendAccessToken,
    processedCatalog,
    setLoading,
  });

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
  }, [backendURL, backendProjectName, setInfoboxTemplates, setFieldTemplates]);

  const {
    project,
    updateProject,
    setProjectID,
    setCleanseOverride,
    handleProjectSceneUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectDatasetsUpdate,
    handleStorySaveData,
    handleOverride,
  } = useProjectHooks({
    fieldTemplates,
    backendURL,
    backendProjectName,
    processedCatalog,
    buildingSearch,
  });

  const { handleDatasetUpdate, handleDatasetSave, handleDatasetPublish } = useDatasetHooks({
    data,
    templates: fieldTemplates,
    project,
    backendURL,
    backendProjectName,
    backendAccessToken,
    publishToGeospatial,
    inEditor,
    processedCatalog,
    setCleanseOverride,
    setLoading,
    updateProject,
    handleBackendFetch,
  });

  // ****************************************
  // Init

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

  useEffect(() => {
    postMsg({ action: "updateDataCatalog", payload: processedCatalog });
  }, [processedCatalog]);

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
        setPublishToGeospatial(e.data.payload.enableGeoPub);
        if (e.data.payload.searchTerm) setSearchTerm(e.data.payload.searchTerm);
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
        handleInfoboxFieldsFetch(e.data.payload);
      } else if (e.data.action === "infoboxFieldsSave") {
        handleInfoboxFieldsSave(e.data.payload);
      } else if (e.data.action === "buildingSearchOverride") {
        handleBuildingSearchOverride(e.data.payload);
      } else if (e.data.action === "buildingSearchClose") {
        handleBuildingSearchClose(e.data.payload);
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, [handleDatasetPublish, handleInfoboxFieldsFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentPage, setCurrentPage] = useState<Pages>("data");

  const handlePageChange = useCallback((p: Pages) => {
    setCurrentPage(p);
  }, []);

  // ****************************************
  // Building Search
  const handleBuildingSearch = useCallback(
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

  const handleBuildingSearchOverride = useCallback(
    ({ dataID, overrides }: { dataID: string; overrides: any }) => {
      setBuildingSearch(bs => {
        const id = generateID();
        const fieldItem = {
          dataID,
          active: true,
          field: {
            id,
            type: "search",
            updatedAt: new Date(),
            override: overrides,
          },
          cleanseField: {
            id,
            type: "search",
            updatedAt: new Date(),
          },
        };
        const target = bs.find(b => b.dataID === dataID);
        if (target) {
          target.active = true;
          target.field = fieldItem.field;
          target.cleanseField = fieldItem.cleanseField;
        } else {
          bs.push(fieldItem);
        }
        return [...bs];
      });
    },
    [],
  );

  const handleBuildingSearchClose = useCallback(({ dataID }: { dataID: string }) => {
    setBuildingSearch(bs => {
      const target = bs.find(b => b.dataID === dataID);
      if (target) {
        target.active = false;
      }
      return [...bs];
    });
  }, []);

  const handleModalOpen = useCallback(() => {
    postMsg({
      action: "catalogModalOpen",
    });
  }, []);

  return {
    catalog: processedCatalog,
    project,
    inEditor,
    reearthURL,
    backendURL,
    backendProjectName,
    templates: fieldTemplates,
    currentPage,
    loading,
    buildingSearch,
    searchTerm,
    handleSearch,
    handlePageChange,
    handleTemplateAdd,
    handleTemplateSave,
    handleTemplateRemove,
    handleDatasetSave,
    handleDatasetUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectDatasetsUpdate,
    handleProjectSceneUpdate,
    handleModalOpen,
    handleBuildingSearch,
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
