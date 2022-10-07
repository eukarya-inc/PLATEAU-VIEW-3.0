import { Checkbox, Row } from "@web/extensions/sharedComponents";
import mapBing from "@web/extensions/sidebar/assets/bgmap_bing.png";
import bgmap_darkmatter from "@web/extensions/sidebar/assets/bgmap_darkmatter.png";
import bgmap_gsi from "@web/extensions/sidebar/assets/bgmap_gsi.png";
import bgmap_tokyo from "@web/extensions/sidebar/assets/bgmap_tokyo.png";
import CommonPage from "@web/extensions/sidebar/components/content/CommonPage";
import { styled } from "@web/theme";
import { memo, useCallback, useMemo } from "react";

import { ReearthApi } from "../../types";

type TileSelection = "tokyo" | "bing" | "gsi" | "dark-matter";

type ViewSelection = "3d-terrain" | "3d-smooth" | "2d";

type BaseMapData = {
  key: TileSelection;
  url: string;
  title?: string;
  icon?: string;
};

type MapViewData = {
  key: ViewSelection;
  title: string;
};

const mapViewData: MapViewData[] = [
  {
    key: "3d-terrain",
    title: "3D地形",
  },
  { key: "3d-smooth", title: "3D地形なし" },
  { key: "2d", title: "2D" },
];

const baseMapData: BaseMapData[] = [
  {
    key: "tokyo",
    title: "National latest photo (seamless)",
    icon: bgmap_tokyo,
    url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
  },
  {
    key: "bing",
    title: "Aerial photography (Bing)",
    icon: mapBing,
    url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
  },
  {
    key: "gsi",
    title: "GSI Maps (light color)",
    icon: bgmap_gsi,
    url: "https://cyberjapandata.gsi.go.jp/xyz/english/{z}/{x}/{y}.png",
  },
  {
    key: "dark-matter",
    title: "Dark Matter",
    icon: bgmap_darkmatter,
    url: "https://cyberjapandata.gsi.go.jp/xyz/lcm25k_2012/{z}/{x}/{y}.png",
  },
];

export type Props = {
  overrides: ReearthApi;
  onOverridesUpdate: (updatedProperties: Partial<ReearthApi>) => void;
};

const MapSettings: React.FC<Props> = ({ overrides, onOverridesUpdate }) => {
  const {
    default: {
      terrain: currentTerrain,
      sceneMode: currentSceneMode,
      depthTestAgainstTerrain: currentHideUnderground,
    } = {},
    tiles: currentTiles,
  } = overrides;

  // useEffect(() => {
  //   addEventListener("message", (msg: any) => {
  //     if (msg.source !== parent) return;

  //     try {
  //       // const data = typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data;
  //       // setMaps(data);
  //       // postMsg("setTile", data)
  //     } catch (error) {
  //       console.log("error: ", error);
  //     }
  //   });

  //   postMsg("getTiles");
  // }, []);

  const currentView: ViewSelection = useMemo(
    () => (currentSceneMode === "2d" ? "2d" : !currentTerrain ? "3d-smooth" : "3d-terrain"),
    [currentSceneMode, currentTerrain],
  );

  const handleViewChange = useCallback(
    (view: ViewSelection) => {
      let newView: Partial<ReearthApi> = {};
      if (view === "3d-terrain") {
        newView = {
          default: {
            sceneMode: "3d",
            terrain: true,
          },
        };
      } else if (view === "3d-smooth") {
        newView = {
          default: {
            sceneMode: "3d",
            terrain: false,
          },
        };
      } else if (view === "2d") {
        newView = {
          default: {
            sceneMode: "2d",
            terrain: false,
          },
        };
      }
      onOverridesUpdate(newView);
    },
    [onOverridesUpdate],
  );

  const handleTileChange = useCallback(
    (tile: BaseMapData) => {
      onOverridesUpdate({ tiles: [{ id: tile.key, tile_url: tile.url, tile_type: "url" }] });
    },
    [onOverridesUpdate],
  );

  const handleHideUnderGround = useCallback(() => {
    onOverridesUpdate({ default: { depthTestAgainstTerrain: !currentHideUnderground } });
  }, [currentHideUnderground, onOverridesUpdate]);

  return (
    <CommonPage title="マップ設定">
      <>
        <SubTitle>マップビュー</SubTitle>
        <Section>
          <ViewWrapper>
            {mapViewData.map(({ key, title }) => (
              <MapViewButton
                key={key}
                value={key}
                selected={currentView === key}
                onClick={() => handleViewChange(key)}>
                <Text style={{ color: " #FFFFFF" }}>{title}</Text>
              </MapViewButton>
            ))}
          </ViewWrapper>
          <Checkbox checked={!!currentHideUnderground} onClick={handleHideUnderGround}>
            <Text>地下を隠す</Text>
          </Checkbox>
        </Section>
      </>
      <>
        <Title>ベースマップ</Title>
        <Section>
          <MapWrapper>
            {baseMapData.map(item => (
              <ImageButton
                key={item.key}
                selected={item.key === currentTiles?.[0].id}
                onClick={() => handleTileChange(item)}
                style={{
                  backgroundImage: "url(" + item.icon + ")",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ))}
          </MapWrapper>
        </Section>
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

const Section = styled(Row)`
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

const MapWrapper = styled.div`
  display: flex;
  justify-content: start;
  gap: 8px;
  width: 100%;
`;

const ImageButton = styled.div<{ selected?: boolean }>`
  height: 64px;
  width: 64px;
  background: #d1d1d1;
  border: 2px solid ${({ selected }) => (selected ? "#00bebe" : "#d1d1d1")};
  border-radius: 2px;
  padding: 4px 8px;
  cursor: pointer;
`;
