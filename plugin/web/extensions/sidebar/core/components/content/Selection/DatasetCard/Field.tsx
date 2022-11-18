import { styled } from "@web/theme";
import { ReactNode } from "react";

export type Props = {
  children?: ReactNode;
  onClick?: () => void;
};

const FieldComponent: React.FC<Props> = ({ children, onClick }) => {
  return <Field onClick={onClick}>{children}</Field>;
};

export default FieldComponent;

const Field = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex: 1 0 auto;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  cursor: pointer;
`;
