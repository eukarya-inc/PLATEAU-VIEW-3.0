import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { Box, IconButton, Modal, Typography, styled } from "@mui/material";
import React, { ReactNode } from "react";

import { lightTheme, darkTheme } from "../../prototypes/ui-components";

type Props = {
  title?: string;
  children?: ReactNode;
  isVisible: boolean;
  isWhiteTheme?: boolean;
  titleIcon?: ReactNode;
  onClose?: () => void;
};

const SharedModal: React.FC<Props> = ({
  title,
  isVisible,
  children,
  titleIcon,
  onClose,
  isWhiteTheme = false,
}) => {
  return (
    <Modal open={isVisible} aria-labelledby="modal-modal-title">
      <StyledBox isWhiteTheme={isWhiteTheme}>
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
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
            }}>
            <CancelIcon isWhiteTheme={isWhiteTheme} />
          </IconButton>
        </Typography>
        {children}
      </StyledBox>
    </Modal>
  );
};

const StyledBox = styled(Box, {
  shouldForwardProp: prop => prop !== "isWhiteTheme",
})<{ isWhiteTheme?: boolean }>(({ theme, isWhiteTheme }) => ({
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 560,
  backgroundColor: isWhiteTheme
    ? lightTheme.palette.background.default
    : theme.palette.background.paper,
  color: isWhiteTheme ? darkTheme.palette.background.default : theme.palette.text.primary,
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

const CancelIcon = styled(ClearOutlinedIcon, {
  shouldForwardProp: prop => prop !== "isWhiteTheme",
})<{ isWhiteTheme?: boolean }>(({ theme, isWhiteTheme }) => ({
  color: isWhiteTheme ? darkTheme.palette.background.default : theme.palette.text.primary,
}));

export default SharedModal;
