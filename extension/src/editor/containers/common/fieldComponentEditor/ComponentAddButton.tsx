import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useCallback, useState, useMemo } from "react";

import { ComponentSelector, EditorButton, EditorDialog } from "../../ui-components";

import { fields, fieldCatagories, type FieldType } from "./fields";

type ComponentAddButtonProps = {
  onComponentAdd?: (type: FieldType) => void;
};

export const ComponentAddButton: React.FC<ComponentAddButtonProps> = ({ onComponentAdd }) => {
  const [addComponentOpen, setAddComponentOpen] = useState(false);

  const handleOpenAddComponent = useCallback(() => {
    setAddComponentOpen(true);
  }, []);

  const handleCloseAddComponent = useCallback(() => {
    setAddComponentOpen(false);
  }, []);

  const componentTree = useMemo(
    () =>
      fieldCatagories.map(c => ({
        label: c,
        value: c,
        children: Object.entries(fields)
          .filter(([_, v]) => v.category === c)
          .map(([k, v]) => ({ label: v.name, value: k })),
      })),
    [],
  );

  const [newComponentType, setNewComponentType] = useState<FieldType>();

  const handleComponentTypeSelect = useCallback((type: string) => {
    setNewComponentType(type as FieldType);
  }, []);

  const handleComponentAdd = useCallback(() => {
    if (!newComponentType) return;
    onComponentAdd?.(newComponentType);
    setAddComponentOpen(false);
  }, [newComponentType, onComponentAdd]);

  return (
    <>
      <EditorButton variant="contained" fullWidth onClick={handleOpenAddComponent}>
        <AddOutlinedIcon />
        Add Component
      </EditorButton>
      <EditorDialog
        title="Add Component"
        open={addComponentOpen}
        fullWidth
        primaryButtonText="Add"
        onClose={handleCloseAddComponent}
        onSubmit={handleComponentAdd}
        submitDisabled={!newComponentType}>
        <ComponentSelector
          tree={componentTree}
          onComponentSelect={handleComponentTypeSelect}
          onComponentDoubleClick={handleComponentAdd}
        />
      </EditorDialog>
    </>
  );
};
