import { postMsg, updateExtended } from "@web/extensions/sidebar/utils";
import { getActiveFieldIDs } from "@web/extensions/sidebar/utils/dataset";
import { useCallback, useEffect, useState, useMemo } from "react";

import { Tab } from "..";
import { DataCatalogItem } from "../../../../modals/datacatalog/api/api";
import { FldInfo, Template } from "../../../types";

import useProjectHooks from "./projectHooks";

export default () => {
  const [inEditor, setInEditor] = useState(true);
  const [selected, setSelected] = useState<Tab | undefined>();

  const [catalogURL, setCatalogURL] = useState<string>();
  const [catalogProjectName, setCatalogProjectName] = useState<string>();
  const [reearthURL, setReearthURL] = useState<string>();
  const [backendURL, setBackendURL] = useState<string>();
  const [backendProjectName, setBackendProjectName] = useState<string>();

  const [isCustomProject, setIsCustomProject] = useState<boolean>(false);
  const [customCatalogURL, setCustomCatalogURL] = useState<string>();
  const [customCatalogProjectName, setCustomCatalogProjectName] = useState<string>();
  const [customReearthURL, setCustomReearthURL] = useState<string>();
  const [customBackendURL, setCustomBackendURL] = useState<string>();
  const [customBackendProjectName, setCustomBackendProjectName] = useState<string>();

  const [customProjectName, setCustomProjectName] = useState<string>();
  const [customLogo, setCustomLogo] = useState<string>();

  const [fieldTemplates, setFieldTemplates] = useState<Template[]>([]);
  const [infoboxTemplates, setInfoboxTemplates] = useState<Template[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      let resData: Template[] = [];
      if (backendURL && backendProjectName) {
        const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/templates`);
        if (res.status === 200) {
          const plateauResData = (await res.json()) as Template[];
          resData = plateauResData.map(t => ({ ...t, dataSource: "plateau" }));
        }
      }
      if (isCustomProject) {
        const res = await fetch(
          `${customBackendURL}/sidebar/${customBackendProjectName}/templates`,
        );
        if (res.status === 200) {
          const customResData = (await res.json()) as Template[];
          resData = resData.concat(customResData.map(t => ({ ...t, dataSource: "custom" })));
        }
      }

      if (resData) {
        setFieldTemplates(resData.filter((t: Template) => t.type === "field"));
        setInfoboxTemplates(resData.filter((t: Template) => t.type === "infobox"));
      }
    })();
  }, [backendURL, backendProjectName]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    project,
    updateProject,
    setProjectID,
    setCleanseOverride,
    handleOverride,
    handleOverrideForMobileBuildingSearch,
    handleOverrideForMobileBuildingSearchClose,
    handleProjectSceneUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectDatasetsUpdate,
    handleStorySaveData,
  } = useProjectHooks({
    fieldTemplates,
    backendURL,
    backendProjectName,
    isCustomProject,
    customBackendURL,
    customBackendProjectName,
  });

  const reearthPublishURL = useMemo(() => {
    return isCustomProject ? customReearthURL : reearthURL;
  }, [isCustomProject, customReearthURL, reearthURL]);

  const handleDatasetUpdate = useCallback(
    (updatedDataset: DataCatalogItem, cleanseOverride?: any) => {
      let updatedDatasets: DataCatalogItem[];

      updateProject?.(project => {
        updatedDatasets = [...project.datasets];
        const datasetIndex = updatedDatasets.findIndex(d2 => d2.dataID === updatedDataset.dataID);
        if (datasetIndex >= 0) {
          if (updatedDatasets[datasetIndex].visible !== updatedDataset.visible) {
            postMsg({
              action: "updateDatasetVisibility",
              payload: { dataID: updatedDataset.dataID, hide: !updatedDataset.visible },
            });
          }
          if (cleanseOverride) {
            setCleanseOverride?.(cleanseOverride);
          }
          updatedDatasets[datasetIndex] = updatedDataset;
        }
        const updatedProject = {
          ...project,
          datasets: updatedDatasets,
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        postMsg({ action: "msgToPopup", payload: { project: updatedProject } });
        return updatedProject;
      });

      const activeIDs = getActiveFieldIDs(
        updatedDataset.components,
        updatedDataset.selectedGroup,
        updatedDataset.config?.data,
      );

      handleOverride?.(updatedDataset, activeIDs);
    },
    [handleOverride, updateProject, setCleanseOverride],
  );

  // ****************************************
  // Init

  useEffect(() => {
    postMsg({ action: "init" }); // Needed to trigger sending initialization data to sidebar
  }, []);

  // ****************************************

  const handleInfoboxFieldsFetch = useCallback(
    (dataID: string) => {
      let fields: (Template & { fldInfo?: FldInfo }) | undefined;
      const catalogItem = project.datasets?.find(d => d.dataID === dataID);
      if (catalogItem) {
        const name = catalogItem?.type;
        const dataType = catalogItem?.type_en;
        fields = infoboxTemplates.find(ft => ft.type === "infobox" && ft.dataType === dataType) ?? {
          id: "",
          type: "infobox",
          name,
          dataType,
          fields: [],
        };

        fields.fldInfo = {
          name: catalogItem.name,
          datasetName: catalogItem.selectedDataset?.name,
        };
      }

      postMsg({
        action: "infoboxFieldsFetch",
        payload: fields,
      });
    },
    [project.datasets, infoboxTemplates],
  );

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "mobileDatasetAdd") {
        handleProjectDatasetAdd(e.data.payload);
      } else if (e.data.action === "mobileDatasetUpdate") {
        handleDatasetUpdate(e.data.payload);
      } else if (e.data.action === "mobileDatasetRemove") {
        handleProjectDatasetRemove(e.data.payload);
      } else if (e.data.action === "mobileDatasetRemoveAll") {
        handleProjectDatasetRemoveAll();
      } else if (e.data.action === "mobileProjectDatasetsUpdate") {
        handleProjectDatasetsUpdate(e.data.payload);
      } else if (e.data.action === "mobileProjectSceneUpdate") {
        handleProjectSceneUpdate(e.data.payload);
      } else if (e.data.action === "mobileBuildingSearch") {
        handleBuildingSearch(e.data.payload);
      } else if (e.data.action === "init" && e.data.payload) {
        setProjectID(e.data.payload.projectID);
        setInEditor(e.data.payload.inEditor);
        setCatalogURL(e.data.payload.catalogURL);
        setCatalogProjectName(e.data.payload.catalogProjectName);
        setReearthURL(`${e.data.payload.reearthURL}`);
        setBackendURL(e.data.payload.backendURL);
        setBackendProjectName(e.data.payload.backendProjectName);
        setCustomCatalogURL(e.data.payload.customCatalogURL);
        setCustomCatalogProjectName(e.data.payload.customCatalogProjectName);
        setCustomReearthURL(e.data.payload.customReearthURL);
        setCustomBackendURL(e.data.payload.customBackendURL);
        setCustomBackendProjectName(e.data.payload.customBackendProjectName);
        setIsCustomProject(
          e.data.payload.customBackendURL &&
            e.data.payload.customBackendProjectName &&
            e.data.payload.customBackendAccessToken,
        );
        setCustomProjectName(e.data.payload.customProjectName);
        setCustomLogo(e.data.payload.customLogo);
        if (e.data.payload.searchTerm) setSearchTerm(e.data.payload.searchTerm);
        if (e.data.payload.draftProject) {
          updateProject(e.data.payload.draftProject);
        }
      } else if (e.data.action === "triggerCatalogOpen") {
        handleModalOpen();
      } else if (e.data.action === "storyShare") {
        setSelected("menu");
      } else if (e.data.action === "storySaveData") {
        handleStorySaveData(e.data.payload);
      } else if (e.data.action === "infoboxFieldsFetch") {
        handleInfoboxFieldsFetch(e.data.payload);
      } else if (e.data.action === "buildingSearchOverride") {
        handleOverrideForMobileBuildingSearch(e.data.payload);
      } else if (e.data.action === "buildingSearchClose") {
        handleOverrideForMobileBuildingSearchClose(e.data.payload);
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, [handleInfoboxFieldsFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ****************************************
  // Building Search
  const handleBuildingSearch = useCallback(
    (dataID: string) => {
      const plateauItem = project.datasets.find(pd => pd.dataID === dataID);
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
    [project.datasets],
  );

  const handleModalOpen = useCallback(() => {
    postMsg({
      action: "catalogModalOpen",
      payload: {
        templates: fieldTemplates,
      },
    });
  }, [fieldTemplates]);

  return {
    selected,
    project,
    templates: fieldTemplates,
    catalogProjectName,
    catalogURL,
    reearthURL: reearthPublishURL,
    backendURL,
    backendProjectName,
    inEditor,
    searchTerm,
    isCustomProject,
    customReearthURL,
    customCatalogURL,
    customCatalogProjectName,
    customBackendURL,
    customBackendProjectName,
    customProjectName,
    customLogo,
    setSelected,
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
