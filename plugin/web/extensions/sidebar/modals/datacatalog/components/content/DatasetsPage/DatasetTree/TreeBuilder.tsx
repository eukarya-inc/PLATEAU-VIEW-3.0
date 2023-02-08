import { CatalogItem } from "@web/extensions/sidebar/core/processCatalog";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useMemo, useState } from "react";

import File from "./File";

type Props = {
  item: CatalogItem;
  addedDatasetIds?: string[];
  selectedId?: string;
  nestLevel: number;
  onDatasetAdd: (dataset: CatalogItem) => void;
  onOpenDetails?: (item?: CatalogItem) => void;
  onSelect?: (id: string) => void;
};

const TreeBuilder: React.FC<Props> = ({
  item,
  addedDatasetIds,
  selectedId,
  nestLevel,
  onDatasetAdd,
  onOpenDetails,
  onSelect,
}) => {
  const [isOpen, open] = useState(false);

  const selected = useMemo(
    () => (item.type !== "group" ? selectedId === item.id : false),
    [selectedId, item],
  );

  return item.type === "group" ? (
    <Folder key={item.name} isOpen={isOpen}>
      <FolderItem nestLevel={nestLevel} onClick={() => open(!isOpen)}>
        <NameWrapper>
          <Icon icon={isOpen ? "folderOpen" : "folder"} size={20} />
          <Name>{item.name}</Name>
        </NameWrapper>
      </FolderItem>
      {item.children.map(m =>
        TreeBuilder({
          item: m,
          addedDatasetIds,
          selectedId,
          nestLevel: nestLevel + 1,
          onDatasetAdd,
          onOpenDetails,
          onSelect,
        }),
      )}
    </Folder>
  ) : (
    <File
      key={item.name}
      item={item}
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
  justify-content: space-between;
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

const NameWrapper = styled.div`
  display: flex;
`;

const Name = styled.p`
  margin: 0 0 0 8px;
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 200px;
`;
