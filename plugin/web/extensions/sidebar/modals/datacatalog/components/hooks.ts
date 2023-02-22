import { DataCatalogItem } from "@web/extensions/sidebar/core/types";
import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

export type Tab = "dataset" | "your-data";

export default () => {
  const [currentTab, changeTabs] = useState<Tab>("dataset");
  const [addedDatasetDataIDs, setAddedDatasetDataIDs] = useState<string[]>();
  const [catalog, setCatalog] = useState<DataCatalogItem[]>([]);
  const [inEditor, setEditorState] = useState(false);

  const handleClose = useCallback(() => {
    postMsg({ action: "modalClose" });
  }, []);

  const handleDatasetAdd = useCallback(
    (dataset: DataCatalogItem | UserDataItem) => {
      postMsg({
        action: "msgFromModal",
        payload: {
          dataset,
        },
      });
      handleClose();
    },
    [handleClose],
  );

  const handleDatasetPublish = useCallback((dataID: string, publish: boolean) => {
    postMsg({ action: "updateDataset", payload: { dataID, publish } });
  }, []);

  useEffect(() => {
    postMsg({ action: "initDataCatalog" }); // Needed to trigger sending selected dataset ids from Sidebar
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "initDataCatalog") {
        setAddedDatasetDataIDs(e.data.payload.addedDatasets);
        setCatalog(e.data.payload.dataCatalog);
        setEditorState(e.data.payload.inEditor);
      } else if (e.data.action === "updateCatalog") {
        setCatalog(e.data.payload);
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []);

  return {
    currentTab,
    catalog,
    addedDatasetDataIDs,
    inEditor,
    handleClose,
    handleTabChange: changeTabs,
    handleDatasetAdd,
    handleDatasetPublish,
  };
};
