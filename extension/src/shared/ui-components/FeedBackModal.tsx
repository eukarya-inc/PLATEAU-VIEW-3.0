import { FormControl } from "@mui/base/FormControl";
import { Input, inputClasses } from "@mui/base/Input";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
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
import { red } from "@mui/material/colors";
import { useCallback, useMemo, useState } from "react";

export type Props = {
  show: boolean;
  setShowFeedbackModal: (show: boolean) => void;
  onSubmit: (params: {
    name: string;
    email: string;
    comment: string;
    attachMapReview: boolean;
  }) => void;
};

const FeedBackModal: React.FC<Props> = ({ show, setShowFeedbackModal, onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [attachMapReview, setAttachMapReview] = useState(false);

  const handleFeedBackModalForm = useCallback(() => {
    setName("");
    setEmail("");
    setComment("");
    setAttachMapReview(false);
    setShowFeedbackModal(false);
  }, [setShowFeedbackModal]);

  const handleSubmit = async () => {
    const params = { name, email, comment, attachMapReview };
    try {
      await onSubmit(params);
      handleFeedBackModalForm();
    } catch {
      // if any Error occur;
    }
  };

  const handleSetName = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleSetEmail = useCallback((value: string) => {
    setEmail(value);
  }, []);

  const handleSetComment = useCallback((value: string) => {
    setComment(value);
  }, []);

  const handleSetAttachedMap = useCallback((value: boolean) => {
    setAttachMapReview(value);
  }, []);

  const disabled = useMemo(() => {
    if (comment && email) return false;
    return true;
  }, [comment, email]);

  return (
    <Modal
      open={show}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <StyledBox>
        <Typography id="modal-modal-title" variant="subtitle1" component="h2">
          フィードバック{" "}
          <IconButton
            aria-label="close"
            onClick={handleFeedBackModalForm}
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
          <StyledInput
            placeholder="お名前"
            value={name}
            onChange={e => handleSetName(e.target.value)}
          />
        </FormControl>
        <FormControl defaultValue="">
          <Label>
            メールアドレス ( <Required>必須</Required> )
          </Label>
          <StyledInput
            placeholder="メールアドレス"
            value={email}
            onChange={e => handleSetEmail(e.target.value)}
          />
        </FormControl>
        <FormControl defaultValue="">
          <Label>
            コメントまたは質問 ( <Required>必須</Required> )
          </Label>
          <StyledTextArea
            placeholder="コメントまたは質問"
            value={comment}
            minRows={3}
            onChange={e => handleSetComment(e.target.value)}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={attachMapReview}
              onChange={() => handleSetAttachedMap(!attachMapReview)}
            />
          }
          label="マップレビューを添付する"
        />
        <StyledButton disabled={disabled} type="submit" onClick={handleSubmit}>
          送信
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
  padding: "18px 22px",
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(2)})`,
    overflowY: "scroll",
  },
}));

const StyledInput = styled(Input)(
  ({ theme }) => `
    .${inputClasses.input} {
      width: 94%;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5;
      padding: 8px 12px;
      border-radius: 4px;
      background: ${theme.palette.grey[50]};
      border: 1px solid ${theme.palette.grey[50]};
      margin-bottom: 12px;
      outline: none;
    }
  `,
);

const CancelIcon = styled(ClearOutlinedIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const StyledTextArea = styled(TextareaAutosize)(({ theme }) => ({
  background: theme.palette.grey[50],
  width: "94%",
  border: `1px solid ${theme.palette.grey[50]}`,
  color: theme.palette.text.primary,
  borderRadius: "4px",
  outline: "none",
  padding: "8px 12px",
  fontSize: "0.875rem",
}));

const Label = styled("div")(() => ({
  fontSize: "0.875rem",
  marginBottom: "10px",
}));

const Required = styled("span")(() => ({
  color: red[500],
}));

const StyledButton = styled(Button)(({ theme, disabled }) => ({
  display: "flex",
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  backgroundColor: disabled ? theme.palette.grey[50] : theme.palette.primary.main,
  borderRadius: "4px",
  marginLeft: "auto",
  "&:hover": {
    backgroundColor: !disabled && theme.palette.primary.main,
  },
}));

export default FeedBackModal;
