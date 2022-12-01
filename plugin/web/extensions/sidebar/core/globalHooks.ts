import { useCallback, useEffect, useState } from "react";

import { Dataset } from "./components/content/common/DatasetCard";
import { useCurrentOverrides } from "./state";
import { ReearthApi } from "./types";
import { mergeProperty, postMsg } from "./utils";

export default () => {
  // ****************************************
  // Init
  useEffect(() => {
    postMsg({ action: "init" }); // Needed to trigger sending initialization data to sidebar
  }, []);
  // ****************************************

  // ****************************************
  // Override
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
  // Minimize
  const [minimized, setMinimize] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      postMsg({ action: "minimize", payload: minimized });
    }, 250);
  }, [minimized]);
  // ****************************************

  // ****************************************
  // Dataset
  const [selectedDatasets, updateDatasets] = useState<Dataset[]>([]);
  const [inEditor, setInEditor] = useState(true);

  const handleDatasetAdd = useCallback((dataset: Dataset) => {
    updateDatasets(oldDatasets => [...oldDatasets, dataset]);
    postMsg({ action: "addDatasetToScene", payload: dataset });
  }, []);

  const handleDatasetRemove = useCallback(
    (id: string) => updateDatasets(oldDatasets => oldDatasets.filter(d => d.id !== id)),
    [],
  );

  const handleDatasetRemoveAll = useCallback(() => updateDatasets([]), []);

  // ****************************************

  const handleModalOpen = useCallback(() => {
    const selectedIds = selectedDatasets.map(d => d.id);
    postMsg({ action: "modal-open", payload: selectedIds });
  }, [selectedDatasets]);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.type === "msgFromModal") {
        if (e.data.payload.dataset) {
          handleDatasetAdd(e.data.payload.dataset);
        }
      } else if (e.data.type === "init") {
        setInEditor(e.data.payload.inEditor);
      }
    };
    addEventListener("message", e => eventListenerCallback(e));
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []);

  return {
    selectedDatasets,
    overrides,
    minimized,
    inEditor,
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
