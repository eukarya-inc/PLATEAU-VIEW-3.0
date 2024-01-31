import LoadingIcon from "@ant-design/icons/LoadingOutlined";
import { IconButton, Typography, styled, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import { FC } from "react";

import { PaperPlane, CopyIcon } from "../../../prototypes/ui-components/icons";
import Modal from "../Modal";

const LoadingContainer = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
  margin: "5rem 0",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  margin: "0px",
  padding: "12px 24px",
  marginBottom: "12px",
  color: theme.palette.text.primary,
}));

const StyledField = styled("div")(({ theme }) => ({
  // TODO: What's neutral/5 color in figma??
  border: `1px solid ${theme.palette.grey[300]}`,
  padding: "6px 12px",
  borderRadius: "2px 0 0 2px",
  width: "100%",
}));

const FieldContainer = styled("div")(() => ({
  display: "flex",
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
  borderLeft: "none",
  borderRadius: "0 2px 2px 0",
}));

export type Props = {
  show: boolean;
  loading?: boolean;
  url?: string;
  iframe?: string;
  onClose?: () => void;
};

const ShareModal: FC<Props> = ({ show, onClose, loading, url, iframe }) => {
  const handleCopyToClipboard = (value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
  };
  return (
    <Modal
      isVisible={show}
      title="シェア"
      titleIcon={<PaperPlane sx={{ mt: 0.85 }} />}
      onClose={onClose}>
      {loading ? (
        <LoadingContainer>
          <LoadingIcon />
        </LoadingContainer>
      ) : (
        <StyledBox sx={{ typography: "body1", borderTop: "1px solid #0000001f" }}>
          <Typography>URLで共有</Typography>
          <FieldContainer>
            <StyledField>{url ? url : "URL TODO: Dyamic Value from Prop"} </StyledField>
            <IconButtonStyled onClick={() => handleCopyToClipboard(url)}>
              <CopyIcon />
            </IconButtonStyled>
          </FieldContainer>

          <Typography>HTMLページへの埋め込みは下記のコードをお使いください：</Typography>
          <FieldContainer>
            <StyledField>{iframe ? iframe : "Iframe TODO: Dyamic Value from Prop"} </StyledField>
            <IconButtonStyled onClick={() => handleCopyToClipboard(iframe)}>
              <CopyIcon />
            </IconButtonStyled>
          </FieldContainer>
        </StyledBox>
      )}
    </Modal>
  );
};

export default ShareModal;
