import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useEffect, useState } from "react";

import { Tab } from "../../core/components/Mobile";

import Catalog from "./Catalog";
import useHooks from "./hooks";
import Menu from "./Menu";
import Selection from "./Selection";

const MobileDropdown: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>();

  const {
    rawCatalog,
    processedSelectedDatasets,
    project,
    reearthURL,
    backendURL,
    handleProjectDatasetRemove,
    handleDatasetRemoveAll,
    handleProjectSceneUpdate,
  } = useHooks();

  useEffect(() => {
    postMsg({ action: "initPopup" });
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return null;
      if (e.data.type) {
        if (e.data.type === "msgToPopup" && e.data.message) {
          setCurrentTab(e.data.message);
        }
      }
    };
    (globalThis as any).addEventListener("message", (e: any) => eventListenerCallback(e));
    return () => {
      (globalThis as any).removeEventListener("message", eventListenerCallback);
    };
  });

  return (
    <Wrapper>
      {currentTab &&
        {
          catalog: <Catalog rawCatalog={rawCatalog} />,
          selection: (
            <Selection
              selectedDatasets={processedSelectedDatasets}
              onDatasetRemove={handleProjectDatasetRemove}
              onDatasetRemoveAll={handleDatasetRemoveAll}
            />
          ),
          menu: (
            <Menu
              project={project}
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
