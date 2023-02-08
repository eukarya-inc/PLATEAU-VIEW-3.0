import { CatalogItem, CatalogRawItem } from "@web/extensions/sidebar/core/processCatalog";
import DatasetTree, {
  Tag,
} from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/DatasetTree";
import DatasetDetails from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage/Details";
import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import PopupItem from "../sharedComponents/PopupItem";

type Props = {
  addedDatasetIds?: string[];
  isMobile?: boolean;
  rawCatalog?: CatalogRawItem[];
  onDatasetAdd: (dataset: CatalogItem) => void;
};

const Catalog: React.FC<Props> = ({ addedDatasetIds, isMobile, rawCatalog, onDatasetAdd }) => {
  useEffect(() => {
    postMsg({ action: "extendPopup" });
  }, []);

  const [selectedDataset, setDataset] = useState<CatalogItem>();
  const [selectedTags, selectTags] = useState<Tag[]>([]);
  const [page, setPage] = useState<"catalog" | "details">("catalog");

  const handleOpenDetails = useCallback((data?: CatalogItem) => {
    setDataset(data);
    setPage("details");
  }, []);

  const handleTagSelect = useCallback(
    (tag: Tag) =>
      selectTags(tags => (tags.includes(tag) ? [...tags.filter(t => t !== tag)] : [...tags, tag])),
    [],
  );

  const addDisabled = useMemo(() => {
    return !!addedDatasetIds?.find(
      id => selectedDataset?.type === "item" && id === selectedDataset.id,
    );
  }, [addedDatasetIds, selectedDataset]);

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
            rawCatalog={rawCatalog}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
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
            onTagSelect={handleTagSelect}
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
