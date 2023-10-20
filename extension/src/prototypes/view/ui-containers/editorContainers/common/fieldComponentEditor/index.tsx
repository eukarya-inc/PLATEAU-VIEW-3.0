import { styled } from "@mui/material";

import { ComponentGroup } from "../../../../../../shared/api/types";

import { ComponentAddButton } from "./ComponentAddButton";
import { ComponentGroups } from "./ComponentGroups";
import { ComponentItem } from "./ComponentItem";
import useGroups from "./useGroups";

type FieldComponentEditorProps = {
  componentsGroups: ComponentGroup[];
  hidden?: boolean;
  onComponentGroupsUpdate: (groups: ComponentGroup[]) => void;
};

export const FieldComponentEditor: React.FC<FieldComponentEditorProps> = ({
  componentsGroups,
  hidden,
  onComponentGroupsUpdate,
}) => {
  const {
    currentGroup,
    handleGroupSelect,
    handleGroupCreate,
    handleGroupDelete,
    handleGroupRename,
    handleGroupMove,
    handleComponentAdd,
  } = useGroups({ componentsGroups, onComponentGroupsUpdate });

  console.log("groups", componentsGroups);
  console.log("currentGroup", currentGroup);

  return (
    <FieldComponentEditorWrapper hidden={hidden}>
      <ComponentGroups
        groups={componentsGroups}
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
      {currentGroup && <ComponentAddButton onComponentAdd={handleComponentAdd} />}
    </FieldComponentEditorWrapper>
  );
};

const FieldComponentEditorWrapper = styled("div")<{ hidden?: boolean }>(({ theme, hidden }) => ({
  display: hidden ? "none" : "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));
