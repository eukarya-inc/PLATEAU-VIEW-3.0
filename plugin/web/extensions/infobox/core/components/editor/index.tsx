import type { Primitive, PublicSetting, PublicProperty } from "@web/extensions/infobox/types";
import { Collapse, Button } from "@web/sharedComponents";
import { styled } from "@web/theme";
import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { PropertyItem as PropertyItemType } from "./PropertyItem";
import PropertyItem from "./PropertyItem";

type Props = {
  publicSetting: PublicSetting;
  primitives: Primitive[];
  savePublicSetting: (publicSetting: PublicSetting) => void;
};

const Editor: React.FC<Props> = ({ primitives, publicSetting, savePublicSetting, ...props }) => {
  const [propertyList, setPropertyList] = useState<PropertyItemType[]>([]);

  useEffect(() => {
    const proptyItems: PropertyItemType[] = [];
    const primitive = primitives.findLast(p => p.type === publicSetting.type);

    if (!publicSetting || publicSetting.properties.length === 0) {
      primitive?.properties.forEach(pp => {
        proptyItems.push({
          ...pp,
        });
      });
    } else {
      publicSetting.properties.forEach(p => {
        proptyItems.push({
          ...p,
          value: primitive?.properties.find(pp => pp.key === p.key)?.value,
        });
      });
    }

    setPropertyList(proptyItems);
  }, [primitives, publicSetting]);

  const onCheckChange = useCallback((e: any) => {
    setPropertyList(list => {
      const propertyItem = list.find(item => item.key === e.target["data-key"]);
      if (propertyItem) {
        propertyItem.hidden = !e.target.checked;
      }
      return [...list];
    });
  }, []);

  const moveProperty = useCallback((dragIndex: number, hoverIndex: number) => {
    setPropertyList((prevCards: PropertyItemType[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex] as PropertyItemType],
        ],
      }),
    );
  }, []);

  const onSave = useCallback(() => {
    const outputProperties: PublicProperty[] = [];
    propertyList.forEach(p => {
      const property: PublicProperty = {
        key: p.key,
      };
      if (p.title) property.title = p.title;
      if (p.hidden) property.hidden = p.hidden;
      outputProperties.push(property);
    });
    savePublicSetting({
      type: publicSetting.type,
      properties: outputProperties,
    });
  }, [propertyList, publicSetting, savePublicSetting]);

  return (
    <StyledPanel
      header={publicSetting.typeTitle}
      key={publicSetting.type}
      extra={
        <StyledButton size="small" onClick={onSave}>
          保存
        </StyledButton>
      }
      {...props}>
      <Wrapper>
        <PropertyHeader>
          <IconsWrapper />
          <ContentWrapper>
            <JsonPath>JSON Path</JsonPath>
            <Title>Title</Title>
            <Value>Value</Value>
          </ContentWrapper>
        </PropertyHeader>
        <DndProvider backend={HTML5Backend}>
          {propertyList.map((property, index) => (
            <PropertyItem
              id={property.key}
              index={index}
              key={property.key}
              property={property}
              onCheckChange={onCheckChange}
              moveProperty={moveProperty}
            />
          ))}
        </DndProvider>
      </Wrapper>
    </StyledPanel>
  );
};

const StyledPanel = styled(Collapse.Panel)`
  background: #f4f4f4;
  margin-bottom: 6px;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px !important;
  overflow: hidden;
`;

const StyledButton = styled(Button)`
  border-radius: 4px;
  margin-right: 10px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PropertyHeader = styled.div`
  display: flex;
  align-items: flex-start;
  min-height: 32px;
  padding: 4px 0;
  gap: 12px;
  border-bottom: 1px solid #d9d9d9;
  font-size: 14px;
`;

const IconsWrapper = styled.div`
  width: 56px;
  flex-shrink: 0;
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
`;

const JsonPath = styled.div`
  width: 33%;
`;

const Title = styled.div`
  width: 33%;
`;

const Value = styled.div`
  width: 33%;
`;

export default Editor;
