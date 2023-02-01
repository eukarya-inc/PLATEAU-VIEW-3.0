import { Empty } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback } from "react";

import type { Result } from "../../types";

import ResultItem from "./ResultItem";

type Props = {
  active: boolean;
  results: Result[];
  highlightAll: boolean;
  showMatchingOnly: boolean;
  selected: string[];
  setHighlightAll: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMatchingOnly: React.Dispatch<React.SetStateAction<boolean>>;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

const ResultPanel: React.FC<Props> = ({
  active,
  results,
  highlightAll,
  showMatchingOnly,
  selected,
  setHighlightAll,
  setShowMatchingOnly,
  setSelected,
}) => {
  const onHighlightAll = useCallback(() => {
    setHighlightAll(highlightAll => {
      if (!highlightAll && selected.length > 0) {
        setSelected([]);
      }
      return !highlightAll;
    });
  }, [setHighlightAll, selected, setSelected]);

  const onShowMatchingOnly = useCallback(() => {
    setShowMatchingOnly(showMatchingOnly => !showMatchingOnly);
  }, [setShowMatchingOnly]);

  const onSelect = useCallback(
    (selected: string[]) => {
      setSelected(selected);
      if (highlightAll) {
        setHighlightAll(false);
      }
    },
    [setSelected, highlightAll, setHighlightAll],
  );

  return (
    <Wrapper active={active}>
      <ResultInfo>{`${results.length} matches found`}</ResultInfo>
      <ResultWrapper>
        {results?.map((item, index) => (
          <ResultItem key={index} item={item} onSelect={onSelect} selected={selected} />
        ))}
        {results.length === 0 && (
          <EmptyWrapper>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </EmptyWrapper>
        )}
      </ResultWrapper>
      <ButtonWrapper>
        <Button active={highlightAll} onClick={onHighlightAll}>
          Highlight all
        </Button>
        <Button active={showMatchingOnly} onClick={onShowMatchingOnly}>
          Show matching only
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ active: boolean }>`
  display: ${({ active }) => (active ? "flex" : "none")};
  padding: 8px 0;
  flex-direction: column;
`;

const ResultInfo = styled.div`
  height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 100%;
  padding: 9px 20px;
  font-size: 16px;
`;

const ResultWrapper = styled.div`
  position: relative;
  height: 350px;
  overflow: auto;
  border: 1px solid #d9d9d9;
  margin: 0 12px;
`;

const EmptyWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  padding: 6px 12px;
  display: flex;
  gap: 12px;
`;

const Button = styled.div<{ active: boolean }>`
  width: 50%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active }) => (active ? "#fff" : "#000")};
  background: ${({ active }) => (active ? "var(--theme-color)" : "#fff")};
  border: ${({ active }) => (active ? "1px solid var(--theme-color)" : "1px solid #e6e6e6")};
  border-radius: 4px;
  cursor: pointer;
`;

export default ResultPanel;
