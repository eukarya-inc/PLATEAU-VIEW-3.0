import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useState, useEffect, useCallback } from "react";

import { DataCatalogGroup, DataCatalogItem } from "../../../../api/api";

export type Props = {
  name: string;
  isMobile?: boolean;
  expandAll?: boolean;
  nestLevel: number;
  item: DataCatalogGroup | DataCatalogItem | (DataCatalogItem | DataCatalogGroup)[];
  selectedID?: string;
  children?: React.ReactNode;
};

const Folder: React.FC<Props> = ({
  name,
  isMobile,
  expandAll,
  nestLevel,
  item,
  selectedID,
  children,
}) => {
  const [isOpen, open] = useState(false);

  // TODO: should improve performance later
  const isChildSelected = useCallback(
    (
      item: DataCatalogGroup | DataCatalogItem | (DataCatalogItem | DataCatalogGroup)[],
    ): boolean => {
      if (!("children" in item)) return "dataID" in item && item.dataID === selectedID;
      return item.children.some(child => isChildSelected(child));
    },
    [selectedID],
  );

  useEffect(() => {
    open(() => expandAll || (!!selectedID && isChildSelected(item)));
  }, [expandAll, isChildSelected, item, selectedID]);

  return (
    <Wrapper key={name} isOpen={isOpen}>
      <FolderItem nestLevel={nestLevel} onClick={() => open(!isOpen)}>
        <NameWrapper isMobile={isMobile}>
          <Icon icon={isOpen ? "folderOpen" : "folder"} size={20} />
          <Name>{name}</Name>
        </NameWrapper>
      </FolderItem>
      {children}
    </Wrapper>
  );
};

export default Folder;

const Wrapper = styled.div<{ isOpen?: boolean }>`
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
  height: 29px;

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

const NameWrapper = styled.div<{ isMobile?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const Name = styled.p`
  margin: 0;
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
