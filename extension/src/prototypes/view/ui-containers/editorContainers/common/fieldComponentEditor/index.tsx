import { useState, useCallback } from "react";

import { ComponentGroup } from "../../../../../../shared/api/types";
import { generateID } from "../../utils";

import { ComponentGroups } from "./ComponentGroups";

type FieldComponentEditorProps = {
  fieldComponentsGroups: ComponentGroup[] | undefined;
};

export const FieldComponentEditor: React.FC<FieldComponentEditorProps> = ({
  fieldComponentsGroups,
}) => {
  const [groups, setGroups] = useState<ComponentGroup[]>(
    fieldComponentsGroups ?? [
      {
        id: generateID(),
        name: "Default",
        default: true,
        components: [],
      },
      {
        id: generateID(),
        name: "Default2",
        components: [],
      },
    ],
  );
  const [currentGroup, setCurrentGroup] = useState<ComponentGroup | undefined>(groups[0]);

  const handleGroupSelect = useCallback(
    (id: string) => {
      setCurrentGroup(groups.find(g => g.id === id));
    },
    [groups],
  );

  const handleGroupCreate = useCallback(() => {
    const newGroup: ComponentGroup = {
      id: generateID(),
      name: "New Group",
      components: [],
    };
    setGroups([...groups, newGroup]);
  }, [groups]);

  const handleGroupDelete = useCallback(
    (id: string) => {
      if (groups.length <= 1) {
        return;
      }
      setGroups(groups.filter(g => g.id !== id));
    },
    [groups],
  );

  const handleGroupRename = useCallback(
    (id: string, name: string) => {
      setGroups(groups.map(g => (g.id === id ? { ...g, name } : g)));
    },
    [groups],
  );

  const handleGroupMove = useCallback(
    (id: string, direction: "forward" | "backward") => {
      const index = groups.findIndex(g => g.id === id);
      if (
        index === -1 ||
        (direction === "forward" && index === 0) ||
        (direction === "backward" && index === groups.length - 1)
      )
        return;
      const newGroups = [...groups];
      const [removed] = newGroups.splice(index, 1);
      if (direction === "forward") {
        newGroups.splice(index - 1, 0, removed);
      } else {
        newGroups.splice(index + 1, 0, removed);
      }
      setGroups(newGroups);
    },
    [groups],
  );

  return (
    <ComponentGroups
      groups={groups}
      currentGroup={currentGroup}
      onGroupSelect={handleGroupSelect}
      onGroupCreate={handleGroupCreate}
      onGroupDelete={handleGroupDelete}
      onGroupRename={handleGroupRename}
      onGroupMove={handleGroupMove}
    />
  );
};
