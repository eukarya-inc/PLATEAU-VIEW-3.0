import { DataCatalogItem, GroupBy } from "@web/extensions/sidebar/modals/datacatalog/api/api";
import DatasetTree from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/DatasetTree";
import DatasetDetails from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/Details";
import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useEffect, useState } from "react";

import PopupItem from "../sharedComponents/PopupItem";

type Props = {
  addedDatasetDataIDs?: string[];
  isMobile?: boolean;
  searchTerm: string;
  expandedFolders?: {
    id?: string | undefined;
    name?: string | undefined;
  }[];
  catalog?: DataCatalogItem[];
  selectedDataset?: DataCatalogItem;
  setSelectedDataset: React.Dispatch<React.SetStateAction<DataCatalogItem | undefined>>;
  setExpandedFolders?: React.Dispatch<
    React.SetStateAction<
      {
        id?: string | undefined;
        name?: string | undefined;
      }[]
    >
  >;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDatasetAdd: (dataset: DataCatalogItem | UserDataItem, keepModalOpen?: boolean) => void;
};

const Catalog: React.FC<Props> = ({
  addedDatasetDataIDs,
  isMobile,
  searchTerm,
  expandedFolders,
  catalog,
  selectedDataset,
  setSelectedDataset,
  setExpandedFolders,
  onSearch,
  onDatasetAdd,
}) => {
  const [filter, setFilter] = useState<GroupBy>("city");
  const [page, setPage] = useState<"catalog" | "details">("catalog");

  const handleOpenDetails = useCallback(
    (data?: DataCatalogItem) => {
      setSelectedDataset(data);
      setPage("details");
    },
    [setSelectedDataset],
  );

  const handleFilter = useCallback((filter: GroupBy) => {
    setFilter(filter);
  }, []);

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

  return (
    <Wrapper>
      {page === "catalog" && (
        <>
          <PopupItem>
            <Title>データカタログ</Title>
          </PopupItem>
          <DatasetTree
            addedDatasetDataIDs={addedDatasetDataIDs}
            selectedItem={selectedDataset}
            isMobile={isMobile}
            catalog={catalog}
            filter={filter}
            searchTerm={searchTerm}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
            addDisabled={addDisabled}
            onSearch={onSearch}
            onFilter={handleFilter}
            onOpenDetails={handleOpenDetails}
            onDatasetAdd={onDatasetAdd}
          />
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
