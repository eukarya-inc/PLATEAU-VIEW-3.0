import { Data, DataCatalogItem, Template } from "@web/extensions/sidebar/core/types";
import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import {
  convertDatasetToData,
  handleDataCatalogProcessing,
  postMsg,
} from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RawDataCatalogItem, getDataCatalog, DataSource } from "../api/api";

type Props = {
  dataSource: "plateau" | "custom";
  inEditor?: boolean;
};

export default ({ inEditor, dataSource }: Props) => {
  const [addedDatasetDataIDs, setAddedDatasetDataIDs] = useState<string[]>();
  const [catalogData, setCatalog] = useState<(RawDataCatalogItem & { dataSource?: DataSource })[]>(
    [],
  );

  const [templates, setTemplates] = useState<Template[]>([]);

  const [backendProjectName, setBackendProjectName] = useState<string>();
  const [backendAccessToken, setBackendAccessToken] = useState<string>();
  const [backendURL, setBackendURL] = useState<string>();
  const [catalogURL, setCatalogURL] = useState<string>();
  const [publishToGeospatial, setPublishToGeospatial] = useState(false);

  const [catalogProjectName, setCatalogProjectName] = useState<string>();

  const [data, setData] = useState<Data[]>();

  const processedCatalog = useMemo(() => {
    if (catalogData.length < 1 || data === undefined) return;
    const c = handleDataCatalogProcessing(catalogData, data);
    return inEditor ? c : c.filter(c => !!c.public || c.type_en === "folder");
  }, [catalogData, inEditor, data]);

  useEffect(() => {
    const catalogBaseUrl = catalogURL || backendURL;
    if (catalogBaseUrl) {
      getDataCatalog(catalogBaseUrl, catalogProjectName, dataSource).then(res => {
        setCatalog(res);
      });
    }
  }, [backendURL, catalogProjectName, catalogURL, dataSource]);

  useEffect(() => {
    if (!backendURL) return;
    handleDataFetch();
  }, [backendURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDataFetch = useCallback(async () => {
    if (!backendURL || !backendProjectName) return;
    const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/data`);
    if (res.status !== 200) return;
    const resData = await res.json();

    setData(resData ?? []);
  }, [backendURL, backendProjectName]);

  const handleDataRequest = useCallback(
    async (dataset?: DataCatalogItem) => {
      if (!backendURL || !backendAccessToken || !dataset) return;
      const datasetToSave = convertDatasetToData(dataset, templates);

      const isNew = !data?.find(d => d.dataID === dataset.dataID);

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
      if (res.status === 200) {
        const resData = await res.json();
        setData(prevData => {
          if (!prevData) {
            return [resData];
          }
          const index = prevData?.findIndex(d => d.dataID === resData.dataID);
          const updatedData = [...prevData];
          if (index !== -1) {
            updatedData[index] = resData;
          } else {
            updatedData.push(resData);
          }
          return updatedData;
        });
      }
    },
    [data, templates, backendAccessToken, backendURL, backendProjectName],
  );

  const handleDatasetPublish = useCallback(
    (dataID: string, publish: boolean) => {
      if (!inEditor || !processedCatalog) return;
      const dataset = processedCatalog.find(item => item.dataID === dataID);

      if (!dataset) return;

      dataset.public = publish;

      postMsg({ action: "updateDataset", payload: dataset });
      handleDataRequest(dataset);

      if (publish && publishToGeospatial && dataset.itemId && backendURL && backendAccessToken) {
        fetch(`${backendURL}/publish_to_geospatialjp`, {
          headers: {
            authorization: `Bearer ${backendAccessToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ id: dataset.itemId }),
        })
          .then(r => {
            if (!r.ok)
              throw `failed to publish the data on gspatial.jp: status code is ${r.statusText}`;
          })
          .catch(console.error);
      }
    },
    [
      processedCatalog,
      inEditor,
      backendAccessToken,
      backendURL,
      publishToGeospatial,
      handleDataRequest,
    ],
  );

  const handleClose = useCallback(() => {
    postMsg({ action: "modalClose" });
  }, []);

  const handleDatasetAdd = useCallback(
    (dataset: DataCatalogItem | UserDataItem, keepModalOpen?: boolean) => {
      postMsg({
        action: "msgFromModal",
        payload: { dataset },
      });
      if (!keepModalOpen) handleClose();
    },
    [handleClose],
  );

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "initDataCatalog") {
        if (dataSource === "plateau") {
          setAddedDatasetDataIDs(e.data.payload.addedDatasets);
          setBackendProjectName(e.data.payload.backendProjectName);
          setBackendAccessToken(e.data.payload.backendAccessToken);
          setBackendURL(e.data.payload.backendURL);
          setCatalogURL(e.data.payload.catalogURL);
          setCatalogProjectName(e.data.payload.catalogProjectName);
          setPublishToGeospatial(e.data.payload.enableGeoPub);
        } else {
          setAddedDatasetDataIDs(e.data.payload.customAddedDatasets);
          setBackendProjectName(e.data.payload.customBackendProjectName);
          setBackendAccessToken(e.data.payload.customBackendAccessToken);
          setBackendURL(e.data.payload.customBackendURL);
          setCatalogURL(e.data.payload.customCatalogURL);
          setCatalogProjectName(e.data.payload.customCatalogProjectName);
          setPublishToGeospatial(false);
        }

        setTemplates(e.data.payload.templates);
      } else if (e.data.action === "updateDataCatalog") {
        if (dataSource === "plateau" && e.data.payload.updatedDatasetDataIDs) {
          setAddedDatasetDataIDs(e.data.payload.updatedDatasetDataIDs);
        } else if (dataSource === "custom" && e.data.payload.customUpdatedDatasetDataIDs) {
          setAddedDatasetDataIDs(e.data.payload.customUpdatedDatasetDataIDs);
        }
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, [dataSource]);

  return {
    catalog: processedCatalog,
    addedDatasetDataIDs,
    handleDatasetAdd,
    handleDatasetPublish,
  };
};
