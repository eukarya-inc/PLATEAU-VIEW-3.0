import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useCallback, useState, useMemo } from "react";

import { ComponentGroup } from "../../../../../../shared/api/types";
import { ComponentSelector, EditorButton, EditorDialog } from "../../../../../ui-components";
import { UpdateSetting } from "../../dataset";
import { generateID } from "../../utils";

import { fields, fieldCatagories, type FieldType } from "./fields";

type ComponentAddButtonProps = {
  currentGroup?: ComponentGroup;
  updateSetting?: UpdateSetting;
};

export const ComponentAddButton: React.FC<ComponentAddButtonProps> = ({
  currentGroup,
  updateSetting,
}) => {
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
    updateSetting?.(s => {
      if (!s) return s;
      s.fieldComponents?.groups
        ?.find(g => g.id === currentGroup?.id)
        ?.components.push({
          id: generateID(),
          type: newComponentType,
        });
      return { ...s };
    });
    setAddComponentOpen(false);
  }, [currentGroup?.id, newComponentType, updateSetting]);

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
        <ComponentSelector tree={componentTree} onComponentSelect={handleComponentTypeSelect} />
      </EditorDialog>
    </>
  );
};
