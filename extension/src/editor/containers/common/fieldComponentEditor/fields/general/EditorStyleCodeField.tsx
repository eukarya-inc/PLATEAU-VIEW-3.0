import CodeEditor from "@uiw/react-textarea-code-editor";
import { useCallback, useMemo } from "react";

import { BasicFieldProps } from "..";
import { PropertyBox, PropertyWrapper } from "../../../../ui-components";

export const EditorStyleCodeField: React.FC<BasicFieldProps<"STYLE_CODE_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const code = useMemo(() => component.preset?.code ?? "", [component.preset?.code]);

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

  return (
    <PropertyWrapper>
      <PropertyBox>
        <CodeEditor
          value={code}
          language="json"
          placeholder="Please input the style object here"
          onChange={evn => handleCodeChange(evn.target.value)}
          padding={15}
          data-color-mode="light"
          minHeight={200}
          style={{
            fontSize: 12,
            backgroundColor: "#fff",
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </PropertyBox>
    </PropertyWrapper>
  );
};
