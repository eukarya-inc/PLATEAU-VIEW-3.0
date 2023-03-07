import useHooks from "@web/extensions/sidebar/core/components/hooks";
import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Tab } from "../../core/components/Mobile";
import { DataCatalogItem } from "../../modals/datacatalog/api/api";
import { UserDataItem } from "../../modals/datacatalog/types";

import Catalog from "./Catalog";
import Menu from "./Menu";
import Selection from "./Selection";

const MobileDropdown: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>();

  const {
    catalog,
    project,
    loading,
    reearthURL,
    backendURL,
    backendProjectName,
    handleDatasetSave,
    handleDatasetUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectSceneUpdate,
    handleThreeDTilesSearch,
  } = useHooks();

  const changeTab = useCallback(
    (tab: Tab) => {
      postMsg({ action: "msgFromPopup", payload: { currentTab: tab } }); // changes the selected tab in the ui
      setCurrentTab(tab); // changes the selected tab in the popup
    },
    [setCurrentTab],
  );

  const handleDatasetAdd = useCallback(
    (dataset: DataCatalogItem | UserDataItem) => {
      handleProjectDatasetAdd(dataset);
      changeTab("selection");
    },
    [changeTab, handleProjectDatasetAdd],
  );

  useEffect(() => {
    postMsg({ action: "initPopup" });
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return null;
      if (e.data.action) {
        if (e.data.action === "msgToPopup" && e.data.payload) {
          setCurrentTab(e.data.payload);
        }
      }
    };
    (globalThis as any).addEventListener("message", eventListenerCallback);
    return () => {
      (globalThis as any).removeEventListener("message", eventListenerCallback);
    };
  });

  const addedDatasetDataIDs = useMemo(
    () => project.datasets.map(dataset => dataset.dataID),
    [project.datasets],
  );

  return (
    <Wrapper>
      {currentTab &&
        {
          catalog: (
            <Catalog
              addedDatasetDataIDs={addedDatasetDataIDs}
              isMobile
              catalogData={catalog}
              onDatasetAdd={handleDatasetAdd}
            />
          ),
          selection: (
            <Selection
              selectedDatasets={project.datasets}
              savingDataset={loading}
              onDatasetSave={handleDatasetSave}
              onDatasetUpdate={handleDatasetUpdate}
              onDatasetRemove={handleProjectDatasetRemove}
              onDatasetRemoveAll={handleProjectDatasetRemoveAll}
              onThreeDTilesSearch={handleThreeDTilesSearch}
              onSceneUpdate={handleProjectSceneUpdate}
            />
          ),
          menu: (
            <Menu
              project={project}
              reearthURL={reearthURL}
              backendURL={backendURL}
              backendProjectName={backendProjectName}
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
