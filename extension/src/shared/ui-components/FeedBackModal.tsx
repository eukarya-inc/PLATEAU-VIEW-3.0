import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  Modal,
  Typography,
  styled,
} from "@mui/material";
import { useAtom } from "jotai";

import { showFeedbackModalAtom } from "../../prototypes/view/states/app";

export const InputGroup: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <InputGroupWrapper>
      <Label>{label}</Label>
      {children}
    </InputGroupWrapper>
  );
};

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  bgcolor: "background.paper",
  color: "#000",
  margin: "auto",
  padding: "18px 22px",
};

const FeedBackModal: React.FC = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useAtom(showFeedbackModalAtom);

  return (
    <Modal
      open={showFeedbackModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          フィードバック{" "}
          <IconButton
            aria-label="close"
            onClick={value => setShowFeedbackModal(!value)}
            sx={{ position: "absolute", top: 10, right: 10 }}>
            <CancelIcon />
          </IconButton>
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }}>
          <Link href="https://www.mlit.go.jp/plateau/" underline="none">
            PLATEAU
          </Link>{" "}
          は、国土交通省が進める 3D都市モデル整備・活用・オープンデータ化
          のリーディングプロジェクトである。都市活動のプラットフォームデータとして
          3D都市モデルを整備し、
          そのユースケースを創出。さらにこれをオープンデータとして公開することで、誰もが自由に都市のデータを引き出し、活用できるようになる。
        </Typography>
        <InputGroup label="お名前">
          <Input type="text" placeholder="お名前" value={"value"} onChange={() => {}} />
        </InputGroup>
        <InputGroup label="メールアドレス">
          <Input
            required
            type="text"
            placeholder="メールアドレス"
            value={"value"}
            onChange={() => {}}
          />
        </InputGroup>
        <InputGroup label="コメントまたは質問">
          <TextArea
            required
            placeholder="コメントまたは質問"
            rows={8}
            value={"value"}
            onChange={() => {}}
          />
        </InputGroup>
        <FormControlLabel required control={<Checkbox />} label="マップレビューを添付する" />
        <StyledButton>送信</StyledButton>
      </Box>
    </Modal>
  );
};

const InputGroupWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
}));

const Label = styled("label")(() => ({
  fontSize: "0.85rem",
  fontWeight: "400",
  paddingTop: "12px",
}));

const Input = styled("input")(() => ({
  flex: "auto",
  background: "#F3F3F3",
  border: "1px solid #F3F3F3",
  borderRadius: "4px",
  outline: "none",
  padding: "8px 10px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const TextArea = styled("textarea")(() => ({
  flex: "auto",
  background: "#F3F3F3",
  border: "1px solid #F3F3F3",
  borderRadius: "4px",
  outline: "none",
  padding: "8px 10px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  backgroundColor: "#f3f3f3",
  borderRadius: "4px",
  marginLeft: "auto",
}));

export default FeedBackModal;
