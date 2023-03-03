import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import {
  ButtonWrapper,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { generateID, moveItemDown, moveItemUp, removeItem } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { stringifyCondition } from "../../../utils";
import { BaseFieldProps, Cond } from "../../types";

import PolygonStrokeItem from "./PolygonStrokeItem";

const PolygonStroke: React.FC<BaseFieldProps<"polygonStroke">> = ({
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
      const newItem: {
        strokeColor: string;
        strokeWidth: number;
        condition: Cond<any>;
      } = {
        strokeColor: "",
        strokeWidth: 5,
        condition: {
          key: generateID(),
          operator: "===",
          operand: true,
          value: true,
        },
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

  const handleItemUpdate = (
    item: { condition: Cond<string | number>; strokeColor: string; strokeWidth: number },
    index: number,
  ) => {
    updateItems(c => {
      const newItems = [...(c ?? [])];
      newItems.splice(index, 1, item);
      return newItems;
    });
  };

  useEffect(() => {
    if (!dataID || value.items === items) return;

    const timer = setTimeout(() => {
      const strokeConditions: [string, string][] = [["true", "true"]];
      const strokeColorConditions: [string, string][] = [["true", 'color("white")']];
      const strokeWidthConditions: [string, string][] = [["true", "1"]];
      items?.forEach(item => {
        const resStrokeColor = "color" + `("${item.strokeColor}")`;
        const resStrokeWidth = String(item.strokeWidth);
        const cond = stringifyCondition(item.condition);
        strokeColorConditions.unshift([cond, resStrokeColor]);
        strokeWidthConditions.unshift([cond, resStrokeWidth]);
        strokeConditions.unshift([cond, cond]);
        onUpdate({
          ...value,
          items,
          override: {
            polygon: {
              stroke: {
                expression: {
                  conditions: strokeConditions,
                },
              },
              strokeColor: {
                expression: {
                  conditions: strokeColorConditions,
                },
              },
              strokeWidth: {
                expression: {
                  conditions: strokeWidthConditions,
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
        <PolygonStrokeItem
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

export default PolygonStroke;
