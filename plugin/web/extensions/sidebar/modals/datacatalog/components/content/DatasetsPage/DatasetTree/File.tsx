import { Button, Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo } from "react";

import { DataCatalogItem } from "../../../../api/api";

export type Props = {
  item: DataCatalogItem;
  isMobile?: boolean;
  addedDatasetIds?: string[];
  nestLevel: number;
  selectedID?: string;
  onDatasetAdd: (dataset: DataCatalogItem) => void;
  onOpenDetails?: (item?: DataCatalogItem) => void;
  onSelect?: (id: string) => void;
};

const File: React.FC<Props> = ({
  item,
  isMobile,
  addedDatasetIds,
  nestLevel,
  selectedID,
  onDatasetAdd,
  onOpenDetails,
  onSelect,
}) => {
  const handleClick = useCallback(() => {
    onDatasetAdd(item);
  }, [item, onDatasetAdd]);

  const handleOpenDetails = useCallback(() => {
    if (!item.id) return;
    onOpenDetails?.(item);
    onSelect?.(item.id);
  }, [item, onOpenDetails, onSelect]);

  const addDisabled = useMemo(
    () => !!addedDatasetIds?.find(id => item?.type === "item" && id === item.id),
    [addedDatasetIds, item],
  );

  const selected = useMemo(
    () => (item.type !== "group" ? selectedID === item.id : false),
    [selectedID, item],
  );

  return (
    <Wrapper nestLevel={nestLevel} selected={selected}>
      <NameWrapper onClick={handleOpenDetails}>
        <Icon icon="file" size={20} />
        <Name isMobile={isMobile}>{item.name}</Name>
      </NameWrapper>
      <StyledButton
        type="link"
        icon={<StyledIcon icon="plusCircle" selected={selected ?? false} />}
        onClick={handleClick}
        disabled={addDisabled}
      />
    </Wrapper>
  );
};

export default File;

const Wrapper = styled.div<{ nestLevel: number; selected?: boolean }>`
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

const StyledButton = styled(Button)<{ disabled: boolean }>`
  display: ${({ disabled }) => (disabled ? "none" : "initial")};
`;

const StyledIcon = styled(Icon)<{ selected: boolean }>`
  color: ${({ selected }) => (selected ? "#ffffff" : "#00bebe")};
  ${Wrapper}:hover & {
    color: #ffffff;
  }
`;
