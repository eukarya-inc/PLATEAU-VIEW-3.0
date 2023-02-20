import { Slider } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { CSSProperties } from "react";

import { BaseFieldProps } from "../../types";

import useHooks from "./hooks";
import { MAX_ABOVEGROUND_FLOOR, MAX_BASEMENT_FLOOR, MAX_HEIGHT } from "./useBuildingFilter";

const rangeToText = (range: [from: number, to: number]) => range.join(" ~ ");

const styleProps = {
  trackStyle: [
    {
      backgroundColor: "#00BEBE",
    },
  ] as CSSProperties[],
  handleStyle: [
    {
      border: "2px solid #00BEBE",
    },
    {
      border: "2px solid #00BEBE",
    },
  ] as CSSProperties[],
};

const BuildingFilter: React.FC<BaseFieldProps<"buildingFilter">> = ({
  value,
  dataID,
  editMode,
  onUpdate,
}) => {
  const { options, handleUpdateRange } = useHooks({
    value,
    dataID,
    onUpdate,
  });

  return editMode ? null : (
    <div>
      <FieldWrapper>
        <LabelWrapper>
          <Label>高さで絞り込み</Label>
          <Range>{rangeToText(options.height)}</Range>
        </LabelWrapper>
        <Slider
          range={true}
          value={options.height}
          defaultValue={[0, MAX_HEIGHT]}
          max={MAX_HEIGHT}
          onChange={handleUpdateRange("height")}
          {...styleProps}
        />
      </FieldWrapper>
      <FieldWrapper>
        <LabelWrapper>
          <Label>地上階数で絞り込み</Label>
          <Range>{rangeToText(options.abovegroundFloor)}</Range>
        </LabelWrapper>
        <Slider
          range={true}
          value={options.abovegroundFloor}
          defaultValue={[1, MAX_ABOVEGROUND_FLOOR]}
          min={1}
          max={MAX_ABOVEGROUND_FLOOR}
          onChange={handleUpdateRange("abovegroundFloor")}
          {...styleProps}
        />
      </FieldWrapper>
      <FieldWrapper>
        <LabelWrapper>
          <Label>地下階数で絞り込み</Label>
          <Range>{rangeToText(options.basementFloor)}</Range>
        </LabelWrapper>
        <Slider
          range={true}
          value={options.basementFloor}
          defaultValue={[0, MAX_BASEMENT_FLOOR]}
          max={MAX_BASEMENT_FLOOR}
          onChange={handleUpdateRange("basementFloor")}
          {...styleProps}
        />
      </FieldWrapper>
    </div>
  );
};

export default BuildingFilter;

const FieldWrapper = styled.div`
  width: 100%;
`;

const LabelWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const Label = styled.label`
  display: flex;
  flex: 1;
  font-size: 12px;
`;

const Range = styled.span`
  font-size: 12px;
`;
