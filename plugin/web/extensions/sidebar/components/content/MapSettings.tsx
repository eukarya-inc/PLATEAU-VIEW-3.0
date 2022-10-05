import { Checkbox, Radio, Row } from "@web/extensions/sharedComponents";
import mapBing from "@web/extensions/sidebar/assets/bgmap_bing.png";
import bgmap_darkmatter from "@web/extensions/sidebar/assets/bgmap_darkmatter.png";
import bgmap_gsi from "@web/extensions/sidebar/assets/bgmap_gsi.png";
import bgmap_tokyo from "@web/extensions/sidebar/assets/bgmap_tokyo.png";
import { styled } from "@web/theme";
import { memo, useState } from "react";

import CommonPage from "./CommonPage";

type TileSelection = "tokyo" | "bing" | "gsi" | "dark-matter";

type ViewSelection = "3d-terrain" | "3d-smooth" | "2d";

type BaseMapData = {
  key: TileSelection;
  title: string;
  icon: string;
};

type MapViewData = {
  key: ViewSelection;
  title: string;
};

export function postMsg(act: string, payload?: any) {
  parent.postMessage(
    {
      act,
      payload,
    },
    "*",
  );
}

const mapViewData: MapViewData[] = [
  {
    key: "3d-terrain",
    title: "3D Terrain",
  },
  { key: "3d-smooth", title: "3D smooth" },
  { key: "2d", title: "2D" },
];

const MapSettings: React.FC = () => {
  const [currentTile, selectTile] = useState<TileSelection>("tokyo");
  const [currentView, selectView] = useState<ViewSelection>("3d-terrain");

  // const [currentMaps, setMaps] = useState<[] | undefined>();

  const baseMapData: BaseMapData[] = [
    {
      key: "tokyo",
      title: "National latest photo (seamless)",
      icon: bgmap_tokyo,
    },
    {
      key: "bing",
      title: "Aerial photography (Bing)",
      icon: mapBing,
    },
    {
      key: "gsi",
      title: "GSI Maps (light color)",
      icon: bgmap_gsi,
    },
    {
      key: "dark-matter",
      title: "Dark Matter",
      icon: bgmap_darkmatter,
    },
  ];

  // useEffect(() => {
  //   addEventListener("message", (msg: any) => {
  //     if (msg.source !== parent) return;

  //     try {
  //       const data = typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data;
  //       setMaps(data);
  //       // eslint-disable-next-line no-empty
  //     } catch (error) {}
  //   });
  //   postMsg("getTiles");
  // }, []);

  return (
    <CommonPage title="Map settings">
      <>
        <SubTitle>Map View</SubTitle>
        <MapViewSection>
          {/* <Radio.Group
            options={mapViewData}
            defaultValue="3d-terrain"
            optionType="button"
            buttonStyle="solid"> */}
          <ViewWrapper>
            {mapViewData.map(({ key, title }) => (
              <MapViewButton
                key={key}
                value={key}
                selected={currentView === key}
                onClick={() => selectView(key)}>
                <Text style={{ color: " #FFFFFF" }}>{title}</Text>
              </MapViewButton>
            ))}
          </ViewWrapper>
          {/* </Radio.Group> */}
          <Checkbox>
            <Text>Terrain hides underground features</Text>
          </Checkbox>
        </MapViewSection>
      </>
      <>
        <Title>Base Map</Title>
        <BaseMapSection>
          <Radio.Group defaultValue={currentTile} onChange={e => selectTile(e.target.value)}>
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
      </>
    </CommonPage>
  );
};

export default memo(MapSettings);

const Title = styled.p`
  font-size: 16px;
`;

const SubTitle = styled.p`
  font-size: 14px;
`;

const Text = styled.p``;

const MapViewSection = styled(Row)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
`;

const ViewWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const MapViewButton = styled.button<{ selected?: boolean }>`
  width: 91px;
  height: 29px;
  background: ${({ selected }) => (selected ? "#00bebe" : "#d1d1d1")};
  border-radius: 4px;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: #00bebe;
  }
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
