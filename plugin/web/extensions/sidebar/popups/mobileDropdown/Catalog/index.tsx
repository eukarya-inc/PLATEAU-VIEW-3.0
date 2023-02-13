import { DataCatalogItem, GroupBy } from "@web/extensions/sidebar/modals/datacatalog/api/api";
import DatasetTree from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/DatasetTree";
import DatasetDetails from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/Details";
import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import PopupItem from "../sharedComponents/PopupItem";

type Props = {
  addedDatasetIds?: string[];
  isMobile?: boolean;
  catalogData?: DataCatalogItem[];
  onDatasetAdd: (dataset: DataCatalogItem) => void;
};

const Catalog: React.FC<Props> = ({ addedDatasetIds, isMobile, catalogData, onDatasetAdd }) => {
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

  const addDisabled = useMemo(() => {
    return !!addedDatasetIds?.find(
      id => selectedDataset?.type === "item" && id === selectedDataset.id,
    );
  }, [addedDatasetIds, selectedDataset]);

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
            addedDatasetIds={addedDatasetIds}
            selectedDataset={selectedDataset}
            isMobile={isMobile}
            catalog={catalogData}
            filter={filter}
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
