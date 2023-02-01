import { styled } from "@web/theme";
import { useCallback } from "react";

import { Result } from "../../types";

type Props = {
  item: Result;
  selected: string[];
  onSelect: (selected: string[]) => void;
};

const ResultItem: React.FC<Props> = ({ item, selected, onSelect }) => {
  const onClick = useCallback(() => {
    if (selected.includes(item.id)) {
      onSelect(selected.filter(sid => sid !== item.id));
    } else {
      onSelect([item.id]);
    }
  }, [onSelect, item, selected]);
  return (
    <StyledResultItem onClick={onClick} active={selected.includes(item.id)}>
      {item.id}
    </StyledResultItem>
  );
};

const StyledResultItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-bottom: 1px solid #d9d9d9;
  background: ${({ active }) => (active ? "var(--theme-color)" : "#fff")};
  color: ${({ active }) => (active ? "#fff" : "#000")};
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`;

export default ResultItem;
