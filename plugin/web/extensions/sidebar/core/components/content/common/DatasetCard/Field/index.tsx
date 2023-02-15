import { Group } from "@web/extensions/sidebar/core/types";
import { postMsg } from "@web/extensions/sidebar/utils";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";

import fields from "./Fields";
import { FieldComponent as FieldComponentType, fieldName } from "./Fields/types";

export type Props = {
  field: FieldComponentType;
  datasetID: string;
  isActive: boolean;
  editMode?: boolean;
  selectGroups?: Group[];
  onUpdate?: (property: any) => void;
  onRemove: (type: string) => void;
  onGroupsUpdate: (groups: Group[], selectedGroup?: string) => void;
  onCurrentGroupChange: (fieldGroupID: string) => void;
};

const FieldComponent: React.FC<Props> = ({
  field,
  datasetID,
  isActive,
  editMode,
  selectGroups,
  onUpdate,
  onRemove,
  onGroupsUpdate,
  onCurrentGroupChange,
}) => {
  const { Component: FieldContent, hasUI } = fields[field.type];
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
      onRemove?.(field.type);
    },
    [field, onRemove],
  );

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return;
      if (groupPopupOpen) {
        if (e.data.action === "saveGroups") {
          onGroupsUpdate(e.data.payload.groups, e.data.payload.selected);
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

  return !editMode && !isActive ? null : (
    <StyledAccordionComponent
      allowZeroExpanded
      preExpanded={[field.type]}
      hide={!editMode && !hasUI}>
      <AccordionItem uuid={field.type}>
        <AccordionItemState>
          {({ expanded }) => (
            <Header expanded={expanded}>
              {editMode ? (
                <HeaderContents>
                  <LeftContents>
                    <ArrowIcon icon="arrowDown" size={16} direction="right" expanded={expanded} />
                    <Title>{fieldName[field.type]}</Title>
                  </LeftContents>
                  <RightContents>
                    <StyledIcon
                      icon="group"
                      color={field.group ? "#00BEBE" : "inherit"}
                      size={16}
                      onClick={handleGroupSelectOpen}
                    />
                    <StyledIcon icon="trash" size={16} onClick={handleRemove} />
                  </RightContents>
                </HeaderContents>
              ) : (
                <HeaderContents>
                  <Title>{fieldName[field.type]}</Title>
                  <ArrowIcon icon="arrowDown" size={16} direction="left" expanded={expanded} />
                </HeaderContents>
              )}
            </Header>
          )}
        </AccordionItemState>
        <BodyWrapper>
          {FieldContent && (
            <FieldContent
              value={{ ...field }}
              editMode={editMode}
              isActive={isActive}
              fieldGroups={selectGroups}
              datasetID={datasetID}
              onUpdate={onUpdate}
              onCurrentGroupChange={onCurrentGroupChange}
            />
          )}
        </BodyWrapper>
      </AccordionItem>
    </StyledAccordionComponent>
  );
};

export default FieldComponent;

const StyledAccordionComponent = styled(Accordion)<{ hide: boolean }>`
  ${({ hide }) => hide && "display: none;"}
  width: 100%;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  background: #ffffff;
`;

const Header = styled(AccordionItemHeading)<{ expanded?: boolean }>`
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: transparent;
  ${({ expanded }) => expanded && "border-bottom-color: #e0e0e0;"}
  display: flex;
  height: 30px;
`;

const HeaderContents = styled(AccordionItemButton)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding: 0 12px;
  outline: none;
  cursor: pointer;
`;

const BodyWrapper = styled(AccordionItemPanel)`
  border-radius: 0px 0px 4px 4px;
  padding: 12px;
`;

const Title = styled.p`
  margin: 0;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;

const LeftContents = styled.div`
  display: flex;
  align-items: center;
`;

const RightContents = styled.div`
  display: flex;
  gap: 4px;
`;

const ArrowIcon = styled(Icon)<{ direction: "left" | "right"; expanded?: boolean }>`
  transition: transform 0.15s ease;
  ${({ direction, expanded }) =>
    (direction === "right" && !expanded && "transform: rotate(-90deg);") ||
    (direction === "left" && !expanded && "transform: rotate(90deg);") ||
    null}
  ${({ direction }) => (direction === "left" ? "margin: 0 -4px 0 4px;" : "margin: 0 4px 0 -4px;")}
`;
