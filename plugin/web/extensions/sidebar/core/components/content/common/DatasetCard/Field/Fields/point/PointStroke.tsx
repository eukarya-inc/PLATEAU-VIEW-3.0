import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import { array_move } from "@web/extensions/sidebar/utils";
import { useCallback, useState } from "react";

import { BaseFieldProps, Cond, Fields } from "../types";

import ColorField from "./common/ColorField";
import ConditionField from "./common/ConditionField";
import Field from "./common/Field";
import ItemControls from "./common/ItemControls";
import { ButtonWrapper, Item, TextInput, Wrapper } from "./common/styled";

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
          <ColorField title="strokeColor" titleWidth={82} color={c.strokeColor} />
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
