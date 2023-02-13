import PageLayout from "@web/extensions/sidebar/modals/datacatalog/components/content/PageLayout";
import { useCallback, useMemo, useState } from "react";

import { DataCatalogItem, GroupBy } from "../../../api/api";

import DatasetTree from "./DatasetTree";
import DatasetDetails, { Tag } from "./Details";

export type Props = {
  catalog?: DataCatalogItem[];
  addedDatasetIds?: string[];
  onDatasetAdd: (dataset: DataCatalogItem) => void;
};

const DatasetsPage: React.FC<Props> = ({ catalog, addedDatasetIds, onDatasetAdd }) => {
  const [selectedDataset, setDataset] = useState<DataCatalogItem>();
  const [selectedTags, selectTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<GroupBy>("city");

  const handleOpenDetails = useCallback((data?: DataCatalogItem) => {
    setDataset(data);
  }, []);

  const handleFilter = useCallback((filter: GroupBy) => {
    setFilter(filter);
  }, []);

  const handleTagSelect = useCallback(
    (tag: Tag) =>
      selectTags(tags => {
        const selected = tags.find(selectedTag => selectedTag.name === tag.name)
          ? [...tags.filter(t => t.name !== tag.name)]
          : [...tags, tag];
        selected.length > 0 ? handleFilter("tag") : handleFilter("city");
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
          catalog={catalog}
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
