import { Project } from "@web/extensions/sidebar/types";
import { postMsg, convertDatasetToData } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect } from "react";

import { Data, DataCatalogItem, Template } from "../../../types";

export default ({
  templates,
  project,
  backendURL: plateauBackendURL,
  backendProjectName: plateuProjectName,
  backendAccessToken: plateauAccessToken,
  isCustomProject,
  customBackendURL,
  customBackendProjectName,
  customBackendAccessToken,
  inEditor,
  setCleanseOverride,
  setLoading,
  updateProject,
}: {
  templates?: Template[];
  project?: Project;
  backendURL?: string;
  backendProjectName?: string;
  backendAccessToken?: string;
  isCustomProject: boolean;
  customBackendURL?: string;
  customBackendProjectName?: string;
  customBackendAccessToken?: string;
  inEditor?: boolean;
  setCleanseOverride?: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  updateProject?: React.Dispatch<React.SetStateAction<Project>>;
}) => {
  const getTargetBackend = useCallback(
    (isCustom: boolean) => {
      return {
        backendURL: isCustom ? customBackendURL : plateauBackendURL,
        backendProjectName: isCustom ? customBackendProjectName : plateuProjectName,
        backendAccessToken: isCustom ? customBackendAccessToken : plateauAccessToken,
      };
    },
    [
      plateauBackendURL,
      plateuProjectName,
      plateauAccessToken,
      customBackendURL,
      customBackendProjectName,
      customBackendAccessToken,
    ],
  );

  const handleDataFetch = useCallback(async () => {
    let resData: Data[] = [];
    if (plateauBackendURL && plateuProjectName) {
      const res = await fetch(`${plateauBackendURL}/sidebar/${plateuProjectName}/data`);
      if (res.status === 200) {
        const plateauResData = (await res.json()) as Data[];
        resData = plateauResData.map(t => ({ ...t, dataSource: "plateau" }));
      }
    }
    if (isCustomProject) {
      const res = await fetch(`${customBackendURL}/sidebar/${customBackendProjectName}/data`);
      if (res.status === 200) {
        const customResData = (await res.json()) as Data[];
        resData = resData.concat(customResData.map(t => ({ ...t, dataSource: "custom" })));
      }
    }
    return resData;
  }, [
    isCustomProject,
    plateauBackendURL,
    plateuProjectName,
    customBackendURL,
    customBackendProjectName,
  ]);

  const handleDataRequest = useCallback(
    async (dataset?: DataCatalogItem) => {
      if (
        !dataset ||
        (dataset.dataSource !== "custom" &&
          (!plateauBackendURL || !plateuProjectName || !plateauAccessToken)) ||
        (dataset.dataSource === "custom" &&
          (!customBackendURL || !customBackendProjectName || !customBackendAccessToken))
      )
        return;
      const datasetToSave = convertDatasetToData(dataset, templates);

      const data = await handleDataFetch();
      const isNew = data ? !data.find((d: Data) => d.dataID === dataset.dataID) : undefined;

      const { backendURL, backendProjectName, backendAccessToken } = getTargetBackend(
        dataset.dataSource === "custom",
      );

      const fetchURL = !isNew
        ? `${backendURL}/sidebar/${backendProjectName}/data/${dataset.id}` // should be id and not dataID because id here is the CMS item's id
        : `${backendURL}/sidebar/${backendProjectName}/data`;

      const method = !isNew ? "PATCH" : "POST";

      const res = await fetch(fetchURL, {
        headers: {
          authorization: `Bearer ${backendAccessToken}`,
        },
        method,
        body: JSON.stringify(datasetToSave),
      });
      if (res.status !== 200) {
        console.log("A problem occured accessing the server:", res.statusText);
        return;
      }
    },
    [
      templates,
      plateauBackendURL,
      plateuProjectName,
      plateauAccessToken,
      customBackendURL,
      customBackendProjectName,
      customBackendAccessToken,
      getTargetBackend,
      handleDataFetch,
    ],
  );

  const handleDatasetUpdate = useCallback(
    (updatedDataset: DataCatalogItem, cleanseOverride?: any) => {
      updateProject?.(project => {
        const updatedDatasets = [...project.datasets];
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
        return updatedProject;
      });
    },
    [updateProject, setCleanseOverride],
  );

  const handleDatasetSave = useCallback(
    (dataID: string) => {
      (async () => {
        if (!inEditor) return;
        setLoading?.(true);
        const selectedDataset = project?.datasets.find(d => d.dataID === dataID);

        await handleDataRequest(selectedDataset);
        setLoading?.(false);
      })();
    },
    [inEditor, project?.datasets, setLoading, handleDataRequest],
  );

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "updateDataset" && e.data.payload) {
        handleDatasetUpdate(e.data.payload);
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, [handleDatasetUpdate]);

  return {
    handleDatasetUpdate,
    handleDatasetSave,
  };
};
