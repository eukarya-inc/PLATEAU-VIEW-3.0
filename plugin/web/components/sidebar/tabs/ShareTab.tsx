import { CopyOutlined } from "@ant-design/icons";
import { styled } from "@web/theme";
import { Button, Divider, Input, Radio, Row, Space, Typography } from "antd";
import React, { memo } from "react";

const PrintMapData = ["Download map ( png )", "Show Print View"];

const ShareTab: React.FC = () => {
  const { Text, Title } = Typography;

  return (
    <Space direction="vertical">
      <Title level={4}>Share / Print</Title>
      <Divider />
      <Title level={5}>Share URL</Title>
      <SectionWrapper>
        <InputGroup compact>
          <Input
            style={{ width: "calc(286px)" }}
            defaultValue="Anyone with this URL will be able to access this map."
          />
          <Button icon={<CopyOutlined />} type="primary" />
          <Text type="secondary">Anyone with this URL will be able to access this map.</Text>
        </InputGroup>
      </SectionWrapper>
      <Divider />
      <Title level={5}>Print Map</Title>
      <SectionWrapper>
        <RadioGroup defaultValue="3D Terrain" buttonStyle="solid">
          {PrintMapData.map(item => (
            <RadioButton key={item} value={item}>
              <Text>{item}</Text>
            </RadioButton>
          ))}
        </RadioGroup>
        <Text type="secondary">Open a printable version of this map.</Text>
      </SectionWrapper>
    </Space>
  );
};
export default memo(ShareTab);

const SectionWrapper = styled(Row)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px 12px;
  gap: 8px;
`;
const InputGroup = styled(Input.Group)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  width: 326px;
  height: 32px;
  gap: 8px;
`;
const RadioGroup = styled(Radio.Group)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;
const RadioButton = styled(Radio.Button)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
`;
