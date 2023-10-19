import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { styled } from "@mui/material";

import { ComponentGroup } from "../../../../../../shared/api/types";
import { ComponentGroupButton } from "../../../../../ui-components";

import { ComponentGroupItem } from "./ComponentGroupItem";

type ComponentGroupsProps = {
  groups: ComponentGroup[];
  currentGroup: ComponentGroup | undefined;
  onGroupSelect: (id: string) => void;
  onGroupCreate: () => void;
  onGroupDelete: (id: string) => void;
};

export const ComponentGroups: React.FC<ComponentGroupsProps> = ({
  groups,
  currentGroup,
  onGroupSelect,
  onGroupCreate,
  onGroupDelete,
}) => {
  return (
    <GroupsWrapper>
      {groups.map(group => (
        <ComponentGroupItem
          key={group.id}
          group={group}
          active={group.id === currentGroup?.id}
          onGroupSelect={onGroupSelect}
          onGroupDelete={onGroupDelete}
        />
      ))}
      <ComponentGroupButton variant="outlined" onClick={onGroupCreate}>
        <AddOutlinedIcon />
        Group
      </ComponentGroupButton>
    </GroupsWrapper>
  );
};

const GroupsWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0),
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));
