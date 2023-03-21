import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import {
  ButtonWrapper,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { generateID, moveItemDown, moveItemUp, removeItem } from "@web/extensions/sidebar/utils";
import { styled, commonStyles } from "@web/theme";
import { useCallback, useEffect, useState, useRef } from "react";

import { stringifyCondition } from "../../../utils";
import { BaseFieldProps, Cond, PointColor as PointColorType } from "../../types";

import PointColorItem from "./PointColorItem";

const PointColor: React.FC<BaseFieldProps<"pointColor">> = ({ value, editMode, onUpdate }) => {
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
          operator: "===",
          operand: true,
          value: true,
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

  const generateOverride = useCallback((pointColors: PointColorType["pointColors"]) => {
    const conditions: [string, string][] = [["true", 'color("white")']];
    pointColors?.forEach(item => {
      const res = "color" + `("${item.color}")`;
      const cond = stringifyCondition(item.condition);
      conditions.unshift([cond, res]);
    });
    return {
      marker: {
        style: "point",
        pointColor: {
          expression: {
            conditions,
          },
        },
      },
    };
  }, []);

  const [override, updateOverride] = useState<{ marker: any }>(generateOverride(value.pointColors));
  const valueRef = useRef(value);
  const itemsRef = useRef(pointColors);
  const onUpdateRef = useRef(onUpdate);
  valueRef.current = value;
  itemsRef.current = pointColors;
  onUpdateRef.current = onUpdate;

  const handleApply = useCallback(() => {
    updateOverride(generateOverride(pointColors));
  }, [generateOverride, pointColors]);

  useEffect(() => {
    onUpdateRef.current({
      ...valueRef.current,
      pointColors: itemsRef.current,
      override,
    });
  }, [override]);

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
      <Button onClick={handleApply}>Apply</Button>
    </Wrapper>
  ) : null;
};

const Button = styled.div`
  ${commonStyles.simpleButton}
`;

export default PointColor;
