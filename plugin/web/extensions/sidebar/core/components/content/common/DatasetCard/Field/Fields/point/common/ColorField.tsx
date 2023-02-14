import { styled } from "@web/theme";

import { FieldTitle, FieldValue, FieldWrapper, TextInput } from "./styled";

type Props = {
  title: string;
  titleWidth?: number;
  color?: string;
};

const ColorField: React.FC<Props> = ({ title, titleWidth, color }) => {
  return (
    <FieldWrapper>
      <FieldTitle width={titleWidth}>{title}</FieldTitle>
      <FieldValue>
        <ColorBlock color={color ?? ""} />
        <TextInput value={color ?? ""} />
      </FieldValue>
    </FieldWrapper>
  );
};

export default ColorField;

const ColorBlock = styled.div<{ color: string; legendStyle?: "circle" | "square" | "line" }>`
  width: 30px;
  height: ${({ legendStyle }) => (legendStyle === "line" ? "3px" : "30px")};
  background: ${({ color }) => color ?? "#d9d9d9"};
  border-radius: ${({ legendStyle }) =>
    legendStyle
      ? legendStyle === "circle"
        ? "50%"
        : legendStyle === "line"
        ? "5px"
        : "2px"
      : "1px 0 0 1px"};
`;
