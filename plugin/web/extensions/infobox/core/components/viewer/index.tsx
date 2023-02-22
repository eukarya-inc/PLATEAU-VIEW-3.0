import type { Feature, Fields } from "@web/extensions/infobox/types";
import { styled } from "@web/theme";
import { useEffect, useState } from "react";

type Props = {
  fields?: Fields;
  feature?: Feature;
  ready: boolean;
  updateSize: () => void;
};

type FieldItemType = {
  path: string;
  title: string;
  value?: any;
};

const Viewer: React.FC<Props> = ({ feature, fields, ready, updateSize }) => {
  const [fieldList, setFieldList] = useState<FieldItemType[]>([]);

  useEffect(() => {
    const fieldItems: FieldItemType[] = [];

    if (!feature) {
      setFieldList([]);
      return;
    }

    if (!fields || !fields.fields || fields.fields?.length === 0) {
      feature.properties.forEach(p => {
        fieldItems.push({
          path: p.key,
          title: p.key,
          value: p.value,
        });
      });
    } else {
      const processedFields: string[] = [];
      fields.fields.forEach(f => {
        if (f.visible) {
          // field may not exist on feature
          const property = feature.properties.find(fp => fp.key === f.path);
          if (property) {
            fieldItems.push({
              path: f.path,
              title: f.title ? f.title : f.path,
              value: property.value,
            });
          }
        }
        processedFields.push(f.path);
      });
      feature.properties
        .filter(fp => !processedFields.includes(fp.key))
        .forEach(fp => {
          fieldItems.push({
            path: fp.key,
            title: fp.key,
            value: fp.value,
          });
        });
    }
    setFieldList(fieldItems);
  }, [feature, fields]);

  useEffect(() => {
    updateSize();
  }, [fieldList, updateSize]);

  return (
    <StyledViewer ready={ready}>
      <Header>
        <ViewerTitle>{fields?.name}</ViewerTitle>
      </Header>
      <Wrapper>
        {fieldList.map(field => (
          <PropertyItem key={field.path}>
            <Title>{field.title}</Title>
            <Value>{field.value}</Value>
          </PropertyItem>
        ))}
      </Wrapper>
    </StyledViewer>
  );
};

const StyledViewer = styled.div<{ ready: boolean }>`
  background: #f4f4f4;
  margin-bottom: 6px;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px !important;
  overflow: hidden;
  opacity: ${({ ready }) => (ready ? 1 : 0.2)};
  transition: all 0.25s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 12px;
`;

const ViewerTitle = styled.div`
  font-size: 16px;
  color: #000;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
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
