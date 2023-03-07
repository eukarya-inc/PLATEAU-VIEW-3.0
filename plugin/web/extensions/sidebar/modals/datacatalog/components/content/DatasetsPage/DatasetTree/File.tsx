import { DataCatalogItem } from "@web/extensions/sidebar/core/types";
import { getNameFromPath } from "@web/extensions/sidebar/utils/file";
import { Button, Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo } from "react";

export type Props = {
  item: DataCatalogItem;
  isMobile?: boolean;
  nestLevel: number;
  selectedID?: string;
  nodeKey: string;
  addDisabled: (dataID: string) => boolean;
  onDatasetAdd: (dataset: DataCatalogItem) => void;
  onOpenDetails?: (item?: DataCatalogItem) => void;
  onSelect?: (dataID: string) => void;
  setExpandedKeys: React.Dispatch<React.SetStateAction<string[]>>;
};

const File: React.FC<Props> = ({
  item,
  isMobile,
  nestLevel,
  selectedID,
  nodeKey,
  addDisabled,
  onDatasetAdd,
  onOpenDetails,
  onSelect,
  setExpandedKeys,
}) => {
  const handleClick = useCallback(() => {
    onDatasetAdd(item);
  }, [item, onDatasetAdd]);

  const handleOpenDetails = useCallback(() => {
    onOpenDetails?.(item);
    onSelect?.(item.dataID);
  }, [item, onOpenDetails, onSelect]);

  const selected = useMemo(
    () => (item.type !== "group" ? selectedID === item.id : false),
    [selectedID, item],
  );

  const expandAllParentKeys = useCallback(
    (key: string) => {
      const keyArr = key.split("-");
      while (keyArr.length > 1) {
        keyArr.pop();
        const parent = keyArr.join("-");
        setExpandedKeys((prevState: string[]) => {
          const newExpandedKeys = [...prevState];
          if (!prevState.includes(parent)) newExpandedKeys.push(parent);
          return newExpandedKeys;
        });
      }
    },
    [setExpandedKeys],
  );

  useEffect(() => {
    const { selectedDataset } = window as any;
    if (selectedDataset) {
      onOpenDetails?.(selectedDataset);
      onSelect?.(selectedDataset.dataID);
      if (selected) expandAllParentKeys(nodeKey);
      setTimeout(() => {
        (window as any).selectedDataset = undefined;
      }, 500);
    }
  }, [expandAllParentKeys, nodeKey, onOpenDetails, onSelect, selected]);

  const name = useMemo(() => getNameFromPath(item.name), [item.name]);

  return (
    <Wrapper nestLevel={nestLevel} selected={selected}>
      <NameWrapper isMobile={isMobile} onClick={handleOpenDetails}>
        <Icon icon="file" size={20} />
        {!item.public && <UnpublishedIndicator />}
        <Name>{name}</Name>
      </NameWrapper>
      <StyledButton
        type="link"
        icon={<StyledIcon icon="plusCircle" selected={selected ?? false} />}
        onClick={handleClick}
        disabled={addDisabled(item.dataID)}
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
  width: 150px;
  margin: 0;
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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

const UnpublishedIndicator = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6d6d6d;
`;
