import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { styled, svgIconClasses } from "@mui/material";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertySwitchField,
  PropertyWrapper,
} from "../../../../ui-components";

export type StyleCodeFieldPreset = {
  code?: string;
  enableTransparencySlider?: boolean;
};

export const EditorStyleCodeField: React.FC<BasicFieldProps<"STYLE_CODE_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const code = useMemo(() => component.preset?.code ?? "", [component.preset?.code]);
  const [codeValid, setCodeValid] = useState<boolean | undefined>();

  useEffect(() => {
    try {
      JSON.parse(code);
      setCodeValid(true);
    } catch (error) {
      setCodeValid(false);
    }
  }, [code]);

  const handleCodeChange = useCallback(
    (code: string) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          code,
        },
      });
    },
    [component, onUpdate],
  );

  const handleEnableTransparencySliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          enableTransparencySlider: !!e.target.checked,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <CodeEditorWrapper>
          <CodeEditor
            value={code}
            language="json"
            placeholder="Style JSON here."
            onChange={evn => handleCodeChange(evn.target.value)}
            padding={10}
            data-color-mode="light"
            minHeight={200}
            style={{
              fontSize: 12,
              lineHeight: 1.25,
              backgroundColor: "#fff",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
          <ValidTip valid={codeValid ? 1 : 0}>
            {codeValid ? <CheckOutlinedIcon /> : <ErrorOutlineOutlinedIcon />}JSON
          </ValidTip>
        </CodeEditorWrapper>

        <PropertyInlineWrapper label="Enable Transparency Slider">
          <PropertySwitchField
            checked={!!component.preset?.enableTransparencySlider}
            onChange={handleEnableTransparencySliderChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};

const CodeEditorWrapper = styled("div")({
  position: "relative",
});

const ValidTip = styled("div")<{ valid: number }>(({ valid, theme }) => ({
  position: "absolute",
  bottom: theme.spacing(0.5),
  right: theme.spacing(0.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: "11px",
  padding: theme.spacing(0.2, 0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: valid ? theme.palette.success.light : theme.palette.error.light,
  opacity: 0.5,

  [`& .${svgIconClasses.root}`]: {
    fontSize: 16,
    marginRight: theme.spacing(0.5),
  },
}));
