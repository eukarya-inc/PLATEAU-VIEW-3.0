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

  return (
    <ComponentGroups
      groups={groups}
      currentGroup={currentGroup}
      onGroupSelect={handleGroupSelect}
      onGroupCreate={handleGroupCreate}
      onGroupDelete={handleGroupDelete}
    />
  );
};
