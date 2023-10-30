import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useCallback, useMemo, useState } from "react";

import { EditorButton, EditorDialog, EditorTextInput } from "../../ui-components";

type TemplateAddButtonProps = {
  base: string;
  templateNames: string[];
  onTemplateAdd: (name: string) => void;
};

export const TemplateAddButton: React.FC<TemplateAddButtonProps> = ({
  base,
  templateNames,
  onTemplateAdd,
}) => {
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);

  const handleOpenAddTemplate = useCallback(() => {
    setAddTemplateOpen(true);
  }, []);

  const handleCloseAddTemplate = useCallback(() => {
    setAddTemplateOpen(false);
  }, []);

  const [newTemplateName, setNewTemplateName] = useState<string>(base);

  const handleNewTemplateNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTemplateName(e.target.value);
  }, []);

  const newTemplateNameInvalid = useMemo(() => {
    return templateNames.includes(newTemplateName);
  }, [newTemplateName, templateNames]);

  const handleComponentAdd = useCallback(() => {
    onTemplateAdd(newTemplateName);
  }, [newTemplateName, onTemplateAdd]);

  return (
    <>
      <EditorButton
        startIcon={<AddOutlinedIcon />}
        color="primary"
        fullWidth
        onClick={handleOpenAddTemplate}>
        New Template
      </EditorButton>
      <EditorDialog
        title="Add Template"
        open={addTemplateOpen}
        fullWidth
        primaryButtonText="Add"
        onClose={handleCloseAddTemplate}
        onSubmit={handleComponentAdd}
        submitDisabled={newTemplateNameInvalid}>
        <EditorTextInput
          title="New Template Name"
          value={newTemplateName}
          onChange={handleNewTemplateNameChange}
        />
      </EditorDialog>
    </>
  );
};
