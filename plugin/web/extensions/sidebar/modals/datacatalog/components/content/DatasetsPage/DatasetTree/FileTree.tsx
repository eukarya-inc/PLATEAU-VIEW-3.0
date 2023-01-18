import {
  CatalogItem,
  DataCatalog as DataCatalogType,
} from "@web/extensions/sidebar/core/processCatalog";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo, useState } from "react";

export type DataCatalog = DataCatalogType;

export type Props = {
  catalog: DataCatalog;
  onOpenDetails?: (data?: CatalogItem) => void;
};

const TreeBuilder: React.FC<{
  item: CatalogItem;
  selectedId?: string;
  nestLevel: number;
  onOpenDetails?: (item?: CatalogItem) => void;
  onSelect?: (id: string) => void;
}> = ({ item, selectedId, nestLevel, onOpenDetails, onSelect }) => {
  const [isOpen, open] = useState(false);

  const selected = useMemo(
    () => (item.type !== "group" ? selectedId === item.id : false),
    [selectedId, item],
  );

  const handleOpenDetails = useCallback(() => {
    if (item.type === "group") return;
    onOpenDetails?.(item);
    onSelect?.(item.id);
  }, [item, onOpenDetails, onSelect]);

  return item.type === "group" ? (
    <Folder key={item.name} isOpen={isOpen}>
      <FolderItem nestLevel={nestLevel} onClick={() => open(!isOpen)}>
        <Icon icon={isOpen ? "folderOpen" : "folder"} size={20} />
        <Name>{item.name}</Name>
      </FolderItem>
      {item.children.map(m =>
        TreeBuilder({ item: m, selectedId, nestLevel: nestLevel + 1, onOpenDetails, onSelect }),
      )}
    </Folder>
  ) : (
    <FolderItem key={item.id} nestLevel={nestLevel} selected={selected} onClick={handleOpenDetails}>
      <Icon icon={"file"} size={20} />
      <Name>{item.cityName ?? item.name}</Name>
    </FolderItem>
  );
};

const FileTree: React.FC<Props> = ({ catalog, onOpenDetails }) => {
  const [selectedId, select] = useState<string>();

  const handleSelect = useCallback((id?: string) => {
    select(id);
  }, []);

  return (
    <Tree>
      {catalog.map(item =>
        TreeBuilder({
          item,
          selectedId,
          nestLevel: 1,
          onOpenDetails,
          onSelect: handleSelect,
        }),
      )}
    </Tree>
  );
};

export default FileTree;

const Tree = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 298px;
`;

const Folder = styled.div<{ isOpen?: boolean }>`
  width: 100%;
  ${({ isOpen }) =>
    isOpen
      ? "height: 100%;"
      : `
  height: 29px; 
  overflow: hidden;
  `}
`;

const FolderItem = styled.div<{ nestLevel: number; selected?: boolean }>`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  gap: 8px;
  min-height: 29px;
  ${({ selected }) =>
    selected &&
    `
  background: #00BEBE;
  color: white;
  `}

  padding-left: ${({ nestLevel }) => (nestLevel ? `${nestLevel * 8}px` : "8px")};
  padding-right: 8px;
  cursor: pointer;

  :hover {
    background: #00bebe;
    color: white;
  }
`;

const Name = styled.p`
  margin: 0;
  user-select: none;
`;
