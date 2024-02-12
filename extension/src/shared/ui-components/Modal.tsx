import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { Box, IconButton, Modal, Typography, styled } from "@mui/material";
import React, { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
  isVisible: boolean;
  titleIcon?: ReactNode;
  onClose?: () => void;
};

const SharedModal: React.FC<Props> = ({ title, isVisible, children, titleIcon, onClose }) => {
  return (
    <Modal open={isVisible} aria-labelledby="modal-modal-title">
      <StyledBox>
        <Typography
          sx={{ padding: "14px 22px", display: "flex" }}
          id="modal-modal-title"
          variant="subtitle1"
          component="h2">
          {titleIcon}
          {title}{" "}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", top: 10, right: 10 }}>
            <CancelIcon />
          </IconButton>
        </Typography>
        {children}
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
  color: theme.palette.text.primary,
  margin: "auto",
  borderRadius: theme.shape.borderRadius,
  boxSizing: "border-box",
  maxHeight: "calc(100vh - 50px)",
  overflowY: "auto",
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(2)})`,
    overflowY: "scroll",
  },
}));

const CancelIcon = styled(ClearOutlinedIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

export default SharedModal;
