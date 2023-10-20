import { useState, useCallback, useEffect } from "react";

import { ComponentGroup } from "../../../../../../shared/api/types";
import { UpdateSetting } from "../../dataset";
import { generateID } from "../../utils";

type Props = {
  fieldComponentsGroups?: ComponentGroup[];
  updateSetting?: UpdateSetting;
};

export default ({ fieldComponentsGroups, updateSetting }: Props) => {
  const [groups, setGroups] = useState<ComponentGroup[]>(fieldComponentsGroups ?? []);
  const [currentGroup, setCurrentGroup] = useState<ComponentGroup | undefined>();

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

  // Add default group if there is no group
  useEffect(() => {
    if (groups.length === 0) {
      setGroups([
        {
          id: generateID(),
          name: "Default",
          components: [],
        },
      ]);
    }
  }, [groups]);

  // select default group if there is no selected group
  useEffect(() => {
    if (groups.length > 0 && !currentGroup) {
      setCurrentGroup(groups[0]);
    }
  }, [groups, currentGroup]);

  // update settings
  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      console.log("update groups");
      return {
        ...s,
        fieldComponents: {
          ...s?.fieldComponents,
          groups,
        },
      };
    });
  }, [groups, updateSetting]);

  return {
    groups,
    currentGroup,
    handleGroupSelect,
    handleGroupCreate,
    handleGroupDelete,
    handleGroupRename,
    handleGroupMove,
  };
};
