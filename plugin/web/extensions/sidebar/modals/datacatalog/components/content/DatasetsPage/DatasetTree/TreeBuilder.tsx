import { DataCatalogGroup, DataCatalogItem } from "../../../../api/api";

import File from "./File";
import Folder from "./Folder";

type Props = {
  catalogItem: DataCatalogGroup | DataCatalogItem | (DataCatalogItem | DataCatalogGroup)[];
  isMobile?: boolean;
  expandAll?: boolean;
  addedDatasetIds?: string[];
  selectedId?: string;
  nestLevel: number;
  onDatasetAdd: (dataset: DataCatalogItem) => void;
  onOpenDetails?: (item?: DataCatalogItem) => void;
  onSelect?: (id: string) => void;
};

const TreeBuilder: React.FC<Props> = ({
  catalogItem,
  isMobile,
  expandAll,
  addedDatasetIds,
  selectedId,
  nestLevel,
  onDatasetAdd,
  onOpenDetails,
  onSelect,
}) => {
  return (
    <>
      {Array.isArray(catalogItem) ? (
        catalogItem.map(item =>
          "children" in item ? (
            <Folder
              key={item.name}
              name={item.name}
              nestLevel={nestLevel + 1}
              isMobile={isMobile}
              expandAll={expandAll}>
              <TreeBuilder
                catalogItem={item.children}
                addedDatasetIds={addedDatasetIds}
                selectedId={selectedId}
                nestLevel={nestLevel + 1}
                onDatasetAdd={onDatasetAdd}
                onOpenDetails={onOpenDetails}
                onSelect={onSelect}
              />
            </Folder>
          ) : (
            <TreeBuilder
              catalogItem={item}
              addedDatasetIds={addedDatasetIds}
              selectedId={selectedId}
              nestLevel={nestLevel + 1}
              onDatasetAdd={onDatasetAdd}
              onOpenDetails={onOpenDetails}
              onSelect={onSelect}
            />
          ),
        )
      ) : "children" in catalogItem ? (
        <Folder
          key={catalogItem.name}
          name={catalogItem.name}
          nestLevel={nestLevel + 1}
          isMobile={isMobile}
          expandAll={expandAll}>
          <TreeBuilder
            catalogItem={catalogItem.children}
            addedDatasetIds={addedDatasetIds}
            selectedId={selectedId}
            nestLevel={nestLevel + 1}
            onDatasetAdd={onDatasetAdd}
            onOpenDetails={onOpenDetails}
            onSelect={onSelect}
          />
        </Folder>
      ) : (
        <File
          item={catalogItem}
          addedDatasetIds={addedDatasetIds}
          isMobile={isMobile}
          nestLevel={nestLevel + 1}
          selectedID={selectedId}
          onDatasetAdd={onDatasetAdd}
          onOpenDetails={onOpenDetails}
          onSelect={onSelect}
        />
      )}
    </>
  );
};

export default TreeBuilder;
