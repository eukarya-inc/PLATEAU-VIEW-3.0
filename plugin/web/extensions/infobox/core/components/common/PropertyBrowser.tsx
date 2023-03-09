import { commonProperties, cesium3DTilesAppearanceKeys } from "@web/extensions/infobox/core/utils";
import type { Properties, Field } from "@web/extensions/infobox/types";
import { styled } from "@web/theme";
import { useState, useEffect } from "react";
import ReactJson from "react-json-view";

type DisplayItem = {
  path: string;
  title: string;
  value?: any;
};

type Props = {
  properties?: Properties;
  fields: Field[];
};

const PropertyBrowser: React.FC<Props> = ({ properties, fields }) => {
  const [displayList, setDisplayList] = useState<DisplayItem[]>([]);

  useEffect(() => {
    const items: DisplayItem[] = [];

    if (!properties) {
      setDisplayList([]);
      return;
    }

    // Part I: fixed properties
    // ------------------------------
    fields.forEach(f => {
      if (f.visible && properties?.[f.path] !== undefined) {
        items.push({
          path: f.path,
          title: f.title ? f.title : f.path,
          value: properties?.[f.path],
        });
      }
    });

    // Part II: flood properties
    // ------------------------------
    // !NOTE: currently appearance override properties
    // are mixed with original properties
    const floorProperties = Object.keys(properties)
      .filter(
        k =>
          !commonProperties.includes(k) &&
          k !== "attributes" &&
          !cesium3DTilesAppearanceKeys.includes(k),
      )
      .reduce((obj, key) => {
        return {
          ...obj,
          [key]: properties[key],
        };
      }, {});

    Object.entries(floorProperties).forEach(([key, value]) => {
      items.push({
        path: key,
        title: key,
        value: value,
      });
    });

    setDisplayList(items);
  }, [fields, properties]);

  return (
    <Wrapper>
      {displayList.map(field => (
        <PropertyItem key={field.path}>
          <Title>{field.title}</Title>
          <Value>{field.value}</Value>
        </PropertyItem>
      ))}
      <AttributesWrapper>
        <ReactJson
          src={properties?.attributes}
          displayDataTypes={false}
          enableClipboard={false}
          displayObjectSize={false}
          indentWidth={2}
          name="attributes"
        />
      </AttributesWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 12px 16px;
  background-color: #fff;
`;

const PropertyItem = styled.div`
  display: flex;
  align-items: flex-start;
  min-height: 32px;
  padding: 12px 0 4px;
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

const AttributesWrapper = styled.div`
  padding: 8px 0;

  * {
    color: #000 !important;
    font-family: "Roboto", sans-serif;
  }
`;

export default PropertyBrowser;
