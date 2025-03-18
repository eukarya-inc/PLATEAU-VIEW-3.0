import { Button, styled } from "@mui/material";

export const StyledButton = styled(Button)(({ theme, disabled }) => ({
  display: "flex",
  padding: theme.spacing(1, 2),
  color: disabled ? theme.palette.grey[500] : theme.palette.common.white,
  backgroundColor: disabled
    ? theme.palette.grey[50]
    : theme.palette.primary.main,
  borderRadius: "4px",
  marginLeft: "auto",
  "&:hover": {
    backgroundColor: !disabled && theme.palette.primary.main,
  },
}));
