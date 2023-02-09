import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";

import { groupItem } from "../../types";

type Props = {
  items?: groupItem[];
  switchGroups: groupItem[];
  handleMoveDown: (idx: number) => void;
  handleMoveUp: (idx: number) => void;
  handleRemove: (idx: number) => void;
  handleModifyGroup: (item: string, indx: number) => void;
  handleModifyGroupTitle: (title: string, indx: number) => void;
};

const SwitchGroupItems: React.FC<Props> = ({
  items,
  switchGroups,
  handleMoveDown,
  handleMoveUp,
  handleRemove,
  handleModifyGroup,
  handleModifyGroupTitle,
}) => {
  return (
    <Wrapper>
      {items?.map((item, idx) => (
        <Item key={idx}>
          <ItemControls>
            <Icon icon="arrowUpThin" size={16} onClick={() => handleMoveUp(idx)} />
            <Icon icon="arrowDownThin" size={16} onClick={() => handleMoveDown(idx)} />
            <Icon icon="trash" size={16} onClick={() => handleRemove(idx)} />
          </ItemControls>
          <Field>
            <FieldTitle>グループ</FieldTitle>
            <FieldValue>
              <SelectWrapper
                value={item.group}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  handleModifyGroup(e.target.value, idx);
                }}>
                <option selected disabled defaultValue={""} />

                {switchGroups.map(option => (
                  <option
                    key={option.id}
                    defaultValue={option.group}
                    disabled={items.find(c => c.group === option.group) ? true : false}>
                    {option.group}
                  </option>
                ))}
              </SelectWrapper>
            </FieldValue>
          </Field>
          <Field>
            <FieldTitle>題名</FieldTitle>
            <FieldValue>
              <TextInput
                value={item.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleModifyGroupTitle(e.target.value, idx);
                }}
              />
            </FieldValue>
          </Field>
        </Item>
      ))}
    </Wrapper>
  );
};

export default SwitchGroupItems;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Text = styled.p`
  margin: 0;
  line-height: 15px;
`;

const Field = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  height: 32px;
`;

const FieldTitle = styled(Text)`
  width: 82px;
`;

const FieldValue = styled.div`
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  flex: 1;
  height: 100%;
  width: 100%;
`;

const TextInput = styled.input.attrs({ type: "text" })`
  height: 100%;
  width: 100%;
  flex: 1;
  padding: 0 12px;
  border: none;
  outline: none;

  :focus {
    border: none;
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 8px;
`;

const ItemControls = styled.div`
  display: flex;
  justify-content: right;
  gap: 4px;
  cursor: pointer;
`;

const SelectWrapper = styled.select`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  align-content: center;
  padding: 0 16px;
  cursor: pointer;
`;
