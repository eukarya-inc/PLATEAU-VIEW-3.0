import { styled } from "@mui/material";

type PropertyPlaceHolderProps = {
  children?: React.ReactNode;
};

export const NO_SETTINGS_FOR_THIS_COMPONNET = "No settings for this component";

export const PropertyPlaceHolder: React.FC<PropertyPlaceHolderProps> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled("div")(({ theme }) => ({
  width: "100%",
  minHeight: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
