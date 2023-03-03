import { styled } from "@web/theme";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../types";

const PointIcon: React.FC<BaseFieldProps<"pointIcon">> = ({
  value,
  editMode,
  isActive,
  onUpdate,
}) => {
  const [imageURL, setImageURL] = useState(value.url ?? "");
  const [imageSize, setImageSize] = useState(value.size);

  const handleURLUpdate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageURL(e.currentTarget.value);
  }, []);

  const handleSizeUpdate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const size = !isNaN(parseFloat(e.currentTarget.value)) ? parseFloat(e.currentTarget.value) : 1;
    setImageSize(size);
  }, []);

  useEffect(() => {
    if (!isActive || (imageURL === value.url && imageSize === value.size)) return;
    const timer = setTimeout(() => {
      onUpdate({
        ...value,
        url: imageURL,
        size: imageSize,
        override: { marker: { style: "image", image: imageURL, imageSize } },
      });
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [imageURL, imageSize, isActive, value, onUpdate]);

  return editMode ? (
    <Wrapper>
      <Field>
        <FieldTitle>アイコンURL</FieldTitle>
        <FieldValue>
          <TextInput defaultValue={imageURL} onChange={handleURLUpdate} />
        </FieldValue>
      </Field>

      <Field>
        <FieldTitle>サイズ</FieldTitle>
        <FieldValue>
          <TextInput defaultValue={imageSize} onChange={handleSizeUpdate} />
        </FieldValue>
      </Field>
    </Wrapper>
  ) : null;
};

export default PointIcon;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Field = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  height: 32px;
`;

const Text = styled.p`
  margin: 0;
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
