import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import {
  ButtonWrapper,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { generateID, moveItemDown, moveItemUp, removeItem } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { stringifyCondition } from "../../../utils";
import { BaseFieldProps, Cond } from "../../types";

import PointColorItem from "./PointColorItem";

const PointColor: React.FC<BaseFieldProps<"pointColor">> = ({
  dataID,
  value,
  editMode,
  isActive,
  onUpdate,
}) => {
  const [pointColors, updatePointColors] = useState(value.pointColors);

  const handleMoveUp = useCallback((idx: number) => {
    updatePointColors(c => {
      const newPointColors = moveItemUp(idx, c) ?? c;
      return newPointColors;
    });
  }, []);

  const handleMoveDown = useCallback((idx: number) => {
    updatePointColors(c => {
      const newPointColors = moveItemDown(idx, c) ?? c;
      return newPointColors;
    });
  }, []);

  const handleAdd = useCallback(() => {
    updatePointColors(c => {
      const newPointColor: { condition: Cond<any>; color: string } = {
        condition: {
          key: generateID(),
          operator: "",
          operand: "",
          value: "",
        },
        color: "",
      };
      return c ? [...c, newPointColor] : [newPointColor];
    });
  }, []);

  const handleRemove = useCallback((idx: number) => {
    updatePointColors(c => {
      const newPointColors = removeItem(idx, c) ?? c;
      return newPointColors;
    });
  }, []);

  const handleItemUpdate = (item: { condition: Cond<number>; color: string }, index: number) => {
    updatePointColors(c => {
      const newPointColors = [...(c ?? [])];
      newPointColors.splice(index, 1, item);
      return newPointColors;
    });
  };

  useEffect(() => {
    if (!isActive || !dataID || value.pointColors === pointColors) return;

    const timer = setTimeout(() => {
      const conditions: [string, string][] = [["true", 'color("white")']];
      pointColors?.forEach(item => {
        const res = "color" + `("${item.color}")`;
        const cond = stringifyCondition(item.condition);
        conditions.unshift([cond, res]);
      });
      onUpdate({
        ...value,
        pointColors,
        override: {
          marker: {
            style: "point",
            pointColor: {
              expression: {
                conditions,
              },
            },
          },
        },
      });
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [dataID, isActive, pointColors, value, onUpdate]);

  return editMode ? (
    <Wrapper>
      {pointColors?.map((c, idx) => (
        <PointColorItem
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

export default PointColor;
