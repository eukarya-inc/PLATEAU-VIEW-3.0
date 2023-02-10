import { Data } from "@web/extensions/sidebar/core/newTypes";
import { postMsg } from "@web/extensions/sidebar/utils";
import { Dropdown, Icon, Menu } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";

import AddButton from "../AddButton";

import Field from "./Field";
import useHooks from "./hooks";

type Tabs = "default" | "edit";

type BaseFieldType = Partial<Data> & {
  title?: string;
  icon?: string;
  value?: string | number;
  onClick?: () => void;
};

export type Props = {
  dataset: Data;
  inEditor?: boolean;
  onDatasetSave: (datasetId: string) => void;
  onRemoveDataset?: (id: string) => void;
  onDatasetUpdate: (dataset: Data) => void;
  onUpdateField?: (id: string) => void;
};
const DatasetCard: React.FC<Props> = ({
  dataset,
  inEditor,
  onDatasetSave,
  onRemoveDataset,
  onDatasetUpdate,
  // onUpdateField,
}) => {
  const [visible, setVisibility] = useState(false);
  const [currentTab, changeTab] = useState<Tabs>("default");

  const { fieldGroups, handleFieldUpdate, handleFieldRemove, handleGroupsUpdate } = useHooks({
    dataset,
    inEditor,
    onDatasetUpdate,
  });

  const baseFields: BaseFieldType[] = useMemo(
    () => [
      {
        id: "zoom",
        title: "カメラ",
        icon: "mapPin",
        value: 1,
        onClick: () => alert("MOVE CAMERA"),
      },
      { id: "about", title: "About Data", icon: "about", value: "www.plateau.org/data-url" },
      { id: "remove", icon: "trash", onClick: () => onRemoveDataset?.(dataset.id) },
    ],
    [dataset, onRemoveDataset],
  );

  const handleTabChange: React.MouseEventHandler<HTMLParagraphElement> = useCallback(e => {
    e.stopPropagation();
    changeTab(e.currentTarget.id as Tabs);
  }, []);

  useEffect(() => {
    setVisibility(dataset.visible ?? false);
  }, [dataset]);

  const handleFieldSave = useCallback(() => {
    if (!inEditor) return;
    onDatasetSave(dataset.id);
  }, [dataset.id, inEditor, onDatasetSave]);

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return;
      if (e.data.action === "fieldGroups") {
        postMsg({ action: "msgToPopup", payload: { groups: dataset.fieldGroups } });
      }
    };
    (globalThis as any).addEventListener("message", eventListenerCallback);
    return () => {
      (globalThis as any).removeEventListener("message", eventListenerCallback);
    };
  });

  const menuGenerator = (menuItems: { [key: string]: any }) => (
    <Menu>
      {Object.keys(menuItems).map(i => {
        if (menuItems[i].fields) {
          return (
            <Menu.Item key={menuItems[i].key}>
              <Dropdown
                overlay={menuGenerator(menuItems[i].fields)}
                placement="bottom"
                trigger={["click"]}>
                <div onClick={e => e.stopPropagation()}>
                  <p style={{ margin: 0 }}>{menuItems[i].name}</p>
                </div>
              </Dropdown>
            </Menu.Item>
          );
        } else {
          return (
            <Menu.Item key={i} onClick={menuItems[i]?.onClick}>
              <p style={{ margin: 0 }}>{menuItems[i].name}</p>
            </Menu.Item>
          );
        }
      })}
    </Menu>
  );

  return (
    <StyledAccordionComponent allowZeroExpanded>
      <AccordionItem>
        <AccordionItemState>
          {({ expanded }) => (
            <Header expanded={expanded}>
              <StyledAccordionItemButton>
                <HeaderContents>
                  <LeftMain>
                    <Icon
                      icon={!visible ? "hidden" : "visible"}
                      size={20}
                      onClick={e => {
                        e?.stopPropagation();
                        setVisibility(!visible);
                      }}
                    />
                    <Title>{dataset.name}</Title>
                  </LeftMain>
                  <ArrowIcon icon="arrowDown" size={16} expanded={expanded} />
                </HeaderContents>
                {inEditor && expanded && (
                  <TabWrapper>
                    <Tab id="default" selected={currentTab === "default"} onClick={handleTabChange}>
                      公開
                    </Tab>
                    <Tab id="edit" selected={currentTab === "edit"} onClick={handleTabChange}>
                      設定
                    </Tab>
                  </TabWrapper>
                )}
              </StyledAccordionItemButton>
            </Header>
          )}
        </AccordionItemState>
        <BodyWrapper>
          <Content>
            {baseFields.map((field, idx) => (
              <BaseField key={idx} onClick={field.onClick}>
                {field.icon && <Icon icon={field.icon} size={20} color="#00BEBE" />}
                {field.title && <FieldName>{field.title}</FieldName>}
              </BaseField>
            ))}
            {dataset.components?.map((c, idx) => (
              <Field
                key={idx}
                field={c}
                editMode={inEditor && currentTab === "edit"}
                selectGroups={dataset.fieldGroups}
                onUpdate={handleFieldUpdate}
                onRemove={handleFieldRemove}
                onGroupsUpdate={handleGroupsUpdate(c.type)}
              />
            ))}
          </Content>
          {inEditor && currentTab === "edit" && (
            <>
              <StyledAddButton text="フィルドを追加" items={menuGenerator(fieldGroups)} />
              <SaveButton onClick={handleFieldSave}>
                <Icon icon="save" size={14} />
                <Text>保存</Text>
              </SaveButton>
            </>
          )}
        </BodyWrapper>
      </AccordionItem>
    </StyledAccordionComponent>
  );
};

