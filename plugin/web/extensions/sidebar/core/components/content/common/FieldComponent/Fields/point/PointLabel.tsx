import {
  ColorField,
  SwitchField,
  TextField,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/FieldComponent/sharedComponents";
import { styled } from "@web/theme";
import { isEqual } from "lodash-es";
import { ChangeEvent, useCallback, useState, useEffect } from "react";

import { BaseFieldProps, Fields } from "../types";

const generateConditions = (propertyName: string) => {
  const fieldValue = "${" + String(propertyName) + "}";
  return [`true`, ` ${fieldValue} `];
};

const extractValue = (fieldValue: string) => {
  if (fieldValue.startsWith("={") && fieldValue.endsWith("}")) {
    return fieldValue.substring(2, fieldValue.length - 1);
  } else if (fieldValue.startsWith("=${") && fieldValue.endsWith("}")) {
    return fieldValue.substring(3, fieldValue.length - 1);
  } else {
    return fieldValue.substring(1);
  }
};

const PointLabel: React.FC<BaseFieldProps<"pointLabel">> = ({ value, editMode, onUpdate }) => {
  const [pointLabel, setPointLabel] = useState(value);
  const [conditions, setConditions] = useState<string[]>();

  const updatePointLabelByProp = useCallback((prop: string, value: any) => {
    setPointLabel(pointLabel => {
      const newPointLabel: Fields["pointLabel"] = {
        ...pointLabel,
        [prop]: value,
      };
      return newPointLabel;
    });
  }, []);

  const handleFieldChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const fieldValue = e.target.value;
      if (fieldValue.startsWith("=")) {
        const extractedValue = extractValue(fieldValue);
        setConditions(generateConditions(extractedValue));
      } else setConditions(undefined);
      updatePointLabelByProp("field", fieldValue);
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
      if (color) {
        updatePointLabelByProp("fontColor", color);
      }
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
      if (color) {
        updatePointLabelByProp("backgroundColor", color);
      }
    },
    [updatePointLabelByProp],
  );

  useEffect(() => {
    if (isEqual(value, pointLabel)) return;
    const timer = setTimeout(() => {
      onUpdate({
        ...pointLabel,
        override: {
          marker: {
            style: "point",
            label: true,
            labelTypography: {
              fontSize: pointLabel.fontSize,
              color: pointLabel.fontColor,
            },
            heightReference: "relative",
            labelText: !conditions
              ? pointLabel.field
              : {
                  expression: {
                    conditions: [conditions],
                  },
                },
            extrude: pointLabel.extruded,
            labelBackground: pointLabel.useBackground,
            labelBackgroundColor: pointLabel.backgroundColor,
          },
        },
      });
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [pointLabel, value, onUpdate, conditions]);

  return editMode ? (
    <Wrapper>
      <TextField
        title="Text"
        titleWidth={82}
        defaultValue={pointLabel.field}
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
