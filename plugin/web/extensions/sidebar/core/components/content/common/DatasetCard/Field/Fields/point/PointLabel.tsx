import {
  ColorField,
  SelectField,
  SwitchField,
  TextField,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/common";
import { Wrapper } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { styled } from "@web/theme";
import { ChangeEvent, useCallback, useState } from "react";

import { BaseFieldProps, Fields } from "../types";

// TODO: list all options for select field dropdown
const options = [
  { value: "Option1", label: "Option1" },
  { value: "Option2", label: "Option2" },
];

const PointLabel: React.FC<BaseFieldProps<"pointLabel">> = ({ value, editMode, onUpdate }) => {
  const [pointLabel, setPointLabel] = useState(value);

  const updatePointLabelByProp = useCallback(
    (prop: string, value: any) => {
      setPointLabel(pointLabel => {
        const newPointLabel: Fields["pointLabel"] = {
          ...pointLabel,
          [prop]: value,
        };
        onUpdate({
          ...pointLabel,
          [prop]: value,
        });
        return newPointLabel;
      });
    },
    [onUpdate],
  );

  const handleFieldChange = useCallback(
    (field: any) => {
      updatePointLabelByProp("field", field);
    },
    [updatePointLabelByProp],
  );

  const handleFontSizeUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const fontSize = !isNaN(parseFloat(e.currentTarget.value))
        ? parseFloat(e.currentTarget.value)
        : 1;
      updatePointLabelByProp("fontSize", fontSize);
    },
    [updatePointLabelByProp],
  );

  const handleFontColorUpdate = useCallback(
    (color: string) => {
      if (color) updatePointLabelByProp("color", color);
    },
    [updatePointLabelByProp],
  );

  const handleHeightUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const height = !isNaN(parseFloat(e.currentTarget.value))
        ? parseFloat(e.currentTarget.value)
        : 1;
      updatePointLabelByProp("height", height);
    },
    [updatePointLabelByProp],
  );

  const handleExtrudedChange = useCallback(
    (extruded: boolean) => {
      updatePointLabelByProp("extruded", extruded);
    },
    [updatePointLabelByProp],
  );

  const handleUseBackgroundChange = useCallback(
    (useBackground: boolean) => {
      updatePointLabelByProp("useBackground", useBackground);
    },
    [updatePointLabelByProp],
  );

  const handleBackgroundColorUpdate = useCallback(
    (color: string) => {
      if (color) updatePointLabelByProp("color", color);
    },
    [updatePointLabelByProp],
  );

  return editMode ? (
    <Wrapper>
      <SelectField
        title="Choose field"
        titleWidth={82}
        options={options}
        onChange={handleFieldChange}
      />
      <TextField
        title="Font size"
        titleWidth={82}
        defaultValue={pointLabel.fontSize}
        suffix={<Suffix>px</Suffix>}
        onChange={handleFontSizeUpdate}
      />
      <ColorField
        title="Font color"
        titleWidth={82}
        color={pointLabel.fontColor}
        onChange={handleFontColorUpdate}
      />
      <TextField
        title="Height"
        titleWidth={82}
        defaultValue={pointLabel.height}
        suffix={<Suffix>m</Suffix>}
        onChange={handleHeightUpdate}
      />
      <SwitchField
        title="Extruded"
        titleWidth={82}
        checked={pointLabel.extruded}
        onChange={handleExtrudedChange}
      />
      <SwitchField
        title="Use Background"
        titleWidth={82}
        checked={pointLabel.useBackground}
        onChange={handleUseBackgroundChange}
      />
      {pointLabel.useBackground && (
        <ColorField
          title="Background color"
          titleWidth={82}
          color={pointLabel.backgroundColor}
          onChange={handleBackgroundColorUpdate}
        />
      )}
    </Wrapper>
  ) : null;
};
export default PointLabel;

export const Suffix = styled.span`
  color: rgba(0, 0, 0, 0.45);
`;
