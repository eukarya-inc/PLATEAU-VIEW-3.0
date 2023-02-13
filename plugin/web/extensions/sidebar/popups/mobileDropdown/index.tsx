import useHooks from "@web/extensions/sidebar/core/components/hooks";
import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Tab } from "../../core/components/Mobile";
import { DataCatalogItem } from "../../modals/datacatalog/api/api";

import Catalog from "./Catalog";
import Menu from "./Menu";
import Selection from "./Selection";

const MobileDropdown: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>();

  const {
    catalogData,
    project,
    processedSelectedDatasets,
    reearthURL,
    backendURL,
    handleDatasetSave,
    handleDatasetUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectSceneUpdate,
  } = useHooks();

  const changeTab = useCallback(
    (tab: Tab) => {
      postMsg({ action: "msgFromPopup", payload: { currentTab: tab } }); // changes the selected tab in the ui
      setCurrentTab(tab); // changes the selected tab in the popup
    },
    [setCurrentTab],
  );

  const handleDatasetAdd = useCallback(
    (dataset: DataCatalogItem) => {
      handleProjectDatasetAdd(dataset as DataCatalogItem);
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

  const addedDatasetIds = useMemo(
    () => project.selectedDatasets.map(dataset => dataset.id),
    [project.selectedDatasets],
  );

  return (
    <Wrapper>
      {currentTab &&
        {
          catalog: (
            <Catalog
              addedDatasetIds={addedDatasetIds}
              isMobile
              catalogData={catalogData}
              onDatasetAdd={handleDatasetAdd}
            />
          ),
          selection: (
            <Selection
              selectedDatasets={processedSelectedDatasets}
              onDatasetSave={handleDatasetSave}
              onDatasetUpdate={handleDatasetUpdate}
              onDatasetRemove={handleProjectDatasetRemove}
              onDatasetRemoveAll={handleProjectDatasetRemoveAll}
            />
          ),
          menu: (
            <Menu
              project={{
                sceneOverrides: project.sceneOverrides,
                selectedDatasets: processedSelectedDatasets,
              }}
              backendURL={backendURL}
              reearthURL={reearthURL}
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
