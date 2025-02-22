import {
  alpha,
  Button,
  Popover,
  styled,
  Divider,
  FormControlLabel,
  Switch,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback, useId, type FC, type ChangeEvent } from "react";

import coloredMapImage from "../../../prototypes/view/assets/colored_map.webp";
import darkMapImage from "../../../prototypes/view/assets/dark_map.webp";
import elevationImage from "../../../prototypes/view/assets/elevation.webp";
import lightMapImage from "../../../prototypes/view/assets/light_map.webp";
import {
  shareableEnvironmentTypeAtom,
  shareableShowMapLabelAtom,
  shareableLogarithmicTerrainElevationAtom,
  shareableTerrainElevationHeightRangeAtom,
  shareableUndergroundAtom,
  shareableColorMode,
} from "../../../shared/states/scene";
import { colorMapTurbo } from "../../color-maps";
import {
  AppIconButton,
  FloatingPanel,
  MapIcon,
  OverlayPopper,
  ParameterList,
  QuantitativeColorLegend,
  SelectItem,
  SliderParameterItem,
  SwitchParameterItem,
  type SelectItemProps,
} from "../../ui-components";

const LegendButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
  height: theme.spacing(5),
  padding: theme.spacing(2),
  paddingTop: theme.spacing(0.5),
  paddingBottom: 0,
}));

const StyledSelectItem = styled(SelectItem)(({ theme }) => ({
  padding: theme.spacing(1),
  "&:first-of-type": {
    marginTop: theme.spacing(1),
  },
  "&:last-of-type": {
    marginBottom: theme.spacing(1),
  },
})) as typeof SelectItem; // For generics

