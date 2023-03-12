import { Group, Template } from "@web/extensions/sidebar/core/types";
import { ReearthApi } from "@web/extensions/sidebar/types";
import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import AccordionComponent from "./AccordionComponent";
import fields from "./Fields";
import {
  ConfigData,
  FieldComponent as FieldComponentType,
  fieldName,
  generalFieldName,
  pointFieldName,
  polygonFieldName,
  polylineFieldName,
  threeDFieldName,
} from "./Fields/types";

export type Props = {
  index?: number;
  field: FieldComponentType;
  dataID?: string;
  isActive: boolean;
  isEditing?: boolean;
  editMode?: boolean;
  templates?: Template[];
  selectGroups?: Group[];
  configData?: ConfigData[];
  onUpdate?: (id: string) => (property: any) => void;
  onRemove?: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onGroupsUpdate?: (groups: Group[], selectedGroup?: string) => void;
  onCurrentGroupUpdate?: (fieldGroupID: string) => void;
  onSceneUpdate?: (updatedProperties: Partial<ReearthApi>) => void;
};

const getFieldGroup = (field: string) => {
  if (field in generalFieldName) {
    return "一般";
  } else if (field in pointFieldName) {
    return "ポイント";
  } else if (field in polygonFieldName) {
    return "ポリゴン";
  } else if (field in threeDFieldName) {
    return "3Dタイル";
  } else if (field in polylineFieldName) {
    return "ポリライン";
  }
};

const FieldComponent: React.FC<Props> = ({
  index,
  field,
  dataID,
  isActive,
  isEditing,
  editMode,
  templates,
  selectGroups,
  configData,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onGroupsUpdate,
  onCurrentGroupUpdate,
  onSceneUpdate,
}) => {
  const Field = fields[field.type];
  const [groupPopupOpen, setGroupPopup] = useState(false);

  const handleGroupSelectOpen = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
      e?.stopPropagation();
      postMsg({
        action: "groupSelectOpen",
        payload: { groups: selectGroups, selected: field.group },
      });
      setGroupPopup(true);
    },
    [field.group, selectGroups],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
      e?.stopPropagation();
      onRemove?.(field.id);
    },
    [field, onRemove],
  );

  const handleUpClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
      e?.stopPropagation();
      if (index !== undefined) onMoveUp?.(index);
    },
    [index, onMoveUp],
  );

  const handleDownClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
      e?.stopPropagation();
      if (index !== undefined) onMoveDown?.(index);
    },
    [index, onMoveDown],
  );

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return;
      if (groupPopupOpen) {
        if (e.data.action === "saveGroups") {
          onGroupsUpdate?.(e.data.payload.groups, e.data.payload.selected);
          setGroupPopup(false);
        } else if (e.data.action === "popupClose") {
          setGroupPopup(false);
        }
      }
    };
    (globalThis as any).addEventListener("message", eventListenerCallback);
    return () => {
      (globalThis as any).removeEventListener("message", eventListenerCallback);
    };
  }, [groupPopupOpen, onGroupsUpdate]);

  const title = useMemo(() => fieldName[field.type], [field]);
  const editModeTitle = useMemo(
    () => `${title}(${getFieldGroup(field.type)})`,
    [field.type, title],
  );

  return !editMode && !isActive ? null : field.type === "template" &&
    Field?.Component &&
    !isEditing ? (
    <Field.Component
      value={{ ...field }}
      editMode={editMode}
      isActive={isActive}
      templates={templates}
      fieldGroups={selectGroups}
      configData={configData}
      dataID={dataID}
      onUpdate={onUpdate?.(field.id)}
      onCurrentGroupUpdate={onCurrentGroupUpdate}
    />
  ) : (
    <AccordionComponent
      id={field.id}
      hasGroup={!!field.group}
      editMode={editMode}
      hasUI={Field?.hasUI}
      showArrowIcon={!!Field}
      title={title}
      editModeTitle={editModeTitle}
      onGroupSelectOpen={handleGroupSelectOpen}
      onRemove={handleRemove}
      onUpClick={handleUpClick}
      onDownClick={handleDownClick}>
      {Field?.Component && (
        <Field.Component
          value={{ ...field }}
          editMode={editMode}
          isActive={isActive}
          templates={templates}
          fieldGroups={selectGroups}
          configData={configData}
          dataID={dataID}
          onUpdate={onUpdate?.(field.id)}
          onCurrentGroupUpdate={onCurrentGroupUpdate}
          onSceneUpdate={onSceneUpdate}
        />
      )}
    </AccordionComponent>
  );
};

export default FieldComponent;
