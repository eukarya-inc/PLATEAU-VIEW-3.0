import { FieldTitle, FieldValue, FieldWrapper } from "../commonComponents";

type Props = {
  title: string;
  titleWidth?: number;
  value: JSX.Element;
};

const Field: React.FC<Props> = ({ title, titleWidth, value }) => {
  return (
    <FieldWrapper>
      <FieldTitle width={titleWidth}>{title}</FieldTitle>
      <FieldValue>{value}</FieldValue>
    </FieldWrapper>
  );
};

export default Field;
