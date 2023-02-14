import AddButton from "@web/extensions/sidebar/core/components/content/common/AddButton";
import { array_move } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseFieldProps, Cond, Fields } from "../types";

import ConditionField from "./common/ConditionField";
import Field from "./common/Field";
import ItemControls from "./common/ItemControls";

const PointStroke: React.FC<BaseFieldProps<"pointStroke">> = ({ value, editMode, onUpdate }) => {
  const [items, updateItems] = useState(value.items);

  const handleMoveUp = useCallback(
    (idx: number) => {
      if (idx === 0) return;
      updateItems(c => {
        let newItems: Fields["pointStroke"]["items"] = undefined;

        if (c) {
          newItems = c;
          array_move(newItems, idx, idx - 1);
        }
        onUpdate({
          ...value,
          items: newItems,
        });
        return newItems;
      });
    },
    [value, onUpdate],
  );

  const handleMoveDown = useCallback(
    (idx: number) => {
      if (items && idx >= items.length - 1) return;
      updateItems(c => {
        let newItems: Fields["pointStroke"]["items"] = undefined;
        if (c) {
          newItems = c;
          array_move(newItems, idx, idx + 1);
        }
        onUpdate({
          ...value,
          items: newItems,
        });
        return newItems;
      });
    },
    [items, onUpdate, value],
  );

  const handleAdd = useCallback(() => {
    updateItems(c => {
      const newItem: {
        strokeColor: string;
        strokeWidth: number;
        condition: Cond<string | number>;
      } = {
        strokeColor: "brown",
        strokeWidth: 10,
        condition: {
          key: "ARGH",
          operator: "=",
          operand: "AField",
          value: 1,
        },
      };
      onUpdate({
        ...value,
        items: value.items ? [...value.items, newItem] : [newItem],
      });
      return c ? [...c, newItem] : [newItem];
    });
  }, [value, onUpdate]);

  const handleRemove = useCallback(
    (idx: number) => {
      updateItems(c => {
        let newItems: Fields["pointStroke"]["items"] = undefined;
        if (c) {
          newItems = c.filter((_, idx2) => idx2 != idx);
        }
        onUpdate({
          ...value,
          items: newItems,
        });
        return newItems;
      });
    },
    [value, onUpdate],
  );

  return editMode ? (
    <Wrapper>
      {value.items?.map((c, idx) => (
        <Item key={idx}>
          <ItemControls
            index={idx}
            handleMoveDown={handleMoveDown}
            handleMoveUp={handleMoveUp}
            handleRemove={handleRemove}
          />
          <ConditionField title="if" fieldGap={8} condition={c.condition} />
          <Field
            title="strokeColor"
            titleWidth={82}
            value={
              <>
                <ColorBlock color={c.strokeColor} />
                <TextInput value={c.strokeColor} />
              </>
            }
          />
          <Field title="strokeWidth" titleWidth={82} value={<TextInput value={c.strokeWidth} />} />
        </Item>
      ))}
      <ButtonWrapper>
        <AddButton text="Add Condition" height={24} onClick={handleAdd} />
      </ButtonWrapper>
    </Wrapper>
  ) : null;
};

export default PointStroke;

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
