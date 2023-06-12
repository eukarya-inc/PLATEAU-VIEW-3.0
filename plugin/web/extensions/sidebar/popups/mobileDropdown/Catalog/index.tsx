import { Data } from "@web/extensions/sidebar/core/types";
import {
  DataCatalogGroup,
  DataCatalogItem,
  GroupBy,
  RawDataCatalogItem,
  getDataCatalog,
} from "@web/extensions/sidebar/modals/datacatalog/api/api";
import DatasetTree from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/DatasetTree";
import DatasetDetails from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/Details";
import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import { handleDataCatalogProcessing, postMsg } from "@web/extensions/sidebar/utils";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import PopupItem from "../sharedComponents/PopupItem";

type Props = {
  isMobile?: boolean;
  inEditor?: boolean;
  isCustomProject: boolean;
  selectedDataset?: DataCatalogItem;

  addedDatasetDataIDs?: string[];
  searchTerm: string;
  expandedFolders?: {
    id?: string | undefined;
    name?: string | undefined;
  }[];
  catalogProjectName?: string;
  catalogURL?: string;
  backendURL?: string;
  backendProjectName?: string;
  setExpandedFolders?: React.Dispatch<
    React.SetStateAction<
      {
        id?: string | undefined;
        name?: string | undefined;
      }[]
    >
  >;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSearchTerm: (searchTerm: string) => void;

  customAddedDatasetDataIDs?: string[];
  customExpandedFolders?: {
    id?: string | undefined;
    name?: string | undefined;
  }[];
  customCatalogProjectName?: string;
  customCatalogURL?: string;
  customBackendURL?: string;
  customBackendProjectName?: string;
  setCustomExpandedFolders?: React.Dispatch<
    React.SetStateAction<
      {
        id?: string | undefined;
        name?: string | undefined;
      }[]
    >
  >;

  setSelectedDataset: React.Dispatch<React.SetStateAction<DataCatalogItem | undefined>>;
  onDatasetAdd: (dataset: DataCatalogItem | UserDataItem, keepModalOpen?: boolean) => void;
};

type Tab = "plateau" | "custom";

