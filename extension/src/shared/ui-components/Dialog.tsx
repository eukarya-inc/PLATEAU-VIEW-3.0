import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import {
  styled,
  Dialog,
  DialogProps,
  dialogClasses,
  DialogTitle,
  DialogContent,
  DialogActions,
  buttonClasses,
  Button,
  svgIconClasses,
  IconButton,
} from "@mui/material";

export type SharedDialogProps = DialogProps & {
  icon?: React.ReactNode;
  submitDisabled?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onClose?: () => void;
  onSubmit?: () => void;
};

export const SharedDialog: React.FC<SharedDialogProps> = ({
  icon,
  title,
  submitDisabled,
  primaryButtonText = "Submit",
  secondaryButtonText = "Cancel",
  children,
  onClose,
  onSubmit,
  ...props
}) => {
  return (
    <StyledDialog {...props}>
      <DialogHeader>
        <Title>
          {icon}
          <StyledDialogTitle>{title}</StyledDialogTitle>
        </Title>
        <CloseButton onClick={onClose}>
          <ClearOutlinedIcon />
        </CloseButton>
      </DialogHeader>
      <StyledDialogContent>{children}</StyledDialogContent>
      <StyledDialogActions>
        <StyledButton variant="contained" size="medium" onClick={onClose}>
          {secondaryButtonText}
        </StyledButton>
        <StyledButton
          variant="contained"
          size="medium"
          color="primary"
          onClick={onSubmit}
          disabled={!!submitDisabled}>
          {primaryButtonText}
        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

const StyledDialog = styled(Dialog)(() => ({
  [`.${dialogClasses.paper}`]: {
    maxWidth: "560px",
  },
}));

const DialogHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Title = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  fontWeight: "normal",
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  [`&.${buttonClasses.containedPrimary}`]: {
    color: "#fff",
  },
  [`.${svgIconClasses.root}`]: {
    width: "18px",
    marginRight: theme.spacing(0.5),
  },
}));
