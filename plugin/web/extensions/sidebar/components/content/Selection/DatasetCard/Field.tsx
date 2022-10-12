import { styled } from "@web/theme";
import { ReactNode } from "react";

export type Props = {
  children?: ReactNode;
};

const FieldComponent: React.FC<Props> = ({ children }) => {
  return <Field>{children}</Field>;
};

export default FieldComponent;

const Field = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1 0 auto;
  padding: 8px;
  background: #ffffff;
  border-radius: 4px;
`;
