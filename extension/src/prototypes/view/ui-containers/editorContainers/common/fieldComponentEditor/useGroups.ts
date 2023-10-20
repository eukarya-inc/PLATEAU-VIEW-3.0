import { useState, useCallback, useEffect, useMemo } from "react";

import { ComponentGroup } from "../../../../../../shared/api/types";
import { generateID } from "../../utils";

import { FieldType } from "./fields";

type Props = {
  componentsGroups: ComponentGroup[];
  onComponentGroupsUpdate: (groups: ComponentGroup[]) => void;
};

export default ({ componentsGroups, onComponentGroupsUpdate }: Props) => {
  const [currentGroupId, setCurrentGroupId] = useState<string | undefined>();

  const currentGroup = useMemo(() => {
    return componentsGroups?.find(g => g.id === currentGroupId);
  }, [currentGroupId, componentsGroups]);

  const handleGroupSelect = useCallback((id: string) => {
    setCurrentGroupId(id);
  }, []);

  const handleGroupCreate = useCallback(() => {
    const newGroup: ComponentGroup = {
      id: generateID(),
      name: "New Group",
      components: [],
    };
    onComponentGroupsUpdate([...componentsGroups, newGroup]);
  }, [componentsGroups, onComponentGroupsUpdate]);

  const handleGroupDelete = useCallback(
    (id: string) => {
      if (componentsGroups.length <= 1) {
        return;
      }
      onComponentGroupsUpdate(componentsGroups.filter(g => g.id !== id));
    },
    [componentsGroups, onComponentGroupsUpdate],
  );

  const handleGroupRename = useCallback(
    (id: string, name: string) => {
      onComponentGroupsUpdate(componentsGroups.map(g => (g.id === id ? { ...g, name } : g)));
    },
    [componentsGroups, onComponentGroupsUpdate],
  );

  const handleGroupMove = useCallback(
    (id: string, direction: "forward" | "backward") => {
      const index = componentsGroups.findIndex(g => g.id === id);
      if (
        index === -1 ||
        (direction === "forward" && index === 0) ||
        (direction === "backward" && index === componentsGroups.length - 1)
      )
        return;
      const newGroups = [...componentsGroups];
      const [removed] = newGroups.splice(index, 1);
      if (direction === "forward") {
        newGroups.splice(index - 1, 0, removed);
      } else {
        newGroups.splice(index + 1, 0, removed);
      }
      onComponentGroupsUpdate(newGroups);
    },
    [componentsGroups, onComponentGroupsUpdate],
  );

  const handleComponentAdd = useCallback(
    (type: FieldType) => {
      if (!currentGroup) return;
      const newGroup = {
        ...currentGroup,
        components: [...currentGroup.components, { id: generateID(), type }],
      };
      onComponentGroupsUpdate(componentsGroups.map(g => (g.id === currentGroup.id ? newGroup : g)));
    },
    [currentGroup, componentsGroups, onComponentGroupsUpdate],
  );

  // select default group if there is no selected group
  useEffect(() => {
    if (componentsGroups.length > 0 && !currentGroup) {
      setCurrentGroupId(componentsGroups[0].id);
    }
  }, [componentsGroups, currentGroup]);

  return {
    currentGroup,
    handleGroupSelect,
    handleGroupCreate,
    handleGroupDelete,
    handleGroupRename,
    handleGroupMove,
    handleComponentAdd,
  };
};
