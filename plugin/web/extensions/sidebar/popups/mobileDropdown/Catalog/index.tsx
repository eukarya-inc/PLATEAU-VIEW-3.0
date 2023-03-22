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
  catalogData?: DataCatalogItem[];
  searchTerm: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDatasetAdd: (dataset: DataCatalogItem | UserDataItem, keepModalOpen?: boolean) => void;
};

const Catalog: React.FC<Props> = ({
  addedDatasetDataIDs,
  isMobile,
  catalogData,
  searchTerm,
  onSearch,
  onDatasetAdd,
}) => {
  const [selectedDataset, setDataset] = useState<DataCatalogItem>();
  const [filter, setFilter] = useState<GroupBy>("city");
  const [page, setPage] = useState<"catalog" | "details">("catalog");

  const handleOpenDetails = useCallback((data?: DataCatalogItem) => {
    setDataset(data);
    setPage("details");
  }, []);

  const handleFilter = useCallback((filter: GroupBy) => {
    setFilter(filter);
  }, []);

  const addDisabled = useCallback(
    (dataID: string) => {
      return !!addedDatasetDataIDs?.find(dataID2 => dataID2 === dataID);
    },
    [addedDatasetDataIDs],
  );

  useEffect(() => {
    postMsg({ action: "extendPopup" });
  }, []);

  return (
    <Wrapper>
      {page === "catalog" && (
        <>
          <PopupItem>
            <Title>データカタログ</Title>
          </PopupItem>
          <DatasetTree
            addedDatasetDataIDs={addedDatasetDataIDs}
            selectedDataset={selectedDataset}
            isMobile={isMobile}
            catalog={catalogData}
            filter={filter}
            addDisabled={addDisabled}
            searchTerm={searchTerm}
            onSearch={onSearch}
            onFilter={handleFilter}
            onOpenDetails={handleOpenDetails}
            onDatasetAdd={onDatasetAdd}
          />
        </>
      )}
      {page === "details" && (
        <>
          <PopupItem onBack={() => setPage("catalog")}>
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
