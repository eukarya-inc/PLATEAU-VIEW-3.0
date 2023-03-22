import { postMsg } from "@web/extensions/sidebar/utils";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useState, useEffect, useCallback } from "react";

export type Props = {
  id: string;
  name: string;
  isMobile?: boolean;
  expandAll?: boolean;
  nestLevel: number;
  expandedFolders?: { id?: string; name?: string }[];
  setExpandedFolders?: React.Dispatch<React.SetStateAction<{ id?: string; name?: string }[]>>;
  children?: React.ReactNode;
};

const Folder: React.FC<Props> = ({
  id,
  name,
  isMobile,
  expandAll,
  nestLevel,
  expandedFolders,
  setExpandedFolders,
  children,
}) => {
  const [isOpen, open] = useState(false);

  useEffect(() => {
    if (expandAll || expandedFolders?.find(item => (item.id ? item.id === id : item.name === name)))
      open(true);
  }, [expandAll, expandedFolders, id, name]);

  const handleExpand = useCallback(
    (folder: { id?: string; name?: string }) => {
      setExpandedFolders?.((prevState: { id?: string; name?: string }[]) => {
        const newExpandedFolders = [...prevState];
        if (prevState.find(folder => (folder.id ? folder.id === id : folder.name === name))) {
          const index = prevState.findIndex(folder =>
            folder.id ? folder.id === id : folder.name === name,
          );
          newExpandedFolders.splice(index, 1);
          open(false);
        } else {
          newExpandedFolders.push(folder);
          open(true);
        }
        postMsg({
          action: "saveExpandedFolders",
          payload: { expandedFolders: newExpandedFolders },
        });
        return newExpandedFolders;
      });
    },
    [id, name, setExpandedFolders],
  );

  return (
    <Wrapper key={id} isOpen={isOpen}>
      <FolderItem nestLevel={nestLevel} onClick={() => handleExpand({ id, name })}>
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
