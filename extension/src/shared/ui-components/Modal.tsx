import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { Box, Button, IconButton, Modal, Typography, styled } from "@mui/material";
import React, { ReactNode } from "react";

type Props = {
  disabled?: boolean;
  title?: string;
  button1?: ReactNode;
  children?: ReactNode;
  isVisible: boolean;
  buttonTitle?: string;
  isContent?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
};

const SharedModal: React.FC<Props> = ({
  title,
  isVisible,
  disabled,
  children,
  buttonTitle,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      open={isVisible}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <StyledBox>
        <Typography
          sx={{ padding: "18px 22px" }}
          id="modal-modal-title"
          variant="subtitle1"
          component="h2">
          {title}{" "}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", top: 10, right: 10 }}>
            <CancelIcon />
          </IconButton>
        </Typography>
        {children}
        <StyledButton disabled={disabled} type="submit" onClick={onSubmit}>
          {buttonTitle}
        </StyledButton>
      </StyledBox>
    </Modal>
  );
};

const StyledBox = styled(Box)(({ theme }) => ({
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 560,
  backgroundColor: theme.palette.background.paper,
  color: "#000",
  margin: "auto",
  borderRadius: theme.shape.borderRadius,
  boxSizing: "border-box",
  maxHeight: "calc(100vh - 50px)",
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(2)})`,
    overflowY: "scroll",
  },
}));

const CancelIcon = styled(ClearOutlinedIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const StyledButton = styled(Button)(({ theme, disabled }) => ({
  display: "flex",
  padding: theme.spacing(1),
  margin: "18px 22px",
  color: theme.palette.text.primary,
  backgroundColor: disabled ? theme.palette.grey[50] : theme.palette.primary.main,
  borderRadius: "4px",
  marginLeft: "auto",
  "&:hover": {
    backgroundColor: !disabled && theme.palette.primary.main,
  },
}));

export default SharedModal;
