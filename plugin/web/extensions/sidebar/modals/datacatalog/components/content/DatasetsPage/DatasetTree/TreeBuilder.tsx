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
  expandedFolders: { id?: string; name?: string }[];
  addDisabled: (dataID: string) => boolean;
  onDatasetAdd: (dataset: DataCatalogItem, keepModalOpen?: boolean) => void;
  onOpenDetails?: (item?: DataCatalogItem) => void;
  onSelect?: (dataID: string) => void;
  setExpandedFolders: React.Dispatch<React.SetStateAction<{ id?: string; name?: string }[]>>;
};

const TreeBuilder: React.FC<Props> = ({
  catalogItem,
  isMobile,
  expandAll,
  addedDatasetDataIDs,
  selectedID,
  nestLevel,
  expandedFolders,
  addDisabled,
  onDatasetAdd,
  onOpenDetails,
  onSelect,
  setExpandedFolders,
}) => {
  return (
    <>
      {Array.isArray(catalogItem) ? (
        catalogItem.map(item =>
          "children" in item ? (
            <Folder
              key={item.id}
              id={item.id}
              name={item.name}
              nestLevel={nestLevel + 1}
              expandedFolders={expandedFolders}
              isMobile={isMobile}
              expandAll={expandAll}
              setExpandedFolders={setExpandedFolders}>
              <TreeBuilder
                catalogItem={item.children}
                addedDatasetDataIDs={addedDatasetDataIDs}
                selectedID={selectedID}
                nestLevel={nestLevel + 1}
                expandedFolders={expandedFolders}
                addDisabled={addDisabled}
                onDatasetAdd={onDatasetAdd}
                onOpenDetails={onOpenDetails}
                onSelect={onSelect}
                setExpandedFolders={setExpandedFolders}
              />
            </Folder>
          ) : (
            <TreeBuilder
              catalogItem={item}
              addedDatasetDataIDs={addedDatasetDataIDs}
              selectedID={selectedID}
              nestLevel={nestLevel + 1}
              expandedFolders={expandedFolders}
              addDisabled={addDisabled}
              onDatasetAdd={onDatasetAdd}
              onOpenDetails={onOpenDetails}
              onSelect={onSelect}
              setExpandedFolders={setExpandedFolders}
            />
          ),
        )
      ) : "children" in catalogItem ? (
        <Folder
          key={catalogItem.id}
          id={catalogItem.id}
          name={catalogItem.name}
          nestLevel={nestLevel + 1}
          expandedFolders={expandedFolders}
          isMobile={isMobile}
          expandAll={expandAll}
          setExpandedFolders={setExpandedFolders}>
          <TreeBuilder
            catalogItem={catalogItem.children}
            addedDatasetDataIDs={addedDatasetDataIDs}
            selectedID={selectedID}
            nestLevel={nestLevel + 1}
            expandedFolders={expandedFolders}
            addDisabled={addDisabled}
            onDatasetAdd={onDatasetAdd}
            onOpenDetails={onOpenDetails}
            onSelect={onSelect}
            setExpandedFolders={setExpandedFolders}
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
          setExpandedFolders={setExpandedFolders}
        />
      )}
    </>
  );
};

export default TreeBuilder;
