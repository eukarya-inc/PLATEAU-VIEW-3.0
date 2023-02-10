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

export type FilterType = "prefecture" | "fileType" | "tag";

const DatasetsPage: React.FC<Props> = ({ rawCatalog, addedDatasetIds, onDatasetAdd }) => {
  const [selectedDataset, setDataset] = useState<CatalogItem>();
  const [selectedTags, selectTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<FilterType>("prefecture");

  const handleOpenDetails = useCallback((data?: CatalogItem) => {
    setDataset(data);
  }, []);

  const handleFilter = useCallback((filter: FilterType) => {
    setFilter(filter);
  }, []);

  const handleTagSelect = useCallback(
    (tag: Tag) =>
      selectTags(tags => {
        const selected = tags.find(selectedTag => selectedTag.name === tag.name)
          ? [...tags.filter(t => t.name !== tag.name)]
          : [...tags, tag];
        selected.length > 0 ? handleFilter("tag") : handleFilter("prefecture");
        return selected;
      }),
    [handleFilter],
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
          addedDatasetIds={addedDatasetIds}
          selectedDataset={selectedDataset}
          rawCatalog={rawCatalog}
          selectedTags={selectedTags}
          filter={filter}
          onFilter={handleFilter}
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
