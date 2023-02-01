import { Icon, Dropdown } from "@web/sharedComponents";
import { styled } from "@web/theme";

type Props = {
  className?: string;
  text: string;
  items?: JSX.Element;
  direction?:
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight"
    | "top"
    | "bottom"
    | undefined;
  onClick?: () => void;
};

const AddButton: React.FC<Props> = ({ className, text, items, direction = "bottom", onClick }) => {
  return items ? (
    <Dropdown overlay={items} placement={direction} trigger={["click"]}>
      <StyledButton className={className}>
        <Icon icon="plus" size={14} />
        <Text>{text}</Text>
      </StyledButton>
    </Dropdown>
  ) : (
    <StyledButton className={className} onClick={onClick}>
      <Icon icon="plus" size={14} />
      <Text>{text}</Text>
    </StyledButton>
  );
};

export default AddButton;

const StyledButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 5px;
  height: 32px;
  cursor: pointer;

  :hover {
    background: #f4f4f4;
  }
`;

const Text = styled.p`
  margin: 0;
  line-height: 15px;
`;
