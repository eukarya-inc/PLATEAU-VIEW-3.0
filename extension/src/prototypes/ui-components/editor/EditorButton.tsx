import { styled, Button, ButtonProps, buttonClasses } from "@mui/material";

export type EditorButtonProps = ButtonProps;

export const EditorButton: React.FC<EditorButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton color="primary" {...props}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  height: "28px",
  fontSize: theme.typography.body2.fontSize,
  [`&.${buttonClasses.containedPrimary}`]: {
    color: "#fff",
  },
}));
