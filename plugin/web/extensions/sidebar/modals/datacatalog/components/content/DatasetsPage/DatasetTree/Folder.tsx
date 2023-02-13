import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useState, useEffect } from "react";

export type Props = {
  name: string;
  isMobile?: boolean;
  expandAll?: boolean;
  nestLevel: number;
  children?: React.ReactNode;
};

const Folder: React.FC<Props> = ({ name, isMobile, expandAll, nestLevel, children }) => {
  const [isOpen, open] = useState(false);

  useEffect(() => {
    expandAll ? open(true) : open(false);
  }, [expandAll]);

  return (
    <Wrapper key={name} isOpen={isOpen}>
      <FolderItem nestLevel={nestLevel} onClick={() => open(!isOpen)}>
        <NameWrapper>
          <Icon icon={isOpen ? "folderOpen" : "folder"} size={20} />
          <Name isMobile={isMobile}>{name}</Name>
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

const Name = styled.p<{ isMobile?: boolean }>`
  margin: 0 0 0 8px;
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: ${({ isMobile }) => (isMobile ? "calc(100vw - 150px)" : "175px")};
`;
