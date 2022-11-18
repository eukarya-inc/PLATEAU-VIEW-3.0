import { Catalog, Data, Group, FilterType } from "@web/extensions/sidebar/modals/datacatalog/types";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo, useState } from "react";

export type Props = {
  filter?: FilterType;
  catalog?: Catalog;
  onOpenDetails?: (data?: Data) => void;
};

const TreeBuilder: React.FC<{
  data: Data;
  selectedId?: string;
  nestLevel: number;
  onOpenDetails?: (data?: Data) => void;
  onSelect?: (id: string) => void;
}> = ({ data, selectedId, nestLevel, onOpenDetails, onSelect }) => {
  const [isOpen, open] = useState(data.type === "group" ? data.isOpen : undefined);
  const selected = useMemo(() => selectedId === data.id, [selectedId, data.id]);

  const handleOpenDetails = useCallback(() => {
    if (data.type === "group") return;
    onOpenDetails?.(data);

    onSelect?.(data.id);
  }, [data, onOpenDetails, onSelect]);

  return data.type === "group" ? (
    <Folder key={data.id} isOpen={isOpen}>
      <FolderItem nestLevel={nestLevel} onClick={() => open(!isOpen)}>
        <Icon icon={isOpen ? "folderOpen" : "folder"} size={20} />
        <Name>{data.name}</Name>
      </FolderItem>
      {data.members?.map(m =>
        TreeBuilder({ data: m, selectedId, nestLevel: nestLevel + 1, onOpenDetails, onSelect }),
      )}
    </Folder>
  ) : (
    <FolderItem key={data.id} nestLevel={nestLevel} selected={selected} onClick={handleOpenDetails}>
      <Icon icon={"file"} size={20} />
      <Name>{data.name}</Name>
    </FolderItem>
  );
};

const FileTree: React.FC<Props> = ({ filter, catalog, onOpenDetails }) => {
  const [selectedId, select] = useState<string>();
  const plateauDatasets = (catalog?.[0] as Group).members;

  const handleSelect = useCallback((id?: string) => {
    select(id);
  }, []);

  console.log(filter, "filter"); // DELETE ONCE FILTER IS IMPLEMENTED

  return (
    <Tree>
      {plateauDatasets?.map(dataset =>
        TreeBuilder({
          data: dataset,
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
