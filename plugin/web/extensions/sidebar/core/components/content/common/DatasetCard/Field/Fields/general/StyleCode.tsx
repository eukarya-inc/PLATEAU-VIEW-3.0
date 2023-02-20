import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseFieldProps } from "../types";

const StyleCode: React.FC<BaseFieldProps<"styleCode">> = ({ value, editMode, onUpdate }) => {
  const [code, editCode] = useState(value.src);

  const handleEditCode = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      editCode(e.currentTarget.value);
      onUpdate({
        ...value,
        src: code,
      });
    },
    [code, onUpdate, value],
  );

  return editMode ? (
    <Wrapper>
      <Field>
        <CodeEditor value={code} onChange={handleEditCode} />
      </Field>
    </Wrapper>
  ) : null;
};

export default StyleCode;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Field = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  height: 160px;
  padding: 8px;
  gap: 8px;
`;

const CodeEditor = styled.textarea`
  height: 144px;
  width: 280px;
  flex: 1;
  padding: 0 12px;
  border: none;
  overflow: auto;
  background: #f3f3f3;
  outline: none;
  :focus {
    border: none;
  }
`;
