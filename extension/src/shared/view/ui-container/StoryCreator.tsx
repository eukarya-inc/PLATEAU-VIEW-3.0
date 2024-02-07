import { TextField, inputBaseClasses, styled } from "@mui/material";
import { useAtom } from "jotai";
import { FC, useCallback } from "react";

import { StoryIcon } from "../../../prototypes/ui-components";
import { SharedDialog } from "../../ui-components/Dialog";
import { createStoryAtom } from "../state/story";

export const StoryCreator: FC = () => {
  const [createStory, setCreateStory] = useAtom(createStoryAtom);
  const handleClose = useCallback(() => {
    setCreateStory(false);
  }, [setCreateStory]);
  return createStory ? (
    <SharedDialog
      icon={<StoryIcon />}
      title="Create a new story"
      fullWidth
      open={createStory}
      onClose={handleClose}>
      <Label>Story name</Label>
      <StyledTextField size="medium" variant="outlined" fullWidth />
    </SharedDialog>
  ) : null;
};

const Label = styled("div")(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: theme.typography.body1.fontSize,
  marginBottom: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  [`.${inputBaseClasses.input}`]: {
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
  },
}));
