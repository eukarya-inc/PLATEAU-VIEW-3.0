import MonacoEditor from "@monaco-editor/react";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { styled, svgIconClasses } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { BasicFieldProps } from "..";
import {
  EditorDialog,
  PropertyBox,
  PropertyButton,
  PropertyInfo,
  PropertyInlineWrapper,
  PropertyWrapper,
} from "../../../../ui-components";

const options = {
  bracketPairColorization: {
    enabled: true,
  },
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
  selectOnLineNumbers: true,
  fontSize: 12,
};

export type TilesetBuildingModelColorFieldPreset = {
  code: string;
  overrides:
    | {
        propertyName?: string;
        title?: string;
        matcher?: "equal" | "startsWith" | "endsWith";
        colorSet?: { value?: string | number; color?: string; name?: string }[];
      }[]
    | undefined;
};

export const EditorTilesetBuildingModelColorField: React.FC<
  BasicFieldProps<"TILESET_BUILDING_MODEL_COLOR">
> = props => {
  return <JSONField {...props} />;
};

const JSONField: React.FC<BasicFieldProps<"TILESET_BUILDING_MODEL_COLOR">> = ({
  component,
  onUpdate,
}) => {
  const [editorCode, setEditorCode] = useState<string | undefined>(component.preset?.code);
  const [codeValid, setCodeValid] = useState<boolean | undefined>();

  const handleCodeChange = useCallback(
    (code: string | undefined) => {
      if (!code) return;
      try {
        const json = JSON.parse(code) as TilesetBuildingModelColorFieldPreset | undefined;
        onUpdate({
          ...component,
          preset: {
            ...component.preset,
            code,
            overrides: json?.overrides,
          },
        });
        setCodeValid(true);
      } catch (error) {
        setCodeValid(false);
      }
    },
    [component, onUpdate],
  );

  const handleCodeChangeRef = useRef(handleCodeChange);
  handleCodeChangeRef.current = handleCodeChange;
  useEffect(() => {
    handleCodeChangeRef.current(editorCode);
  }, [editorCode]);

  const [fullsizeEditorOpen, setFullsizeEditorOpen] = useState(false);
  const openFullsizeEditor = useCallback(() => {
    setEditorCode(editorCode);
    setFullsizeEditorOpen(true);
  }, [editorCode]);
  const closeFullsizeEditor = useCallback(() => {
    setFullsizeEditorOpen(false);
  }, []);

  const handleEditorCodeChange = useCallback(
    (code: string | undefined) => {
      setEditorCode(code);
    },
    [setEditorCode],
  );
  const submitEditorCode = useCallback(() => {
    closeFullsizeEditor();
  }, [closeFullsizeEditor]);

  const handleApplyTemplate = useCallback(() => {
    handleEditorCodeChange(TEMPLATE_CODE);
  }, [handleEditorCodeChange]);

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyButton onClick={handleApplyTemplate}>Fill with Template</PropertyButton>
        <CodeEditorWrapper>
          <StyledMonacoEditor
            language="json"
            value={editorCode}
            options={options}
            onChange={handleEditorCodeChange}
          />
        </CodeEditorWrapper>
        <PropertyInlineWrapper label="">
          <Tools>
            <Tool valid={codeValid ? 1 : 0}>
              {codeValid ? <CheckOutlinedIcon /> : <ErrorOutlineOutlinedIcon />}JSON
            </Tool>
            <Tool valid={1} clickable={1} onClick={openFullsizeEditor}>
              <OpenInFullIcon />
            </Tool>
          </Tools>
        </PropertyInlineWrapper>
        <PropertyInfo>
          Plasese Don&apos;t use this together with other color components.
        </PropertyInfo>
      </PropertyBox>
      <EditorDialog
        title="Custom Legend Editor"
        open={fullsizeEditorOpen}
        fullWidth
        onClose={closeFullsizeEditor}
        onSubmit={submitEditorCode}>
        <MonacoEditor
          language="json"
          height={"80vh"}
          value={editorCode}
          options={options}
          onChange={handleEditorCodeChange}
        />
      </EditorDialog>
    </PropertyWrapper>
  );
};

const CodeEditorWrapper = styled("div")({
  position: "relative",
  height: 200,
  width: "100%",
});

const Tools = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
  justifyContent: "flex-end",
}));

const Tool = styled("div")<{ valid: number; clickable?: number }>(
  ({ valid, clickable, theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    color: "#fff",
    fontSize: "11px",
    padding: theme.spacing(0.2, 0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: valid ? theme.palette.success.light : theme.palette.error.light,
    opacity: 0.5,
    cursor: clickable ? "pointer" : "default",

    [`& .${svgIconClasses.root}`]: {
      fontSize: 16,
    },
  }),
);

const StyledMonacoEditor = styled(MonacoEditor)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
}));

type CustomLegendType = "square" | "circle" | "line" | "icon";

type CustomLegendItem = {
  type?: CustomLegendType;
  title?: string;
  color?: string;
  strokeColor?: string;
  url?: string;
};

export type CustomLegends = {
  type?: CustomLegendType;
  name?: string;
  legends?: CustomLegendItem[];
};

const TEMPLATE_CODE = `{
  "overrides": [
    {
      "propertyName": "津波浸水想定",
      "matcher": "startsWith",
      "colorSet": [
        {
          "value": 6,
          "color": "#F9FD4C",
          "name": "0.3m未満"
        },
        {
          "value": 5,
          "color": "#F9FD4C",
          "name": "0.3m未満"
        },
        {
          "value": 4,
          "color": "#F9FD4C",
          "name": "0.3m未満"
        },
        {
          "value": 3,
          "color": "#F9FD4C",
          "name": "0.3m未満"
        }
      ]
    }
  ]
}`;
