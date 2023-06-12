import { postMsg } from "@web/extensions/sidebar/utils";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";

import { DataCatalogItem, GroupBy, DataCatalogGroup } from "../api/api";

export type Tab = "plateau" | "your-data" | "custom";

export default () => {
  const [currentTab, changeTabs] = useState<Tab>();
  const [inEditor, setEditorState] = useState(false);
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customDataCatalogTitle, setCustomDataCatalogTitle] = useState<string>("");

  const [expandedFolders, setExpandedFolders] = useState<{ id?: string; name?: string }[]>([]);
  const [customExpandedFolders, setCustomExpandedFolders] = useState<
    { id?: string; name?: string }[]
  >([]);

  const [filter, setFilter] = useState<GroupBy>("city");
  const [customFilter, setCustomFilter] = useState<GroupBy>("city");

  const [selectedItem, selectItem] = useState<DataCatalogItem | DataCatalogGroup>();
  const [customSelectedItem, selectCustomItem] = useState<DataCatalogItem | DataCatalogGroup>();

  const handleSelect = useCallback((item?: DataCatalogItem | DataCatalogGroup) => {
    selectItem(item);
  }, []);

  const handleCustomSelect = useCallback((item?: DataCatalogItem | DataCatalogGroup) => {
    selectCustomItem(item);
  }, []);

  const handleFilter = useCallback((filter: GroupBy) => {
    setFilter(filter);
    postMsg({ action: "saveFilter", payload: { dataSource: "plateau", filter } });
    setExpandedFolders([]);
    postMsg({
      action: "saveExpandedFolders",
      payload: { dataSource: "plateau", expandedFolders: [] },
    });
  }, []);

  const handleCustomFilter = useCallback((filter: GroupBy) => {
    setCustomFilter(filter);
    postMsg({ action: "saveFilter", payload: { dataSource: "custom", filter } });
    setExpandedFolders([]);
    postMsg({
      action: "saveExpandedFolders",
      payload: { dataSource: "custom", expandedFolders: [] },
    });
  }, []);

  const debouncedSearchRef = useRef(
    debounce((value: string) => {
      postMsg({ action: "saveSearchTerm", payload: { searchTerm: value } });
      setExpandedFolders([]);
      postMsg({ action: "saveExpandedFolders", payload: { expandedFolders: [] } });
    }, 300),
  );

  const handleSearch = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(value);
      debouncedSearchRef.current(value);
    },
    [debouncedSearchRef],
  );

  const handleClose = useCallback(() => {
    postMsg({ action: "modalClose" });
  }, []);

  useEffect(() => {
    postMsg({ action: "initDataCatalog" }); // Needed to trigger sending selected dataset ids from Sidebar
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "initDataCatalog") {
        setEditorState(e.data.payload.inEditor);
        if (e.data.payload.searchTerm) setSearchTerm(e.data.payload.searchTerm);
        if (e.data.payload.expandedFolders) setExpandedFolders(e.data.payload.expandedFolders);
        if (e.data.payload.customExpandedFolders)
          setCustomExpandedFolders(e.data.payload.customExpandedFolders);
        if (e.data.payload.filter) setFilter(e.data.payload.filter);
        if (e.data.payload.customFilter) setFilter(e.data.payload.customFilter);
        if (e.data.payload.customDataCatalogTitle) {
          setCustomDataCatalogTitle(e.data.payload.customDataCatalogTitle);
        }
        if (e.data.payload.dataset) {
          const item = e.data.payload.dataset;
          if (item.dataSource === "custom") {
            handleCustomSelect(item);
            if (item.path) {
              setCustomExpandedFolders(
                item.path
                  .map((item: string) => ({ name: item }))
                  .filter((folder: { name?: string }) => folder.name !== item.name),
              );
            }
          } else {
            handleSelect(item);
            if (item.path) {
              setExpandedFolders(
                item.path
                  .map((item: string) => ({ name: item }))
                  .filter((folder: { name?: string }) => folder.name !== item.name),
              );
            }
          }

          postMsg({
            action: "saveDataset",
            payload: { dataset: undefined },
          });
        }

        const isCustomProject =
          e.data.payload.customBackendURL &&
          e.data.payload.customBackendProjectName &&
          e.data.payload.customBackendAccessToken;
        changeTabs(
          e.data.payload.currentDatasetDataSource
            ? e.data.payload.currentDatasetDataSource
            : isCustomProject
            ? "custom"
            : "plateau",
        );
        setIsCustomProject(isCustomProject);
        if (e.data.payload.currentDatasetDataSource) {
          postMsg({ action: "clearCurrentDatasetDataSource" });
        }
      }
    };
    addEventListener("message", eventListenerCallback);
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, [handleSelect, handleCustomSelect]);

  const handleTabChange = useCallback((tab: Tab) => {
    changeTabs(tab);
    setSearchTerm("");
    postMsg({ action: "saveSearchTerm", payload: { searchTerm: "" } });
  }, []);

  return {
    currentTab,
    inEditor,
    isCustomProject,
    expandedFolders,
    customExpandedFolders,
    searchTerm,
    selectedItem,
    customSelectedItem,
    filter,
    customFilter,
    customDataCatalogTitle,
    handleFilter,
    handleCustomFilter,
    handleSelect,
    handleCustomSelect,
    handleSearch,
    handleClose,
    handleTabChange: handleTabChange,
    setExpandedFolders,
    setCustomExpandedFolders,
  };
};
