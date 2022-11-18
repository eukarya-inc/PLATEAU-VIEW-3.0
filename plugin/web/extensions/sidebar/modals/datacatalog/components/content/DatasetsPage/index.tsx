import PageLayout from "@web/extensions/sidebar/modals/datacatalog/components/content/PageLayout";
import { Data } from "@web/extensions/sidebar/modals/datacatalog/types";
import { useCallback, useState } from "react";

import DatasetTree from "./DatasetTree";
import { TEST_CATALOG_DATA } from "./DatasetTree/TEST_catalog_data";
import DatasetDetails, { Tag } from "./Details";

export type Props = {
  addedDatasetIds?: string[];
  onDatasetAdd: (dataset: Data) => void;
};

const DatasetsPage: React.FC<Props> = ({ addedDatasetIds, onDatasetAdd }) => {
  const catalog = TEST_CATALOG_DATA;
  const [selectedDataset, setDataset] = useState<Data>();
  const [selectedTags, selectTags] = useState<Tag[]>([]);

  const handleOpenDetails = useCallback((data?: Data) => {
    setDataset(data);
  }, []);

  const handleTagSelect = useCallback(
    (tag: Tag) =>
      selectTags(tags => (tags.includes(tag) ? [...tags.filter(t => t !== tag)] : [...tags, tag])),
    [],
  );

  return (
    <PageLayout
      left={
        <DatasetTree
          catalog={catalog}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onOpenDetails={handleOpenDetails}
        />
      }
      right={
        <DatasetDetails
          dataset={selectedDataset}
          addDisabled={!!addedDatasetIds?.find(id => id === selectedDataset?.id)}
          onTagSelect={handleTagSelect}
          onDatasetAdd={onDatasetAdd}
        />
      }
    />
  );
};

export default DatasetsPage;