const Image = styled("div")(({ theme }) => ({
  overflow: "hidden",
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  "& img": {
    display: "block",
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  "&:after": {
    content: '""',
    display: "block",
    position: "absolute",
    inset: 0,
    boxShadow: `inset 0 0 0 1px ${alpha("#808080", 0.1)}`,
    borderRadius: theme.shape.borderRadius,
  },
}));

const Label = styled("div")(({ theme }) => ({
  ...theme.typography.body1,
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
}));

const environmentItems = {
  "light-map": {
    image: lightMapImage,
    label: "白地図",
  },
  "dark-map": {
    image: darkMapImage,
    label: "黒地図",
  },
  "colored-map": {
    image: coloredMapImage,
    label: "色付き地図",
  },
  satellite: {
    image: "https://api.plateauview.mlit.go.jp/tiles/plateau-ortho-2023/16/58212/25808.png",
    label: "衛星写真",
  },
  elevation: {
    image: elevationImage,
    label: "標高",
  },
};

const Item: FC<
  SelectItemProps & {
    item: keyof typeof environmentItems;
    selectedItem?: keyof typeof environmentItems;
  }
> = ({ item, selectedItem, ...props }) => (
  <StyledSelectItem {...props} selected={item === selectedItem}>
    <Image>
      <img
        src={environmentItems[item].image}
        alt={environmentItems[item].label}
        width="100%"
        height="100%"
      />
    </Image>
    <Label>{environmentItems[item].label}</Label>
  </StyledSelectItem>
);

const ControlItem = styled("div")(({ theme }) => ({
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const ElevationLegendButton: FC = () => {
  const elevationRange = useAtomValue(shareableTerrainElevationHeightRangeAtom);

  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });

  return (
    <>
      <LegendButton variant="text" {...bindTrigger(popupState)}>
        <QuantitativeColorLegend
          min={elevationRange[0]}
          max={elevationRange[1]}
          colorMap={colorMapTurbo}
          unit="m"
          sx={{ width: 200 }}
        />
      </LegendButton>
      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}>
        <FloatingPanel>
          <ParameterList sx={{ width: 240, marginX: 2, marginY: 1 }}>
            <SliderParameterItem
              label="標高範囲"
              min={-10}
              max={4000}
              step={1}
              range
              unit="m"
              logarithmic
              atom={shareableTerrainElevationHeightRangeAtom}
            />
            <SwitchParameterItem
              label="対数スケール"
              atom={shareableLogarithmicTerrainElevationAtom}
            />
          </ParameterList>
        </FloatingPanel>
      </Popover>
    </>
  );
};

export const EnvironmentSelect: FC = () => {
  // FIXME
  const [environmentType, setEnvironmentType] = useAtom(shareableEnvironmentTypeAtom);
  const [colorMode, setColorMode] = useAtom(shareableColorMode);

  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: `${id}:menu`,
  });
  const popoverProps = bindPopover(popupState);
  const close = popupState.close;

  const handleLightMap = useCallback(() => {
    setEnvironmentType("map");
    setColorMode("light");
    close();
  }, [setEnvironmentType, setColorMode, close]);

  const handleDarkMap = useCallback(() => {
    setEnvironmentType("map");
    setColorMode("dark");
    close();
  }, [setEnvironmentType, setColorMode, close]);

  const handleColoredMap = useCallback(() => {
    setEnvironmentType("colored-map");
    setColorMode("light");
    close();
  }, [setEnvironmentType, setColorMode, close]);

  const handleSatellite = useCallback(() => {
    setEnvironmentType("satellite");
    setColorMode("light");
    close();
  }, [setEnvironmentType, setColorMode, close]);

  const handleElevation = useCallback(() => {
    setEnvironmentType("elevation");
    setColorMode("light");
    close();
  }, [setEnvironmentType, setColorMode, close]);

  const selectedItem =
    environmentType === "map" && colorMode === "light"
      ? "light-map"
      : environmentType === "map" && colorMode === "dark"
      ? "dark-map"
      : environmentType === "colored-map"
      ? "colored-map"
      : environmentType === "satellite"
      ? "satellite"
      : environmentType === "elevation"
      ? "elevation"
      : undefined;

  const [underground, setUnderground] = useAtom(shareableUndergroundAtom);
  const handleUndergroundChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setUnderground((prevValue: any) => ({
        ...prevValue,
        [event.target.name]: checked,
      }));
    },
    [setUnderground],
  );
  const [showMapLabel, setShowMapLabel] = useAtom(shareableShowMapLabelAtom);
  const handleShowMapLabelChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setShowMapLabel((prevValue: any) => ({
        ...prevValue,
        [event.target.name]: checked,
      }));
    },
    [setShowMapLabel],
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));

  return (
    <>
      <AppIconButton
        title="地図"
        selected={popoverProps.open}
        disableTooltip={popoverProps.open}
        {...bindTrigger(popupState)}>
        <MapIcon />
      </AppIconButton>
      {selectedItem === "elevation" && !isMobile && <ElevationLegendButton />}
      <OverlayPopper {...popoverProps} inset={1.5}>
        <FloatingPanel>
          <Item item="light-map" selectedItem={selectedItem} onClick={handleLightMap} />
          <Item item="dark-map" selectedItem={selectedItem} onClick={handleDarkMap} />
          <Item item="colored-map" selectedItem={selectedItem} onClick={handleColoredMap} />
          <Item item="satellite" selectedItem={selectedItem} onClick={handleSatellite} />
          <Item item="elevation" selectedItem={selectedItem} onClick={handleElevation} />
          <Divider />
          {(["hideUnderground", "enterUnderground"] as const).map(name => (
            <ControlItem key={name}>
              <FormControlLabel
                control={
                  <Switch
                    name={name}
                    checked={underground[name]}
                    onChange={handleUndergroundChange}
                  />
                }
                label={
                  {
                    hideUnderground: "地下を隠す",
                    enterUnderground: "地下に入る",
                  }[name]
                }
              />
            </ControlItem>
          ))}
          <Divider />
          {(
            [
              "municipalities",
              "towns",
              "roads",
              "railways",
              "stations",
              "landmarks",
              "topography",
            ] as const
          ).map(name => (
            <ControlItem key={name}>
              <FormControlLabel
                control={
                  <Switch
                    name={name}
                    checked={showMapLabel[name]}
                    onChange={handleShowMapLabelChange}
                  />
                }
                label={
                  {
                    municipalities: "都道府県、市区町村",
                    towns: "町丁字",
                    roads: "道路",
                    railways: "線路",
                    stations: "鉄道駅",
                    landmarks: "建物、ランドマーク",
                    topography: "地形",
                  }[name]
                }
              />
            </ControlItem>
          ))}
        </FloatingPanel>
      </OverlayPopper>
    </>
  );
};
