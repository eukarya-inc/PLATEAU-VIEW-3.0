import { Icon } from "@web/sharedComponents";
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
import { Dataset as DatasetType, BaseField as BaseFieldType } from "../types";

import Field, { Field as FieldType } from "./Field";

export type Dataset = DatasetType;
export type Field = FieldType;

type Tabs = "default" | "edit";

export type Props = {
  dataset: Dataset;
  inEditor?: boolean;
  onRemove?: (id: string) => void;
};

const DatasetCard: React.FC<Props> = ({ dataset, inEditor, onRemove }) => {
  const [visible, setVisibility] = useState(false);
  const [currentTab, changeTab] = useState<Tabs>("default");

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
      { id: "remove", icon: "trash", onClick: () => onRemove?.(dataset.id) },
    ],
    [dataset.id, onRemove],
  );

  const handleTabChange: React.MouseEventHandler<HTMLParagraphElement> = useCallback(e => {
    e.stopPropagation();
    changeTab(e.currentTarget.id as Tabs);
  }, []);

  useEffect(() => {
    setVisibility(dataset.type !== "group" ? !!dataset.visible : false);
  }, [dataset]);

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
            {(
              [
                {
                  id: "legend",
                  icon: undefined,
                  title: "凡例",
                  type: "legend",
                  value: {
                    style: "circle",
                    items: [
                      {
                        title: "An item",
                        color: "#CAD74D",
                        url: "https://uxwing.com/wp-content/themes/uxwing/download/hand-gestures/good-icon.png", // will only show if style is icon
                      },
                      {
                        title: "An item2",
                        color: "purple",
                        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjFMDc3xdT2anLKSofsMQir0NWYJQTjFjln463UQH8rn0c2pIekG0yD31Mp6r1DzC0jmM&usqp=CAU",
                      },
                    ],
                  },
                },
                { id: "camera", icon: undefined, title: "カメラ（カスタム）", type: "idealZoom" },
                {
                  id: "description",
                  icon: undefined,
                  title: "説明",
                  value: `*This is my descripadsfojl.*
                  (c) (C) (r) (R) (tm) (TM) (p) (P) +-
                  [link text](http://google.ca)`,
                  isMarkdown: true,
                  type: "description",
                },
                { id: "template", icon: undefined, title: "Template", type: "template" },
              ] as FieldType[]
            )?.map((field, idx) => (
              <Field key={idx} field={field} editMode={inEditor && currentTab === "edit"} />
            ))}
          </Content>
          {inEditor && currentTab === "edit" && (
            <StyledAddButton text="フィルドを追加" onClick={() => alert("ADDING SOMETHING")} />
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
