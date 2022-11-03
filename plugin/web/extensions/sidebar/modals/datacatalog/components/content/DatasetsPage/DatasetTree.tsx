import { Icon, Input } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useState } from "react";

const DatasetTree: React.FC = () => {
  const [filterType, changeFilter] = useState<"prefecture" | "type">("prefecture");
  return (
    <Wrapper>
      <StyledInput placeholder="input search text" addonAfter={<Icon icon="search" size={15} />} />
      <FilterWrapper>
        <Button selected={filterType === "prefecture"} onClick={() => changeFilter("prefecture")}>
          Prefecture
        </Button>
        <Button selected={filterType === "type"} onClick={() => changeFilter("type")}>
          Type
        </Button>
      </FilterWrapper>
      <p>A file system like tree for datasets</p>
    </Wrapper>
  );
};

export default DatasetTree;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 12px;
`;

const StyledInput = styled(Input)`
  .ant-input {
    :hover {
      border: 1px solid #00bebe;
    }
  }
  .ant-input-group-addon {
    width: 32px;
    padding: 0;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ selected?: boolean }>`
  background: #ffffff;
  color: ${({ selected }) => (selected ? "#00BEBE" : "#898989")};
  border: 1px solid ${({ selected }) => (selected ? "#00BEBE" : "#d9d9d9")};
  border-radius: 2px;
  transition: color 0.3s, border 0.3s;
  padding: 5px 16px;
  cursor: pointer;
`;