const Catalog: React.FC<Props> = ({
  isMobile,
  inEditor,
  isCustomProject,
  selectedDataset,
  addedDatasetDataIDs,
  searchTerm,
  expandedFolders,
  catalogProjectName,
  catalogURL,
  backendURL,
  backendProjectName,
  setExpandedFolders,
  onSearch,
  setSearchTerm,
  customAddedDatasetDataIDs,
  customExpandedFolders,
  customCatalogProjectName,
  customCatalogURL,
  customBackendURL,
  customBackendProjectName,
  setCustomExpandedFolders,
  setSelectedDataset,
  onDatasetAdd,
}) => {
  const [currentTab, changeTabs] = useState<Tab>();
  const [filter, setFilter] = useState<GroupBy>("city");
  const [customFilter, setCustomFilter] = useState<GroupBy>("city");

  const [page, setPage] = useState<"catalog" | "details">("catalog");

  const [catalogData, setCatalog] = useState<RawDataCatalogItem[]>([]);
  const [customCatalogData, setCustomCatalog] = useState<RawDataCatalogItem[]>([]);
  const [customDataCatalogTitle, setCustomDataCatalogTitle] = useState<string>("");

  const [data, setData] = useState<Data[]>();

  const processedCatalog = useMemo(() => {
    const c = handleDataCatalogProcessing(catalogData, data);
    return inEditor ? c : c.filter(c => !!c.public);
  }, [catalogData, inEditor, data]);

  const customProcessedCatalog = useMemo(() => {
    const c = handleDataCatalogProcessing(customCatalogData, data);
    return inEditor ? c : c.filter(c => !!c.public);
  }, [customCatalogData, inEditor, data]);

  useEffect(() => {
    const catalogBaseUrl = catalogURL || backendURL;
    if (catalogBaseUrl) {
      getDataCatalog(catalogBaseUrl, catalogProjectName, "plateau").then(res => {
        setCatalog(res);
      });
    }
  }, [backendURL, catalogProjectName, catalogURL]);

  useEffect(() => {
    const customCatalogBaseUrl = customCatalogURL || customBackendURL;
    if (customCatalogBaseUrl) {
      getDataCatalog(customCatalogBaseUrl, customCatalogProjectName, "custom").then(res => {
        setCustomCatalog(res);
      });
    }
  }, [customBackendURL, customCatalogProjectName, customCatalogURL]);

  useEffect(() => {
    if (!isCustomProject && !backendURL) return;
    handleDataFetch();
  }, [backendURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDataFetch = useCallback(async () => {
    let resData: Data[] = [];
    if (backendURL && backendProjectName) {
      const res = await fetch(`${backendURL}/sidebar/${backendProjectName}/data`);
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

    setData(resData);
  }, [isCustomProject, backendURL, backendProjectName, customBackendURL, customBackendProjectName]);

  const handleOpenDetails = useCallback(
    (data?: DataCatalogItem | DataCatalogGroup) => {
      if (data && "dataID" in data) {
        setSelectedDataset(data);
        setPage("details");
      }
    },
    [setSelectedDataset],
  );

  const handleFilter = useCallback(
    (filter: GroupBy) => {
      setFilter(filter);
      postMsg({ action: "saveFilter", payload: { filter, dataSource: "plateau" } });
      setExpandedFolders?.([]);
      postMsg({
        action: "saveExpandedFolders",
        payload: { expandedFolders: [], dataSource: "plateau" },
      });
    },
    [setExpandedFolders],
  );

  const handleCustomFilter = useCallback(
    (filter: GroupBy) => {
      setCustomFilter(filter);
      postMsg({ action: "saveFilter", payload: { filter, dataSource: "custom" } });
      setCustomExpandedFolders?.([]);
      postMsg({
        action: "saveExpandedFolders",
        payload: { expandedFolders: [], dataSource: "custom" },
      });
    },
    [setCustomExpandedFolders],
  );

  const addDisabled = useCallback(
    (dataID: string) => {
      return !!addedDatasetDataIDs?.find(dataID2 => dataID2 === dataID);
    },
    [addedDatasetDataIDs],
  );

  const handleBack = useCallback(() => {
    setPage("catalog");
    setSelectedDataset(undefined);
  }, [setPage, setSelectedDataset]);

  useEffect(() => {
    postMsg({ action: "extendPopup" });
  }, []);

  useEffect(() => {
    if (selectedDataset && page !== "details") {
      setPage("details");
    }
  }, [selectedDataset, page, setPage, setSelectedDataset]);

  useEffect(() => {
    postMsg({ action: "initDataCatalog" });
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "initDataCatalog") {
        if (e.data.payload.filter) setFilter(e.data.payload.filter);
        if (e.data.payload.searchTerm) setSearchTerm(e.data.payload.searchTerm);
        if (e.data.payload.expandedFolders) setExpandedFolders?.(e.data.payload.expandedFolders);
        if (e.data.payload.customFilter) setCustomFilter(e.data.payload.customFilter);
        if (e.data.payload.customExpandedFolders)
          setCustomExpandedFolders?.(e.data.payload.customExpandedFolders);
        if (e.data.payload.customDataCatalogTitle) {
          setCustomDataCatalogTitle(e.data.payload.customDataCatalogTitle);
        }
        changeTabs(
          e.data.payload.currentDatasetDataSource
            ? e.data.payload.currentDatasetDataSource
            : e.data.payload.customBackendURL &&
              e.data.payload.customBackendProjectName &&
              e.data.payload.customBackendAccessToken
            ? "custom"
            : "plateau",
        );
        if (e.data.payload.currentDatasetDataSource) {
          postMsg({ action: "clearCurrentDatasetDataSource" });
        }
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, [handleFilter, onSearch, setExpandedFolders, setSearchTerm, setCustomExpandedFolders]);

  return (
    <Wrapper>
      {page === "catalog" && (
        <>
          <TabsWrapper>
            {isCustomProject && (
              <Tab selected={currentTab === "custom"} onClick={() => changeTabs("custom")}>
                <TabName>{customDataCatalogTitle}</TabName>
              </Tab>
            )}
            <Tab
              selected={currentTab === "plateau"}
              onClick={() => changeTabs("plateau")}
              isPlateau={true}>
              <Logo icon="plateauLogoPart" selected={currentTab === "plateau"} />
              <TabName>PLATEAUデータセット</TabName>
            </Tab>
          </TabsWrapper>
          {currentTab === "custom" && (
            <DatasetTree
              addedDatasetDataIDs={customAddedDatasetDataIDs}
              selectedItem={selectedDataset}
              isMobile={isMobile}
              catalog={customProcessedCatalog}
              filter={customFilter}
              searchTerm={searchTerm}
              expandedFolders={customExpandedFolders}
              setExpandedFolders={setCustomExpandedFolders}
              addDisabled={addDisabled}
              onSearch={onSearch}
              onFilter={handleCustomFilter}
              onSelect={handleOpenDetails}
              onDatasetAdd={onDatasetAdd}
              dataSource="custom"
            />
          )}
          {currentTab === "plateau" && (
            <DatasetTree
              addedDatasetDataIDs={addedDatasetDataIDs}
              selectedItem={selectedDataset}
              isMobile={isMobile}
              catalog={processedCatalog}
              filter={filter}
              searchTerm={searchTerm}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
              addDisabled={addDisabled}
              onSearch={onSearch}
              onFilter={handleFilter}
              onSelect={handleOpenDetails}
              onDatasetAdd={onDatasetAdd}
              dataSource="plateau"
            />
          )}
        </>
      )}
      {page === "details" && (
        <>
          <PopupItem onBack={handleBack}>
            <Title>データ詳細</Title>
          </PopupItem>
          <DatasetDetails
            dataset={selectedDataset}
            isMobile={isMobile}
            addDisabled={addDisabled}
            onDatasetAdd={onDatasetAdd}
          />
        </>
      )}
    </Wrapper>
  );
};

export default Catalog;

const Wrapper = styled.div`
  border-top: 1px solid #d9d9d9;
`;

const Title = styled.p`
  margin: 0;
`;

const TabsWrapper = styled.div`
  display: flex;
  padding: 8px 10px 0 10px;
  gap: 10px;
  background-color: #f4f4f4;
  align-items: flex-end;
`;

const Tab = styled.div<{ selected?: boolean; isPlateau?: boolean }>`
  display: flex;
  gap: 8px;
  border-width: 1px 1px 0px 1px;
  border-style: solid;
  border-color: ${({ selected }) => (selected ? "#C8C8C8" : "#F4F4F4")};
  border-radius: 2px 2px 0px 0px;
  background: ${({ selected }) => (selected ? "#E7E7E7" : "#F4F4F4")};
  color: ${({ selected }) => (selected ? "var(--theme-color)" : "#898989")};
  padding: 8px 12px;
  cursor: pointer;

  ${({ isPlateau }) => (isPlateau ? "width: 206px; flex-shrink: 0" : "")}
`;

const TabName = styled.p`
  margin: 0;
  user-select: none;
`;

const Logo = styled(Icon)<{ selected?: boolean }>`
  opacity: ${({ selected }) => (selected ? 1 : 0.4)};
`;
