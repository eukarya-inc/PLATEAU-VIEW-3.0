import { CatalogItem, CatalogRawItem } from "@web/extensions/sidebar/core/processCatalog";
import { postMsg } from "@web/extensions/sidebar/core/utils";
import { useCallback, useEffect, useState } from "react";

export type Tab = "dataset" | "your-data";

export default () => {
  const [currentTab, changeTabs] = useState<Tab>("dataset");
  const [addedDatasetIds, setAddedDatasetIds] = useState<string[]>();
  const [rawCatalog, setRawCatalog] = useState<CatalogRawItem[]>([]);

  const handleClose = useCallback(() => {
    postMsg({ action: "modal-close" });
  }, []);

  const handleDatasetAdd = useCallback(
    (dataset: CatalogItem) => {
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

  useEffect(() => {
    // Needed to trigger sending selected dataset ids from Sidebar
    postMsg({ action: "initDatasetCatalog" });
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.type === "msgFromSidebar") {
        setAddedDatasetIds(e.data.payload.addedDatasets);
        setRawCatalog(e.data.payload.rawCatalog);
      }
    };
    addEventListener("message", e => eventListenerCallback(e));
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []);

  return {
    currentTab,
    rawCatalog,
    addedDatasetIds,
    handleClose,
    handleTabChange: changeTabs,
    handleDatasetAdd,
  };
};
