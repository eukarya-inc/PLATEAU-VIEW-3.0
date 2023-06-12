import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Tab } from "../../core/components/mobile";
import { defaultProject } from "../../core/components/mobile/hooks/projectHooks";
import { Template } from "../../core/types";
import { DataCatalogItem } from "../../modals/datacatalog/api/api";
import { UserDataItem } from "../../modals/datacatalog/types";
import { Project, ReearthApi } from "../../types";

import Catalog from "./Catalog";
import Menu from "./Menu";
import Selection from "./Selection";

const MobileDropdown: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>();
  const [templates, setTemplates] = useState<Template[]>();
  const [project, setProject] = useState<Project>(defaultProject);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<{ id?: string; name?: string }[]>([]);

  const [isCustomProject, setIsCustomProject] = useState<boolean>(false);

  const [customExpandedFolders, setCustomExpandedFolders] = useState<
    { id?: string; name?: string }[]
  >([]);

  const [inEditor, setInEditor] = useState(false);

  const [selectedDataset, setSelectedDataset] = useState<DataCatalogItem>();

  const [catalogProjectName, setCatalogProjectName] = useState<string>();
  const [catalogURL, setCatalogURL] = useState<string>();
  const [reearthURL, setReearthURL] = useState<string>();
  const [backendURL, setBackendURL] = useState<string>();
  const [backendProjectName, setBackendProjectName] = useState<string>();

  const [customCatalogProjectName, setCustomCatalogProjectName] = useState<string>();
  const [customCatalogURL, setCustomCatalogURL] = useState<string>();
  const [customReearthURL, setCustomReearthURL] = useState<string>();
  const [customBackendURL, setCustomBackendURL] = useState<string>();
  const [customBackendProjectName, setCustomBackendProjectName] = useState<string>();

  useEffect(() => {
    postMsg({ action: "initPopup" });
  }, []);

  const changeTab = useCallback(
    (tab: Tab) => {
      postMsg({ action: "msgFromPopup", payload: { currentTab: tab } }); // changes the selected tab in the ui
      setCurrentTab(tab); // changes the selected tab in the popup
      setSearchTerm("");
      postMsg({ action: "saveSearchTerm", payload: { searchTerm: "" } });
    },
    [setCurrentTab],
  );

  const handleDatasetUpdate = useCallback((dataset: DataCatalogItem) => {
    postMsg({ action: "mobileDatasetUpdate", payload: dataset });
  }, []);

  const handleProjectDatasetRemove = useCallback((id: string) => {
    postMsg({ action: "mobileDatasetRemove", payload: id });
  }, []);

  const handleProjectDatasetRemoveAll = useCallback(() => {
    postMsg({ action: "mobileDatasetRemoveAll" });
  }, []);

  const handleProjectDatasetsUpdate = useCallback((datasets: DataCatalogItem[]) => {
    postMsg({ action: "mobileProjectDatasetsUpdate", payload: datasets });
  }, []);

  const handleBuildingSearch = useCallback((id: string) => {
    postMsg({ action: "mobileBuildingSearch", payload: id });
  }, []);

  const handleProjectSceneUpdate = useCallback((updatedProperties: Partial<ReearthApi>) => {
    postMsg({ action: "mobileProjectSceneUpdate", payload: updatedProperties });
  }, []);

  const handleSearch = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(value);
    postMsg({ action: "saveSearchTerm", payload: { searchTerm: value } });
  }, []);

  const handleDatasetAdd = useCallback(
    (dataset: DataCatalogItem | UserDataItem) => {
      postMsg({ action: "mobileDatasetAdd", payload: dataset });

      changeTab("selection");
    },
    [changeTab],
  );

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return null;
      if (e.data.action) {
        if (e.data.action === "msgToPopup" && e.data.payload) {
          if (e.data.payload.selected) setCurrentTab(e.data.payload.selected);
          if (e.data.payload.templates) setTemplates(e.data.payload.templates);
          if (e.data.payload.project) setProject(e.data.payload.project);
          if (e.data.payload.inEditor) setInEditor(e.data.payload.inEditor);
          if (e.data.payload.searchTerm) setSearchTerm(e.data.payload.searchTerm);
          if (e.data.payload.expandedFolders) setExpandedFolders(e.data.payload.expandedFolders);

          if (e.data.payload.isCustomProject) setIsCustomProject(e.data.payload.isCustomProject);
          if (e.data.payload.customExpandedFolders)
            setCustomExpandedFolders(e.data.payload.customExpandedFolders);

          if (e.data.payload.reearthURL) setReearthURL(e.data.payload.reearthURL);
          if (e.data.payload.backendURL) setBackendURL(e.data.payload.backendURL);
          if (e.data.payload.catalogURL) setCatalogURL(e.data.payload.catalogURL);
          if (e.data.payload.catalogProjectName)
            setCatalogProjectName(e.data.payload.catalogProjectName);
          if (e.data.payload.backendProjectName)
            setBackendProjectName(e.data.payload.backendProjectName);

          if (e.data.payload.customReearthURL) setCustomReearthURL(e.data.payload.customReearthURL);
          if (e.data.payload.customBackendURL) setCustomBackendURL(e.data.payload.customBackendURL);
          if (e.data.payload.customCatalogURL) setCustomCatalogURL(e.data.payload.customCatalogURL);
          if (e.data.payload.customCatalogProjectName)
            setCustomCatalogProjectName(e.data.payload.customCatalogProjectName);
          if (e.data.payload.customBackendProjectName)
            setCustomBackendProjectName(e.data.payload.customBackendProjectName);
        } else if (e.data.action === "mobileCatalogOpen") {
          setSelectedDataset(e.data.payload);
          changeTab("catalog");
        }
      }
    };
    (globalThis as any).addEventListener("message", eventListenerCallback);
    return () => {
      (globalThis as any).removeEventListener("message", eventListenerCallback);
    };
  });

  const addedDatasetDataIDs = useMemo(
    () => project?.datasets?.filter(d => d.dataSource === "plateau").map(dataset => dataset.dataID),
    [project?.datasets],
  );

  const customAddedDatasetDataIDs = useMemo(
    () => project?.datasets?.filter(d => d.dataSource === "custom").map(dataset => dataset.dataID),
    [project?.datasets],
  );

  return (
    <Wrapper>
      {currentTab &&
        {
          catalog: (
            <Catalog
              isMobile
              inEditor={inEditor}
              isCustomProject={isCustomProject}
              addedDatasetDataIDs={addedDatasetDataIDs}
              searchTerm={searchTerm}
              expandedFolders={expandedFolders}
              selectedDataset={selectedDataset}
              catalogProjectName={catalogProjectName}
              catalogURL={catalogURL}
              backendURL={backendURL}
              backendProjectName={backendProjectName}
              customAddedDatasetDataIDs={customAddedDatasetDataIDs}
              customExpandedFolders={customExpandedFolders}
              customCatalogProjectName={customCatalogProjectName}
              customCatalogURL={customCatalogURL}
              customBackendURL={customBackendURL}
              customBackendProjectName={customBackendProjectName}
              setSelectedDataset={setSelectedDataset}
              setExpandedFolders={setExpandedFolders}
              setCustomExpandedFolders={setCustomExpandedFolders}
              onSearch={handleSearch}
              setSearchTerm={setSearchTerm}
              onDatasetAdd={handleDatasetAdd}
            />
          ),
          selection: (
            <Selection
              selectedDatasets={project.datasets}
              templates={templates}
              isCustomProject={isCustomProject}
              onDatasetUpdate={handleDatasetUpdate}
              onDatasetRemove={handleProjectDatasetRemove}
              onDatasetRemoveAll={handleProjectDatasetRemoveAll}
              onProjectDatasetsUpdate={handleProjectDatasetsUpdate}
              onBuildingSearch={handleBuildingSearch}
              onSceneUpdate={handleProjectSceneUpdate}
            />
          ),
          menu: (
            <Menu
              project={project}
              reearthURL={reearthURL}
              backendURL={backendURL}
              backendProjectName={backendProjectName}
              isCustomProject={isCustomProject}
              customReearthURL={customReearthURL}
              customBackendURL={customBackendURL}
              customBackendProjectName={customBackendProjectName}
              onProjectSceneUpdate={handleProjectSceneUpdate}
            />
          ),
        }[currentTab]}
    </Wrapper>
  );
};

export default MobileDropdown;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;
