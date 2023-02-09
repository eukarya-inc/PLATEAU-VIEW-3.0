import AddButton from "@web/extensions/sidebar/core/components/content/common/AddButton";
import { Icon, Dropdown, Menu } from "@web/sharedComponents";
import { styled } from "@web/theme";

import { BaseFieldProps } from "../../types";

import useHooks from "./hooks";
import SwitchGroupItems from "./SwitchGroupItem";

const SwitchGroup: React.FC<BaseFieldProps<"switchGroup">> = ({ value, editMode }) => {
  const {
    switchGroupObj,
    groupsTitle,
    handleTitleChange,
    handleChooseGroup,
    handleMoveDown,
    handleRemove,
    handleMoveUp,
    currentGroup,
    modifiedGroups,
    handAddItem,
    handleModifyGroup,
    handleModifyGroupTitle,
  } = useHooks(value);

  const menu = (
    <Menu
      items={switchGroupObj.groups.map(ls => {
        return {
          key: ls.group,
          label: (
            <p style={{ margin: 0 }} onClick={() => handleChooseGroup(ls)}>
              {ls.group}
            </p>
          ),
        };
      })}
    />
  );

  return editMode ? (
    <Wrapper>
      <Field>
        <FieldTitle>タイトル</FieldTitle>
        <FieldValue>
          <TextInput defaultValue={groupsTitle} onChange={handleTitleChange} />
        </FieldValue>
      </Field>
      <AddButton text="Add Item" onClick={handAddItem} />
      <SwitchGroupItems
        items={modifiedGroups?.groups}
        switchGroups={switchGroupObj.groups}
        handleMoveDown={handleMoveDown}
        handleMoveUp={handleMoveUp}
        handleRemove={handleRemove}
        handleModifyGroup={handleModifyGroup}
        handleModifyGroupTitle={handleModifyGroupTitle}
      />
    </Wrapper>
  ) : (
    <Wrapper>
      <Field>
        <FieldTitle>{groupsTitle}</FieldTitle>
        <FieldValue>
          <Dropdown overlay={menu} placement="bottom" trigger={["click"]}>
            <StyledDropdownButton>
              <p style={{ margin: 0 }}>{currentGroup.group}</p>
              <Icon icon="arrowDownSimple" size={12} />
            </StyledDropdownButton>
          </Dropdown>
        </FieldValue>
      </Field>
    </Wrapper>
  );
};

export default SwitchGroup;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledDropdownButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  align-content: center;
  padding: 0 16px;
  cursor: pointer;
`;

const Text = styled.p`
  margin: 0;
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
