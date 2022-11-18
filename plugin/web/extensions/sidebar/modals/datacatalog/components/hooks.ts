import { postMsg } from "@web/extensions/sidebar/core/utils";
import { Data } from "@web/extensions/sidebar/modals/datacatalog/types";
import { useCallback, useEffect, useState } from "react";

export type Tab = "dataset" | "your-data";

export default () => {
  const [currentTab, changeTabs] = useState<Tab>("dataset");
  const [addedDatasetIds, setAddedDatasetIds] = useState<string[]>();

  const handleClose = useCallback(() => {
    postMsg({ action: "modal-close" });
  }, []);

  const handleDatasetAdd = useCallback(
    (dataset: Data) => {
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
    postMsg({ action: "fetchData" }); // Needed to trigger sending selected dataset ids from Sidebar
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.type === "msgFromSidebar") {
        setAddedDatasetIds(e.data.payload);
      }
    };
    addEventListener("message", e => eventListenerCallback(e));
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []);

  return {
    currentTab,
    addedDatasetIds,
    handleClose,
    handleTabChange: changeTabs,
    handleDatasetAdd,
  };
};