export default DatasetCard;

const StyledAccordionComponent = styled(Accordion)`
  width: 100%;
  border-radius: 4px;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.25);
  margin: 8px 0;
  background: #ffffff;
`;

const Header = styled(AccordionItemHeading)<{ expanded?: boolean }>`
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: transparent;
  ${({ expanded }) => expanded && "border-bottom-color: #e0e0e0;"}
`;

const StyledAccordionItemButton = styled(AccordionItemButton)`
  display: flex;
  flex-direction: column;
`;

const HeaderContents = styled.div`
  display: flex;
  align-items: center;
  height: 46px;
  padding: 0 12px;
  outline: none;
  cursor: pointer;
`;

const BodyWrapper = styled(AccordionItemPanel)<{ noTransition?: boolean }>`
  width: 100%;
  border-radius: 0px 0px 4px 4px;
  background: #fafafa;
  padding: 12px;
`;

const LeftMain = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.p`
  margin: 0;
  font-size: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 250px;
  white-space: nowrap;
`;

const Content = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

const BaseField = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex: 1 0 auto;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  cursor: pointer;

  :hover {
    background: #f4f4f4;
  }
`;

const ArrowIcon = styled(Icon)<{ expanded?: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ expanded }) => !expanded && "rotate(90deg)"};
`;

const FieldName = styled.p`
  margin: 0;
`;

const TabWrapper = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 12px;
`;

const Tab = styled.p<{ selected?: boolean }>`
  margin: 0;
  padding: 0 0 10px 0;
  border-bottom-width: 2px;
  border-bottom-style: solid;
  border-bottom-color: ${({ selected }) => (selected ? "#1890FF" : "transparent")};
  color: ${({ selected }) => (selected ? "#1890FF" : "inherit")};
  cursor: pointer;
`;

const StyledAddButton = styled(AddButton)`
  margin-top: 12px;
`;

const SaveButton = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 5px;
  height: 32px;
  cursor: pointer;

  :hover {
    background: #f4f4f4;
  }
`;

const Text = styled.p`
  margin: 0;
  line-height: 15px;
`;

// const StyledDropdownButton = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   width: 100%;
//   align-content: center;
//   padding: 0 16px;
//   cursor: pointer;
// `;
