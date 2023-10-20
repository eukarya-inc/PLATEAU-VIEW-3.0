import { styled } from "@mui/material";

import { ComponentGroup } from "../../../../../../shared/api/types";
import { UpdateSetting } from "../../dataset";

import { ComponentAddButton } from "./ComponentAddButton";
import { ComponentGroups } from "./ComponentGroups";
import { ComponentItem } from "./ComponentItem";
import useGroups from "./useGroups";

type FieldComponentEditorProps = {
  fieldComponentsGroups: ComponentGroup[] | undefined;
  hidden?: boolean;
  updateSetting?: UpdateSetting;
};

export const FieldComponentEditor: React.FC<FieldComponentEditorProps> = ({
  fieldComponentsGroups,
  hidden,
  updateSetting,
}) => {
  const {
    groups,
    currentGroup,
    handleGroupSelect,
    handleGroupCreate,
    handleGroupDelete,
    handleGroupRename,
    handleGroupMove,
  } = useGroups({ fieldComponentsGroups, updateSetting });

  return (
    <FieldComponentEditorWrapper hidden={hidden}>
      <ComponentGroups
        groups={groups}
        currentGroup={currentGroup}
        onGroupSelect={handleGroupSelect}
        onGroupCreate={handleGroupCreate}
        onGroupDelete={handleGroupDelete}
        onGroupRename={handleGroupRename}
        onGroupMove={handleGroupMove}
      />
      {currentGroup?.components.map(component => (
        <ComponentItem key={component.id} component={component} />
      ))}
      <ComponentAddButton currentGroup={currentGroup} updateSetting={updateSetting} />
    </FieldComponentEditorWrapper>
  );
};

const FieldComponentEditorWrapper = styled("div")<{ hidden?: boolean }>(({ theme, hidden }) => ({
  display: hidden ? "none" : "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));
