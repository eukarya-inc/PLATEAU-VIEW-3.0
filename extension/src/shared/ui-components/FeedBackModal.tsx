import { FormControl } from "@mui/base/FormControl";
import { Input, inputClasses } from "@mui/base/Input";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
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
import { useState } from "react";

import { HelperText } from "../../prototypes/ui-components/HelperText";
import { Label } from "../../prototypes/ui-components/InputLabel";
import { showFeedbackModalAtom } from "../../prototypes/view/states/app";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [attachMapReview, setAttachMapReview] = useState(false);

  const handleSubmit = () => {
    setName("");
    setEmail("");
    setComment("");
    setAttachMapReview(false);
    setShowFeedbackModal(false);
  };

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
            onClick={() => setShowFeedbackModal(false)}
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
        <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1.5 }}>
          ご意見をお聞かせください
        </Typography>
        <FormControl defaultValue="">
          <Label>お名前</Label>
          <StyledInput placeholder="お名前" value={name} onChange={e => setName(e.target.value)} />
        </FormControl>
        <FormControl defaultValue="" required>
          <Label>メールアドレス</Label>
          <StyledInput
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <HelperText />
        </FormControl>
        <FormControl defaultValue="" required>
          <Label>コメントまたは質問</Label>
          <StyledTextArea
            placeholder="コメントまたは質問"
            value={comment}
            minRows={3}
            onChange={e => setComment(e.target.value)}
          />
          <HelperText />
        </FormControl>
        <FormControlLabel
          required
          control={
            <Checkbox
              checked={attachMapReview}
              onChange={() => setAttachMapReview(!attachMapReview)}
            />
          }
          label="マップレビューを添付する"
        />
        <StyledButton type="submit" onClick={handleSubmit}>
          送信
        </StyledButton>
      </Box>
    </Modal>
  );
};

const StyledInput = styled(Input)(
  () => `
    .${inputClasses.input} {
      width: 94%;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5;
      padding: 8px 12px;
      border-radius: 4px;
      background: #f3f3f3;
      border: 1px solid #f3f3f3;
      margin-bottom: 12px;
      outline: none;
    }
  `,
);

const StyledTextArea = styled(TextareaAutosize)(({ theme }) => ({
  background: "#f3f3f3",
  width: "94%",
  border: "1px solid #f3f3f3",
  color: theme.palette.text.primary,
  borderRadius: "4px",
  outline: "none",
  padding: "8px 12px",
  fontSize: "0.875rem",
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
