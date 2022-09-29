import bgmap_darkmatter from "@web/components/common/Icon/Icons/bgmap_darkmatter.svg";
import bgmap_gsi from "@web/components/common/Icon/Icons/bgmap_gsi.svg";
import bgmap_tokyo from "@web/components/common/Icon/Icons/bgmap_tokyo.svg";
import mapBing from "@web/components/common/Icon/Icons/mapBing.svg";
import { styled } from "@web/theme";
import { Checkbox, Divider, Radio, Row, Space, Typography, Button } from "antd";
import React, { memo } from "react";

const MapSettingTab: React.FC = () => {
  console.log(bgmap_darkmatter);
  const { Text, Title } = Typography;
  const mapViewData = ["3D Terrain", "3D smooth", "2D"];
  const baseMapData = [
    {
      key: "1",
      title: "Aerial photography (Bing)",
      icon: mapBing,
    },
    {
      key: "2",
      title: "National latest photo (seamless)",
      icon: bgmap_tokyo,
    },
    {
      key: "3",
      title: "GSI Maps (light color)",
      icon: bgmap_gsi,
    },
    {
      key: "4",
      title: "Dark Matter",
      icon: bgmap_darkmatter,
    },
  ];

  return (
    <Space direction="vertical">
      <Title level={4}>Map setting</Title>
      <Divider />
      <Title level={5}>Map View</Title>
      <MapViewSection>
        <Radio.Group defaultValue="3D Terrain" buttonStyle="solid">
          {mapViewData.map(item => (
            <MapViewButton key={item} value={item} type="primary">
              <Text style={{ color: " #FFFFFF" }}>{item}</Text>
            </MapViewButton>
          ))}
        </Radio.Group>
        <Checkbox>
          <Text>Terrain hides underground features</Text>
        </Checkbox>
      </MapViewSection>
      <Divider />
      <Title level={5}>Base Map</Title>
      <BaseMapSection>
        <Radio.Group defaultValue="1">
          {baseMapData.map(item => (
            <ImageButton
              key={item.key}
              value={item.key}
              type="default"
              style={{
                backgroundImage: "url(" + item.icon + ")",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}
        </Radio.Group>
      </BaseMapSection>
    </Space>
  );
};

export default memo(MapSettingTab);

const MapViewSection = styled(Row)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 296px;
  height: 103px;
`;

const MapViewButton = styled(Button)`
  width: 91px;
  height: 29px;
  border-radius: 4px;
  border-color: #d1d1d1;
  background: #d1d1d1;
  margin: 0px 0px 6px 6px;
  padding: 4px 8px;
`;

const BaseMapSection = styled(Row)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 326px;
  height: 86px;
`;

const ImageButton = styled(Radio.Button)`
  margin: 0px 0px 12px 12px;
  border-radius: 4px;
  background: #d1d1d1;
  padding: 4px 8px;
  width: 64px;
  height: 64px;
`;
