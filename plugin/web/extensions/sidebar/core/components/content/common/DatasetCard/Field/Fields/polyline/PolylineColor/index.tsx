import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import {
  ButtonWrapper,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { generateID, moveItemDown, moveItemUp, removeItem } from "@web/extensions/sidebar/utils";
import { useCallback, useState } from "react";

import { BaseFieldProps, Cond } from "../../types";

import PolylineColorItem from "./PolylineColorItem";

const PolylineColor: React.FC<BaseFieldProps<"polylineColor">> = ({
  value,
  editMode,
  onUpdate,
}) => {
  const [items, updateItems] = useState(value.items);

  const handleMoveUp = useCallback(
    (idx: number) => {
      updateItems(c => {
        const newItems = moveItemUp(idx, c) ?? c;
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
      updateItems(c => {
        const newItems = moveItemDown(idx, c) ?? c;
        onUpdate({
          ...value,
          items: newItems,
        });
        return newItems;
      });
    },
    [onUpdate, value],
  );

  const handleAdd = useCallback(() => {
    updateItems(c => {
      const newItem: { condition: Cond<number>; color: string } = {
        condition: {
          key: generateID(),
          operator: "=",
          operand: "width",
          value: 1,
        },
        color: "",
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
        const newItems = removeItem(idx, c) ?? c;
        onUpdate({
          ...value,
          items: newItems,
        });
        return newItems;
      });
    },
    [value, onUpdate],
  );

  const handleItemUpdate = (item: { condition: Cond<number>; color: string }, index: number) => {
    updateItems(c => {
      const newItems = [...(c ?? [])];
      newItems.splice(index, 1, item);
      onUpdate({
        ...value,
        items: newItems,
      });
      return newItems;
    });
  };

  return editMode ? (
    <Wrapper>
      {items?.map((c, idx) => (
        <PolylineColorItem
          key={idx}
          index={idx}
          item={c}
          handleMoveDown={handleMoveDown}
          handleMoveUp={handleMoveUp}
          handleRemove={handleRemove}
          onItemUpdate={handleItemUpdate}
        />
      ))}
      <ButtonWrapper>
        <AddButton text="Add Condition" height={24} onClick={handleAdd} />
      </ButtonWrapper>
    </Wrapper>
  ) : null;
};

export default PolylineColor;
