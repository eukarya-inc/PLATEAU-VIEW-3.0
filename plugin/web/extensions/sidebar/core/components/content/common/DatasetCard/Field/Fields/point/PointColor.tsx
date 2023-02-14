import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import { array_move } from "@web/extensions/sidebar/utils";
import { useCallback, useState } from "react";

import { BaseFieldProps, Cond } from "../types";

import ColorField from "./common/ColorField";
import ConditionField from "./common/ConditionField";
import ItemControls from "./common/ItemControls";
import { ButtonWrapper, Item, Wrapper } from "./common/styled";

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
          <ColorField title="色" titleWidth={82} color={c.color} />
        </Item>
      ))}
      <ButtonWrapper>
        <AddButton text="Add Condition" height={24} onClick={handleAdd} />
      </ButtonWrapper>
    </Wrapper>
  ) : null;
};

export default PointColor;
