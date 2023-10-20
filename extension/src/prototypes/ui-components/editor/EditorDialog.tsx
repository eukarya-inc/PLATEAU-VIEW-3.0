import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogProps,
  dialogClasses,
  styled,
} from "@mui/material";

import { EditorButton } from "./EditorButton";

type EditorDialogProps = DialogProps & {
  open: boolean;
  title?: string;
  description?: string;
  submitDisabled?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  children?: React.ReactNode;
};

export const EditorDialog: React.FC<EditorDialogProps> = ({
  open,
  title,
  description,
  submitDisabled,
  onClose,
  onSubmit,
  children,
  ...props
}) => {
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xs" {...props}>
      {title && <StyledDialogTitle>{title}</StyledDialogTitle>}
      <StyledDialogContent>
        {description && <DialogContentText>{description}</DialogContentText>}
        {children}
      </StyledDialogContent>
      <StyledDialogActions>
        <EditorButton variant="outlined" onClick={onClose}>
          Cancel
        </EditorButton>
        <EditorButton variant="contained" onClick={onSubmit} disabled={!!submitDisabled}>
          Submit
        </EditorButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`.${dialogClasses.paper}`]: {
    padding: theme.spacing(1),
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(1, 2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(1, 2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 2),
}));
