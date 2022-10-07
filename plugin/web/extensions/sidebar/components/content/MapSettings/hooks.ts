import mapBing from "@web/extensions/sidebar/assets/bgmap_bing.png";
import bgmap_darkmatter from "@web/extensions/sidebar/assets/bgmap_darkmatter.png";
import bgmap_gsi from "@web/extensions/sidebar/assets/bgmap_gsi.png";
import bgmap_tokyo from "@web/extensions/sidebar/assets/bgmap_tokyo.png";
import { ReearthApi } from "@web/extensions/sidebar/types";
import { useCallback, useMemo } from "react";

import { MapViewData, BaseMapData, ViewSelection } from "./types";

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

export default ({ overrides, onOverridesUpdate }: Props) => {
  const {
    default: {
      terrain: currentTerrain,
      sceneMode: currentSceneMode,
      depthTestAgainstTerrain: currentHideUnderground,
    } = {},
    tiles: currentTiles,
  } = overrides;

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

  return {
    mapViewData,
    baseMapData,
    currentView,
    currentTiles,
    currentHideUnderground,
    handleViewChange,
    handleTileChange,
    handleHideUnderGround,
  };
};
