import { CatalogItem } from "@web/extensions/sidebar/core/processCatalog";
import { useMemo } from "react";

import File from "./File";
import Folder from "./Folder";

type Props = {
  item: CatalogItem;
  isMobile?: boolean;
  expandAll?: boolean;
  addedDatasetIds?: string[];
  selectedId?: string;
  nestLevel: number;
  onDatasetAdd: (dataset: CatalogItem) => void;
  onOpenDetails?: (item?: CatalogItem) => void;
  onSelect?: (id: string) => void;
};

const TreeBuilder: React.FC<Props> = ({
  item,
  isMobile,
  expandAll,
  addedDatasetIds,
  selectedId,
  nestLevel,
  onDatasetAdd,
  onOpenDetails,
  onSelect,
}) => {
  const selected = useMemo(
    () => (item.type !== "group" ? selectedId === item.id : false),
    [selectedId, item],
  );

  return item.type === "group" ? (
    <Folder
      item={item}
      isMobile={isMobile}
      expandAll={expandAll}
      addedDatasetIds={addedDatasetIds}
      selectedId={selectedId}
      nestLevel={nestLevel + 1}
      onDatasetAdd={onDatasetAdd}
      onOpenDetails={onOpenDetails}
      onSelect={onSelect}
    />
  ) : (
    <File
      key={item.name}
      item={item}
      isMobile={isMobile}
      addedDatasetIds={addedDatasetIds}
      nestLevel={nestLevel}
      selected={selected}
      onDatasetAdd={onDatasetAdd}
      onOpenDetails={onOpenDetails}
      onSelect={onSelect}
    />
  );
};

export default TreeBuilder;
