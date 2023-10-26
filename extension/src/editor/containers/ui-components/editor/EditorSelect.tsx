import {
  styled,
  TextField,
  TextFieldProps,
  inputBaseClasses,
  selectClasses,
  MenuItem,
} from "@mui/material";

import { EditorCommonLabel } from "./EditorCommonField";

export type EditorSelectProps = TextFieldProps & {
  options: { value: string; label: string }[];
};

export const EditorSelect: React.FC<EditorSelectProps> = ({ label, options, ...props }) => {
  return (
    <Wrapper>
      <EditorCommonLabel>{label}</EditorCommonLabel>
      <StyledTextField size="small" variant="outlined" fullWidth select {...props}>
        {options.map(option => (
          <StyledMenuItem key={option.value} value={option.value}>
            {option.label}
          </StyledMenuItem>
        ))}
      </StyledTextField>
    </Wrapper>
  );
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

  [`.${selectClasses.select}`]: {
    padding: `${theme.spacing(0.5, 1)} !important`,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  fontSize: theme.typography.body2.fontSize,
}));
