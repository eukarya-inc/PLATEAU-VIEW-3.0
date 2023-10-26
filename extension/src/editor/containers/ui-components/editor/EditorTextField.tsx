import { styled, TextField, TextFieldProps, inputBaseClasses } from "@mui/material";

import { EditorCommonLabel } from "./EditorCommonField";

export type EditorTextFieldProps = TextFieldProps;

export const EditorTextField: React.FC<EditorTextFieldProps> = ({ label, ...props }) => {
  return (
    <Wrapper>
      <EditorCommonLabel>{label}</EditorCommonLabel>
      <EditorTextInput {...props} />
    </Wrapper>
  );
};

export const EditorTextInput: React.FC<TextFieldProps> = ({ ...props }) => {
  return <StyledTextField size="small" variant="outlined" fullWidth {...props} />;
};

const Wrapper = styled("div")(() => ({
  width: "100%",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  [`.${inputBaseClasses.input}`]: {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
  },
}));
