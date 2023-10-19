import { useCallback, useState, useRef } from "react";

import { ComponentGroup } from "../../../../../../shared/api/types";
import {
  ComponentGroupSplitButton,
  EditorPopper,
  EditorPopperList,
  EditorPopperListItemButton,
} from "../../../../../ui-components";
import { EditorClickAwayListener } from "../EditorClickAwayListener";

type ComponentGroupItemProps = {
  group: ComponentGroup;
  active?: boolean;
  onGroupSelect?: (id: string) => void;
  onGroupDelete?: (id: string) => void;
};

export const ComponentGroupItem: React.FC<ComponentGroupItemProps> = ({
  group,
  active,
  onGroupSelect,
  onGroupDelete,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setOpen(prevOpen => !prevOpen);
  }, []);

  const handleClickAway = useCallback(() => {
    setOpen(false);
  }, []);

  const handleMainButtonClick = useCallback(() => {
    onGroupSelect?.(group.id);
  }, [group.id, onGroupSelect]);

  const handleDelete = useCallback(() => {
    onGroupDelete?.(group.id);
    setOpen(false);
  }, [group.id, onGroupDelete]);

  return (
    <EditorClickAwayListener onClickAway={handleClickAway}>
      <ComponentGroupSplitButton
        name={group.name}
        buttonRef={anchorRef}
        active={active}
        onMainButtonClick={handleMainButtonClick}
        onSideButtonClick={handleToggle}
      />
      <EditorPopper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        disablePortal>
        <EditorPopperList>
          <EditorPopperListItemButton>Rename</EditorPopperListItemButton>
          <EditorPopperListItemButton onClick={handleDelete}>Delete</EditorPopperListItemButton>
          <EditorPopperListItemButton>Move Forward</EditorPopperListItemButton>
          <EditorPopperListItemButton>Move Backward</EditorPopperListItemButton>
        </EditorPopperList>
      </EditorPopper>
    </EditorClickAwayListener>
  );
};
