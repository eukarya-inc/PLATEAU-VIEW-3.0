import AddButton from "@web/extensions/sidebar/core/components/content/common/AddButton";
import { array_move } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseFieldProps, Cond } from "../types";

import ConditionField from "./common/ConditionField";
import Field from "./common/Field";
import ItemControls from "./common/ItemControls";

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

  return editMode ? (
    <Wrapper>
      {value.pointColors?.map((c, idx) => (
        <Item key={idx}>
          <ItemControls
            index={idx}
            handleMoveDown={handleMoveDown}
            handleMoveUp={handleMoveUp}
            handleRemove={handleRemove}
          />
          <ConditionField title="if" fieldGap={8} condition={c.condition} />
          <Field
            title="色"
            titleWidth={82}
            value={
              <>
                <ColorBlock color={c.color} />
                <TextInput value={c.color} />
              </>
            }
          />
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

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 8px;
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

const ButtonWrapper = styled.div`
  width: 125px;
  align-self: flex-end;
`;
