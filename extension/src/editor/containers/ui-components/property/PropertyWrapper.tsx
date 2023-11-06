import { styled } from "@mui/material";

export const PropertyWrapper = styled("div")(() => ({
  width: "100%",
  display: "flex",
  alignItems: "stretch",
}));

export const PropertyBox = styled("div")<{ asMenu?: boolean }>(({ theme, asMenu }) => ({
  position: "relative",
  width: asMenu ? "130px" : "100%",
  display: "flex",
  padding: theme.spacing(0.5),
  flexDirection: "column",
  flexShrink: asMenu ? 0 : 1,
  flexGrow: asMenu ? 0 : 1,
  gap: theme.spacing(0.5),
  flexWrap: "wrap",
  borderRight: asMenu ? `1px solid ${theme.palette.divider}` : "none",
}));

export const PropertyLineWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

type PropertyInlineWrapperProps = {
  label: string;
  children: React.ReactNode;
};
export const PropertyInlineWrapper: React.FC<PropertyInlineWrapperProps> = ({
  label,
  children,
}) => {
  return (
    <InlineWrapper>
      <InlineLabel>{label}</InlineLabel>
      <InlineValue>{children}</InlineValue>
    </InlineWrapper>
  );
};

const InlineWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

const InlineLabel = styled("div")(({ theme }) => ({
  width: "130px",
  flex: "0 0 auto",
  padding: theme.spacing(0, 0.5),
}));

const InlineValue = styled("div")(() => ({
  flex: "1 1 auto",
}));
