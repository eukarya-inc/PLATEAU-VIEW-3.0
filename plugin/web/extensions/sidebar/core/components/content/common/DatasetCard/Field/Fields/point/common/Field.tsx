import { styled } from "@web/theme";

type Props = {
  title: string;
  titleWidth?: number;
  value: JSX.Element;
};

const Field: React.FC<Props> = ({ title, titleWidth, value }) => {
  return (
    <Wrapper>
      <FieldTitle width={titleWidth}>{title}</FieldTitle>
      <FieldValue>{value}</FieldValue>
    </Wrapper>
  );
};

export default Field;

const Text = styled.p`
  margin: 0;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
`;

const FieldTitle = styled(Text)<{ width?: number }>`
  ${({ width }) => width && `width: ${width}px;`}
`;

const FieldValue = styled.div`
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  flex: 1;
  height: 100%;
  width: 100%;
`;
