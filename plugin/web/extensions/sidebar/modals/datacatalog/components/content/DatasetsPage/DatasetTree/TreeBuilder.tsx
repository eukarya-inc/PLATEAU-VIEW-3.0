import { DataCatalogGroup, DataCatalogItem } from "../../../../api/api";

import File from "./File";
import Folder from "./Folder";

type Props = {
  catalogItem: DataCatalogGroup | DataCatalogItem | (DataCatalogItem | DataCatalogGroup)[];
  isMobile?: boolean;
  expandAll?: boolean;
  addedDatasetDataIDs?: string[];
  selectedID?: string;
  nestLevel: number;
  addDisabled: (dataID: string) => boolean;
  onDatasetAdd: (dataset: DataCatalogItem) => void;
  onOpenDetails?: (item?: DataCatalogItem) => void;
  onSelect?: (dataID: string) => void;
};

const TreeBuilder: React.FC<Props> = ({
  catalogItem,
  isMobile,
  expandAll,
  addedDatasetDataIDs,
  selectedID,
  nestLevel,
  addDisabled,
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
              expandAll={expandAll}
              item={item}
              selectedID={selectedID}>
              <TreeBuilder
                catalogItem={item.children}
                addedDatasetDataIDs={addedDatasetDataIDs}
                selectedID={selectedID}
                nestLevel={nestLevel + 1}
                addDisabled={addDisabled}
                onDatasetAdd={onDatasetAdd}
                onOpenDetails={onOpenDetails}
                onSelect={onSelect}
              />
            </Folder>
          ) : (
            <TreeBuilder
              catalogItem={item}
              addedDatasetDataIDs={addedDatasetDataIDs}
              selectedID={selectedID}
              nestLevel={nestLevel + 1}
              addDisabled={addDisabled}
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
          expandAll={expandAll}
          item={catalogItem}
          selectedID={selectedID}>
          <TreeBuilder
            catalogItem={catalogItem.children}
            addedDatasetDataIDs={addedDatasetDataIDs}
            selectedID={selectedID}
            nestLevel={nestLevel + 1}
            addDisabled={addDisabled}
            onDatasetAdd={onDatasetAdd}
            onOpenDetails={onOpenDetails}
            onSelect={onSelect}
          />
        </Folder>
      ) : (
        <File
          item={catalogItem}
          isMobile={isMobile}
          nestLevel={nestLevel}
          selectedID={selectedID}
          addDisabled={addDisabled}
          onDatasetAdd={onDatasetAdd}
          onOpenDetails={onOpenDetails}
          onSelect={onSelect}
        />
      )}
    </>
  );
};

export default TreeBuilder;
