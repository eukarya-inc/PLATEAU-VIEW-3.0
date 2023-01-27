import type { Primitive, PublicSetting } from "@web/extensions/infobox/types";
import { Collapse } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useEffect, useState } from "react";

type Props = {
  key: number;
  primitive: Primitive;
  publicSettings: PublicSetting[];
};

type PropertyItemType = {
  key: string;
  title: string;
  value?: any;
};

const Viewer: React.FC<Props> = ({ primitive, publicSettings, key, ...props }) => {
  const [propertyList, setPropertyList] = useState<PropertyItemType[]>([]);

  useEffect(() => {
    const propertyItem: PropertyItemType[] = [];
    const publicSetting = publicSettings.find(ps => ps.type === primitive.type);
    if (!publicSetting || publicSetting.properties.length === 0) {
      primitive.properties.forEach(property => {
        propertyItem.push({
          ...property,
          title: property.key,
        });
      });
    } else {
      publicSetting.properties
        .filter(psp => !psp.hidden)
        .forEach(property => {
          propertyItem.push({
            key: property.key,
            title: property.title ?? property.key,
            value: primitive.properties.find(pp => pp.key === property.key)?.value,
          });
        });
    }
    setPropertyList(propertyItem);
  }, [primitive, publicSettings]);

  return (
    <StyledPanel
      header={primitive.properties?.find(p => p.key === "建物ID")?.value}
      key={key}
      {...props}>
      <Wrapper>
        {propertyList.map(property => (
          <PropertyItem key={property.key}>
            <Title>{property.title}</Title>
            <Value>{property.value}</Value>
          </PropertyItem>
        ))}
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PropertyItem = styled.div`
  display: flex;
  align-items: flex-start;
  min-height: 32px;
  padding: 4px 0;
  gap: 12px;
  border-bottom: 1px solid #d9d9d9;
  font-size: 14px;
`;

const Title = styled.div`
  width: 50%;
`;

const Value = styled.div`
  width: 50%;
  word-break: break-all;
`;

export default Viewer;
