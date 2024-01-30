import LoadingIcon from "@ant-design/icons/LoadingOutlined";
import { Typography, styled } from "@mui/material";
import Box from "@mui/material/Box";
import { FC } from "react";

import { PaperPlane, CopyIcon } from "../../../prototypes/ui-components/icons";
import Modal from "../Modal";

const LoadingContainer = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
  margin: "5rem 0",
}));

const StyledBox = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  margin: "0px",
  padding: "12px 24px",
  marginBottom: "12px",
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

const IconContainer = styled("div")(({ theme }) => ({
  padding: "4px",
  border: `1px solid ${theme.palette.grey[300]}`,
  borderLeft: "none",
  borderRadius: "0 2px 2px 0",
  cursor: "pointer",
}));

export type Props = {
  show: boolean;
  loading?: boolean;
  url?: string;
  iframe?: string;
  onClose?: () => void;
};

const ShareModal: FC<Props> = ({ show, onClose, loading, url, iframe }) => {
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
            <StyledField>URL {url ? url : "TODO: Dyamic Value from Prop"} </StyledField>
            <IconContainer>
              <CopyIcon />
            </IconContainer>
          </FieldContainer>

          <Typography>HTMLページへの埋め込みは下記のコードをお使いください：</Typography>
          <FieldContainer>
            <StyledField>Iframe {iframe ? iframe : "TODO: Dyamic Value from Prop"} </StyledField>
            <IconContainer>
              <CopyIcon />
            </IconContainer>
          </FieldContainer>
        </StyledBox>
      )}
    </Modal>
  );
};

export default ShareModal;
