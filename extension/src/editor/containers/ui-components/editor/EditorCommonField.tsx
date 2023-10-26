import { styled } from "@mui/material";

type EditorCommonFieldProps = {
  label?: string;
  children?: React.ReactNode;
};

export const EditorCommonField: React.FC<EditorCommonFieldProps> = ({ label, children }) => {
  return (
    <Wrapper>
      <EditorCommonLabel>{label}</EditorCommonLabel>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  width: "100%",
}));

export const EditorCommonLabel = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const FieldLineWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "nowrap",
}));
