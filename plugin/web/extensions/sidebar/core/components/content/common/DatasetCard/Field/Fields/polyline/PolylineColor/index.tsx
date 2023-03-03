import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import {
  ButtonWrapper,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { generateID, moveItemDown, moveItemUp, removeItem } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { stringifyCondition } from "../../../utils";
import { BaseFieldProps, Cond } from "../../types";

import PolylineColorItem from "./PolylineColorItem";

const PolylineColor: React.FC<BaseFieldProps<"polylineColor">> = ({
  dataID,
  value,
  editMode,
  onUpdate,
}) => {
  const [items, updateItems] = useState(value.items);

  const handleMoveUp = useCallback((idx: number) => {
    updateItems(c => {
      const newItems = moveItemUp(idx, c) ?? c;
      return newItems;
    });
  }, []);

  const handleMoveDown = useCallback((idx: number) => {
    updateItems(c => {
      const newItems = moveItemDown(idx, c) ?? c;
      return newItems;
    });
  }, []);

  const handleAdd = useCallback(() => {
    updateItems(c => {
      const newItem: { condition: Cond<any>; color: string } = {
        condition: {
          key: generateID(),
          operator: "===",
          operand: true,
          value: true,
        },
        color: "",
      };
      return c ? [...c, newItem] : [newItem];
    });
  }, []);

  const handleRemove = useCallback((idx: number) => {
    updateItems(c => {
      const newItems = removeItem(idx, c) ?? c;
      return newItems;
    });
  }, []);

  const handleItemUpdate = (item: { condition: Cond<number>; color: string }, index: number) => {
    updateItems(c => {
      const newItems = [...(c ?? [])];
      newItems.splice(index, 1, item);
      return newItems;
    });
  };

  useEffect(() => {
    if (!dataID || value.items === items) return;

    const timer = setTimeout(() => {
      const strokeColorConditions: [string, string][] = [["true", 'color("white")']];
      items?.forEach(item => {
        const resStrokeColor = "color" + `("${item.color}")`;
        const cond = stringifyCondition(item.condition);
        strokeColorConditions.unshift([cond, resStrokeColor]);
        onUpdate({
          ...value,
          items,
          override: {
            polyline: {
              strokeColor: {
                expression: {
                  conditions: strokeColorConditions,
                },
              },
            },
          },
        });
      });
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [dataID, items, value, onUpdate]);

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
