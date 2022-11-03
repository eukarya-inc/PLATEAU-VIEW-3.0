import { useCallback, useEffect, useState } from "react";

import { Dataset } from "./components/content/Selection/DatasetCard";
import { useCurrentOverrides } from "./state";
import { ReearthApi } from "./types";
import { mergeProperty, postMsg } from "./utils";

export default () => {
  // ****************************************
  // Override Logic
  const [overrides, updateOverrides] = useCurrentOverrides();

  const handleOverridesUpdate = useCallback(
    (updatedProperties: Partial<ReearthApi>) => {
      updateOverrides([overrides, updatedProperties].reduce((p, v) => mergeProperty(p, v)));
    },
    [overrides],
  );

  useEffect(() => {
    postMsg({ action: "updateOverrides", payload: overrides });
  }, [overrides]);
  // ****************************************

  // ****************************************
  // Minimize Logic
  const [minimized, setMinimize] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      postMsg({ action: "minimize", payload: minimized });
    }, 250);
  }, [minimized]);
  // ****************************************

  // ****************************************
  // Dataset Logic
  const [selectedDatasets, updateDatasets] = useState<Dataset[]>([]);

  const handleDatasetAdd = useCallback((dataset: Dataset) => {
    updateDatasets(oldDatasets => [...oldDatasets, dataset]);
  }, []);

  const handleDatasetRemove = useCallback(
    (id: string) => updateDatasets(oldDatasets => oldDatasets.filter(d => d.id !== id)),
    [],
  );

  const handleDatasetRemoveAll = useCallback(() => updateDatasets([]), []);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.type === "msgFromModal") {
        if (e.data.payload.dataset) {
          handleDatasetAdd(e.data.payload.dataset);
        }
      }
    };
    addEventListener("message", e => eventListenerCallback(e));
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []);
  // ****************************************

  const handleModalOpen = useCallback(() => {
    postMsg({ action: "modal-open" });
  }, []);

  return {
    selectedDatasets,
    overrides,
    minimized,
    setMinimize,
    handleDatasetRemove,
    handleDatasetRemoveAll,
    handleOverridesUpdate,
    handleModalOpen,
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
