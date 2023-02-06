import AddButton from "@web/extensions/sidebar/core/components/content/common/AddButton";
import { Icon, Dropdown, Menu } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseFieldProps, Cond } from "../types";

const operators: { [key: string]: string } = {
  greater: ">",
  less: "<",
  greaterEqual: ">=",
  lessEqual: "<=",
  equal: "=",
};

function array_move(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}

const PointColor: React.FC<BaseFieldProps<"pointColor">> = ({ value, editMode, onUpdate }) => {
  const [pointColors, updatePointColors] = useState(value.pointColors);

  const handleMoveUp = useCallback(
    (idx: number) => {
      if (idx === 0) return;
      updatePointColors(c => {
        let newPointColors: { condition: Cond<number>; color: string }[] | undefined = undefined;
        if (c) {
          newPointColors = c;
          array_move(newPointColors, idx, idx - 1);
        }
        onUpdate({
          ...value,
          pointColors: newPointColors,
        });
        return newPointColors;
      });
    },
    [value, onUpdate],
  );

  const handleMoveDown = useCallback(
    (idx: number) => {
      if (pointColors && idx >= pointColors.length - 1) return;
      updatePointColors(c => {
        let newPointColors: { condition: Cond<number>; color: string }[] | undefined = undefined;
        if (c) {
          newPointColors = c;
          array_move(newPointColors, idx, idx + 1);
        }
        onUpdate({
          ...value,
          pointColors: newPointColors,
        });
        return newPointColors;
      });
    },
    [value, pointColors, onUpdate],
  );

  const handleAdd = useCallback(() => {
    updatePointColors(c => {
      const newPointColor: { condition: Cond<number>; color: string } = {
        condition: {
          key: "ARGH",
          operator: "=",
          operand: "AField",
          value: 1,
        },
        color: "brown",
      };
      onUpdate({
        ...value,
        pointColors: value.pointColors ? [...value.pointColors, newPointColor] : [newPointColor],
      });
      return c ? [...c, newPointColor] : [newPointColor];
    });
  }, [value, onUpdate]);

  const handleRemove = useCallback(
    (idx: number) => {
      updatePointColors(c => {
        let newPointColors: { condition: Cond<number>; color: string }[] | undefined = undefined;
        if (c) {
          newPointColors = c.filter((_, idx2) => idx2 != idx);
        }
        onUpdate({
          ...value,
          pointColors: newPointColors,
        });
        return newPointColors;
      });
    },
    [value, onUpdate],
  );

  const menu = (
    <Menu
      items={Object.keys(operators).map(op => {
        return {
          key: op,
          label: (
            <p style={{ margin: 0 }} onClick={() => console.log(op)}>
              {operators[op]}
            </p>
          ),
        };
      })}
    />
  );

  return editMode ? (
    <Wrapper>
      {value.pointColors?.map((c, idx) => (
        <Item key={idx}>
          <ItemControls>
            <Icon icon="arrowUpThin" size={16} onClick={() => handleMoveUp(idx)} />
            <Icon icon="arrowDownThin" size={16} onClick={() => handleMoveDown(idx)} />
            <Icon icon="trash" size={16} onClick={() => handleRemove(idx)} />
          </ItemControls>
          {/* {legend.style === "icon" && (
            <Field>
              <FieldTitle>URL</FieldTitle>
              <FieldValue>
                <TextInput value={item.url} />
              </FieldValue>
            </Field>
          )} */}
          <Field gap={8}>
            <FieldTitle>if</FieldTitle>
            <FieldValue>
              <Dropdown overlay={menu} placement="bottom" trigger={["click"]}>
                <StyledDropdownButton>
                  <p style={{ margin: 0 }}>{c.condition.operand}</p>
                  <Icon icon="arrowDownSimple" size={12} />
                </StyledDropdownButton>
              </Dropdown>
            </FieldValue>
            <FieldValue>
              <Dropdown overlay={menu} placement="bottom" trigger={["click"]}>
                <StyledDropdownButton>
                  <p style={{ margin: 0 }}>{c.condition.operator}</p>
                  <Icon icon="arrowDownSimple" size={12} />
                </StyledDropdownButton>
              </Dropdown>
            </FieldValue>
            <FieldValue>
              <NumberInput value={c.condition.value} />
            </FieldValue>
          </Field>
          <Field>
            <FieldTitle width={82}>色</FieldTitle>
            <FieldValue>
              <ColorBlock color={c.color} />
              <TextInput value={c.color} />
            </FieldValue>
          </Field>
        </Item>
      ))}
      <ButtonWrapper>
        <AddButton text="Add Condition" height={24} onClick={handleAdd} />
      </ButtonWrapper>
    </Wrapper>
  ) : null;
};

export default PointColor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// const StyledDropdownButton = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   width: 100%;
//   align-content: center;
//   padding: 0 16px;
//   cursor: pointer;
// `;

const Text = styled.p`
  margin: 0;
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

const Field = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  height: 32px;
`;

const FieldTitle = styled(Text)<{ width?: number }>`
  ${({ width }) => width && `width: ${width}px;`}
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

const NumberInput = styled.input.attrs({ type: "number" })`
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

const ColorBlock = styled.div<{ color: string; legendStyle?: "circle" | "square" | "line" }>`
  width: 30px;
  height: ${({ legendStyle }) => (legendStyle === "line" ? "3px" : "30px")};
  background: ${({ color }) => color ?? "#d9d9d9"};
  border-radius: ${({ legendStyle }) =>
    legendStyle
      ? legendStyle === "circle"
        ? "50%"
        : legendStyle === "line"
        ? "5px"
        : "2px"
      : "1px 0 0 1px"};
`;

// const StyledImg = styled.img`
//   width: 30px;
//   height: 30px;
// `;

const ButtonWrapper = styled.div`
  width: 125px;
  align-self: flex-end;
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
