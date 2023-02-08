import { CatalogItem, CatalogRawItem } from "@web/extensions/sidebar/core/processCatalog";
import PageLayout from "@web/extensions/sidebar/modals/datacatalog/components/content/PageLayout";
import { useCallback, useMemo, useState } from "react";

import DatasetTree from "./DatasetTree";
import DatasetDetails, { Tag } from "./Details";

export type Props = {
  rawCatalog?: CatalogRawItem[];
  addedDatasetIds?: string[];
  onDatasetAdd: (dataset: CatalogItem) => void;
};

const DatasetsPage: React.FC<Props> = ({ rawCatalog, addedDatasetIds, onDatasetAdd }) => {
  const [selectedDataset, setDataset] = useState<CatalogItem>();
  const [selectedTags, selectTags] = useState<Tag[]>([]);

  const handleOpenDetails = useCallback((data?: CatalogItem) => {
    setDataset(data);
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
    <PageLayout
      left={
        <DatasetTree
          rawCatalog={rawCatalog}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onOpenDetails={handleOpenDetails}
          onDatasetAdd={onDatasetAdd}
        />
      }
      right={
        <DatasetDetails
          dataset={selectedDataset}
          addDisabled={addDisabled}
          onTagSelect={handleTagSelect}
          onDatasetAdd={onDatasetAdd}
        />
      }
    />
  );
};

export default DatasetsPage;
