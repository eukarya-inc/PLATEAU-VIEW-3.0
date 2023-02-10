import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseFieldProps, ButtonLink } from "../types";

const ButtonLink: React.FC<BaseFieldProps<"buttonLink">> = ({ editMode }) => {
  const [CurrentButton, setCurrentButton] = useState<ButtonLink>();

  const handleChangeButtonTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentButton(btn => {
      if (!btn) return;
      return { ...btn, title: e.currentTarget.value };
    });
  }, []);

  const handleChangeButtonLink = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentButton(btn => {
      if (!btn) return;
      return { ...btn, link: e.currentTarget.value };
    });
  }, []);
  return editMode ? (
    <Wrapper>
      <Field>
        <FieldTitle>タイトル</FieldTitle>
        <FieldValue>
          <TextInput onChange={handleChangeButtonTitle} />
        </FieldValue>
      </Field>

      <Field>
        <FieldTitle>リンク</FieldTitle>
        <FieldValue>
          <TextInput onChange={handleChangeButtonLink} />
        </FieldValue>
      </Field>
    </Wrapper>
  ) : (
    <Wrapper>
      <Field>
        <FieldValue>
          <StyledButton onClick={() => window.open(CurrentButton?.link, "_blank", "noopener")}>
            <Text>{CurrentButton?.title}</Text>
          </StyledButton>
        </FieldValue>
      </Field>
    </Wrapper>
  );
};

export default ButtonLink;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Text = styled.p`
  margin: 0;
`;

const Field = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  height: 32px;
`;

const FieldTitle = styled(Text)`
  width: 82px;
`;

const FieldValue = styled.div`
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  flex: 1;
  height: 100%;
  width: 100%;
`;

const TextInput = styled.input.attrs({ type: "text" })`
  height: 100%;
  width: 100%;
  flex: 1;
  padding: 0 12px;
  border: none;
  outline: none;

  :focus {
    border: none;
  }
`;

const StyledButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 1px 8px;
  background: #00bebe;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  height: 270px;
  width: 24px;
  cursor: pointer;
`;
