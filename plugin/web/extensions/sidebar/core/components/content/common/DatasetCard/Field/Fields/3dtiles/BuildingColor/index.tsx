import { Radio } from "@web/sharedComponents";
import { styled } from "@web/theme";

import { BaseFieldProps } from "../../types";

import useHooks from "./hooks";

const BuildingColor: React.FC<BaseFieldProps<"buildingColor">> = ({
  value,
  dataID,
  editMode,
  onUpdate,
}) => {
  const { options, floods, independentColorTypes, handleUpdateColorType } = useHooks({
    value,
    dataID,
    onUpdate,
  });

  return editMode ? null : (
    <Radio.Group onChange={handleUpdateColorType} value={options.colorType} defaultValue="none">
      <StyledRadio value="none">
        <Label>色分けなし</Label>
      </StyledRadio>
      {independentColorTypes.map(type => (
        <StyledRadio key={type.id} value={type.id}>
          <Label>{type.label}</Label>
        </StyledRadio>
      ))}
      {floods.map(flood => (
        <StyledRadio key={flood.id} value={flood.id}>
          <Label>{flood.label}</Label>
        </StyledRadio>
      ))}
    </Radio.Group>
  );
};

export default BuildingColor;

const StyledRadio = styled(Radio)`
  width: 100%;
  margin-top: 8px;
`;

const Label = styled.span`
  font-size: 14px;
`;
